#!/usr/bin/env python3
"""LeafOver: a lightweight, Overleaf-inspired LaTeX writing workspace.

The server intentionally stays dependency-free: it watches the paper sources,
compiles in the background, and serves an editable source/PDF workspace.

Usage:  python3 tools/preview_server.py
Env:    PAPER_PREVIEW_PORT (default 8877), PAPER_PREVIEW_HOST (default 127.0.0.1)
"""
import base64
import fcntl
import hashlib
import io
import json
import math
import os
import pty
import re
import secrets
import select
import signal
import shutil
import stat
import struct
import subprocess
import sys
import tempfile
import threading
import time
import termios
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(os.environ.get("LEAFOVER_PROJECT", Path(__file__).resolve().parent.parent / "examples" / "jit")).expanduser().resolve()
TOOLS_DIR = Path(__file__).resolve().parent
PDF_PATH = ROOT / "main.pdf"
SYNCTEX_PATH = ROOT / "main.synctex.gz"
BUILD_DIR = Path(os.environ.get(
    "PAPER_PREVIEW_BUILD_DIR",
    f"{tempfile.gettempdir()}/leafover-build-{hashlib.sha256(str(ROOT).encode()).hexdigest()[:12]}",
))
PDFJS_DIR = TOOLS_DIR / "pdfjs"
XTERM_DIR = TOOLS_DIR / "xterm"
TERMINAL_BASHRC = TOOLS_DIR / "terminal_bashrc.sh"
FIGURES_DIR = ROOT / "figures"
PORT = int(os.environ.get("PAPER_PREVIEW_PORT", "8877"))
BIND = os.environ.get("PAPER_PREVIEW_HOST", "127.0.0.1")
TERMINAL_ENABLED = BIND in {"127.0.0.1", "localhost", "::1"} or os.environ.get("PAPER_PREVIEW_TERMINAL_ALLOW_REMOTE") == "1"
TERMINAL_TOKEN = os.environ.get("PAPER_PREVIEW_TERMINAL_TOKEN", "")
TERMINAL_AUTH_REQUIRED = TERMINAL_ENABLED and bool(TERMINAL_TOKEN)

COMPILE_CMD = ["latexmk", "-xelatex", "-synctex=1", "-interaction=nonstopmode", "-halt-on-error", "-file-line-error", "main.tex"]
ENV = dict(os.environ)
SOURCE_SUFFIXES = {".tex", ".bib", ".bbl", ".sty", ".cls", ".bst", ".md", ".txt", ".json", ".csv", ".yaml", ".yml"}
COMPILE_SUFFIXES = {".tex", ".bib", ".bbl", ".sty", ".cls", ".bst"}
SOURCE_DIRS = ("tables", "sections", "sec", "text", "research", "notes", "configs")
FIG_SUFFIXES = {".pdf", ".png", ".jpg", ".jpeg"}
SOURCE_FILES = ("main.tex", "references.bib")
MAX_SOURCE_BYTES = 2 * 1024 * 1024
MAX_SEARCH_RESULTS = 500
MAX_TERMINAL_BUFFER = 2 * 1024 * 1024
MAX_TERMINAL_READ_BYTES = 128 * 1024
MAX_TERMINAL_SESSIONS = 8
TERMINAL_IDLE_SECONDS = 4 * 60 * 60

_lock = threading.Lock()
_source_lock = threading.Lock()
_terminal_lock = threading.Lock()
_state = {"state": "idle", "log": "", "duration": None, "finished_at": None, "started_at": None}
_g = {"pdf": None, "project": None}
_pdf_snapshot = None
_terminals = {}
_project_settings = {"main_file": "main.tex", "title": "", "compiler": "xelatex"}
COMPILERS = {
    "xelatex": {"label": "XeLaTeX", "flag": "-xelatex", "apt": "texlive-xetex", "tl": "collection-xetex"},
    "pdflatex": {"label": "pdfLaTeX", "flag": "-pdf", "apt": "texlive-latex-base", "tl": "collection-latex"},
    "lualatex": {"label": "LuaLaTeX", "flag": "-lualatex", "apt": "texlive-luatex", "tl": "collection-luatex"},
}
_install_lock = threading.Lock()
_install_state = {"state": "idle", "compiler": None, "error": "", "log": ""}



def mtime(path):
    try:
        return path.stat().st_mtime
    except OSError:
        return None


def read_complete_pdf(path=None):
    path = PDF_PATH if path is None else Path(path)
    try:
        body = path.read_bytes()
    except OSError:
        return None
    if not body.startswith(b"%PDF-") or b"%%EOF" not in body[-1024:]:
        return None
    return body


def _atomic_write(path, body):
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb", dir=path.parent, prefix=f".{path.name}.preview-", suffix=".tmp", delete=False,
        ) as handle:
            temp_path = Path(handle.name)
            handle.write(body)
            handle.flush()
        os.chmod(temp_path, 0o644)
        os.replace(temp_path, path)
    finally:
        if temp_path is not None and temp_path.exists():
            temp_path.unlink()


def promote_build_outputs(pdf_body, synctex_body):
    # Publish SyncTeX first and the PDF last so the PDF mtime is the commit marker.
    _atomic_write(SYNCTEX_PATH, synctex_body)
    _atomic_write(PDF_PATH, pdf_body)


def refresh_pdf_snapshot():
    global _pdf_snapshot
    body = read_complete_pdf()
    if body is None:
        return False
    with _lock:
        _pdf_snapshot = body
    return True


def served_pdf_bytes():
    with _lock:
        body = _pdf_snapshot
    if body is not None:
        return body
    if refresh_pdf_snapshot():
        with _lock:
            return _pdf_snapshot
    return None


def latex_source_archive():
    source_suffixes = SOURCE_SUFFIXES | FIG_SUFFIXES | {".eps", ".svg", ".dat", ".tikz", ".def", ".cfg"}
    excluded_dirs = {".git", "__pycache__", "outputs", "artifacts", "build", "dist", "node_modules"}
    paths = []
    for parent, folders, names in os.walk(ROOT, followlinks=False):
        folders[:] = [name for name in folders if name not in excluded_dirs and not name.startswith(".")
                     and not (Path(parent) / name).is_symlink()]
        for name in names:
            path = Path(parent) / name
            relative = path.relative_to(ROOT)
            if path.is_symlink() or not path.is_file() or name.startswith(".") and name != ".leafover.json":
                continue
            if relative == Path("main.pdf") or name.startswith("core-"):
                continue
            if path.suffix.lower() not in source_suffixes and name != "Makefile":
                continue
            paths.append(path)
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for path in sorted(paths):
            archive.write(path, path.relative_to(ROOT).as_posix())
    return buffer.getvalue()


def scan_sources():
    out = {}
    for path, file_stat in discover_source_files().values():
        out[str(path)] = (file_stat.st_mtime_ns, file_stat.st_size)
    figures = ROOT / "figures"
    if figures.is_dir():
        for path in figures.rglob("*"):
            if path.is_file() and path.suffix.lower() in FIG_SUFFIXES:
                stat = path.stat()
                out[str(path)] = (stat.st_mtime_ns, stat.st_size)
    return out


def compile_inputs(snapshot):
    figure_prefix = str(FIGURES_DIR) + os.sep
    return {name: revision for name, revision in snapshot.items()
            if Path(name).suffix.lower() in COMPILE_SUFFIXES or name.startswith(figure_prefix)}


def _clean_tex(text):
    text = re.sub(r"\\(?:textbf|emph|textit|texttt)\{([^{}]*)\}", r"\1", text)
    text = text.replace("\\&", "&").replace("~", " ")
    return re.sub(r"\\[A-Za-z@]+|[{}]", "", text).strip()


class SourceConflictError(Exception):
    """Raised when an editor tries to overwrite a newer filesystem version."""


def discover_source_files():
    """List editable paper text, excluding generated and heavyweight repository data."""
    files = {}

    def include(path):
        if path.name.startswith("."):
            return
        if path.name != "Makefile" and path.suffix.lower() not in SOURCE_SUFFIXES:
            return
        try:
            file_stat = path.lstat()
        except OSError:
            return
        if not stat.S_ISREG(file_stat.st_mode) or file_stat.st_size > MAX_SOURCE_BYTES:
            return
        files[path.relative_to(ROOT).as_posix()] = (path, file_stat)

    for name in SOURCE_FILES:
        include(ROOT / name)
    for path in sorted(ROOT.iterdir()):
        if path.is_file():
            include(path)
    for directory_name in SOURCE_DIRS:
        directory = ROOT / directory_name
        if not directory.is_dir() or directory.is_symlink():
            continue
        for parent, folders, names in os.walk(directory, followlinks=False):
            folders[:] = [name for name in sorted(folders) if not name.startswith(".") and not (Path(parent) / name).is_symlink()]
            for name in sorted(names):
                include(Path(parent) / name)
    return files


def discover_source_paths():
    return {name: path for name, (path, _) in discover_source_files().items()}


class TerminalSession:
    """A bounded PTY session rooted in the paper directory."""

    def __init__(self, columns=100, rows=28):
        self.lock = threading.Lock()
        self.output_ready = threading.Condition(self.lock)
        self.buffer = bytearray()
        self.base_offset = 0
        self.last_active = time.monotonic()
        master_fd, slave_fd = pty.openpty()
        self.master_fd = master_fd
        self.resize(columns, rows)
        env = dict(
            os.environ,
            TERM="xterm-256color",
            COLORTERM="truecolor",
            CLICOLOR="1",
            CLICOLOR_FORCE="1",
            FORCE_COLOR="1",
        )
        env.pop("NO_COLOR", None)
        shell = os.environ.get("SHELL") or "/bin/bash"
        if not Path(shell).is_file():
            shell = "/bin/bash"
        shell_args = [shell, "-i"]
        if Path(shell).name == "bash" and TERMINAL_BASHRC.is_file():
            shell_args = [shell, "--rcfile", str(TERMINAL_BASHRC), "-i"]
        try:
            self.process = subprocess.Popen(
                shell_args,
                cwd=str(ROOT),
                env=env,
                stdin=slave_fd,
                stdout=slave_fd,
                stderr=slave_fd,
                close_fds=True,
                start_new_session=True,
            )
        finally:
            os.close(slave_fd)
        os.set_blocking(master_fd, False)
        threading.Thread(target=self._reader, daemon=True).start()

    def _reader(self):
        while True:
            try:
                ready, _, _ = select.select([self.master_fd], [], [], 0.5)
                if not ready:
                    if self.process.poll() is not None:
                        break
                    continue
                chunk = os.read(self.master_fd, 65536)
                if not chunk:
                    break
            except (OSError, ValueError):
                break
            with self.output_ready:
                self.buffer.extend(chunk)
                if len(self.buffer) > MAX_TERMINAL_BUFFER:
                    trim = len(self.buffer) - MAX_TERMINAL_BUFFER
                    del self.buffer[:trim]
                    self.base_offset += trim
                self.output_ready.notify_all()
        with self.output_ready:
            self.output_ready.notify_all()

    def touch(self):
        self.last_active = time.monotonic()

    def read(self, offset, wait_seconds=0):
        self.touch()
        requested = max(0, int(offset))
        wait_seconds = max(0, min(25, float(wait_seconds)))
        deadline = time.monotonic() + wait_seconds
        with self.output_ready:
            while requested >= self.base_offset + len(self.buffer) and self.process.poll() is None:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    break
                self.output_ready.wait(remaining)
            truncated = requested < self.base_offset
            start = max(requested, self.base_offset)
            end = self.base_offset + len(self.buffer)
            if start > end:
                start = end
            end = min(end, start + MAX_TERMINAL_READ_BYTES)
            data = bytes(self.buffer[start - self.base_offset:end - self.base_offset])
        return data, end, truncated

    def write(self, data):
        self.touch()
        if self.process.poll() is not None:
            raise BrokenPipeError("terminal process has exited")
        os.write(self.master_fd, data)

    def resize(self, columns, rows):
        columns = max(20, min(400, int(columns)))
        rows = max(4, min(200, int(rows)))
        fcntl.ioctl(self.master_fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, columns, 0, 0))
        self.touch()

    @property
    def alive(self):
        return self.process.poll() is None

    def close(self):
        try:
            if self.process.poll() is None:
                os.killpg(self.process.pid, signal.SIGTERM)
        except (OSError, ProcessLookupError):
            pass
        try:
            os.close(self.master_fd)
        except OSError:
            pass
        with self.output_ready:
            self.output_ready.notify_all()


def _prune_terminals():
    now = time.monotonic()
    expired = []
    with _terminal_lock:
        for session_id, terminal in list(_terminals.items()):
            if now - terminal.last_active > TERMINAL_IDLE_SECONDS:
                expired.append(_terminals.pop(session_id))
    for terminal in expired:
        terminal.close()


def create_terminal(columns=100, rows=28):
    _prune_terminals()
    with _terminal_lock:
        if len(_terminals) >= MAX_TERMINAL_SESSIONS:
            raise RuntimeError("too many terminal sessions")
        session_id = secrets.token_urlsafe(24)
        terminal = TerminalSession(columns, rows)
        _terminals[session_id] = terminal
    return session_id, terminal


def get_terminal(session_id):
    if not isinstance(session_id, str):
        return None
    with _terminal_lock:
        terminal = _terminals.get(session_id)
    if terminal is not None:
        terminal.touch()
    return terminal


def close_terminal(session_id):
    with _terminal_lock:
        terminal = _terminals.pop(session_id, None)
    if terminal is not None:
        terminal.close()
    return terminal is not None


def read_source(name):
    path = discover_source_paths().get(name)
    if path is None:
        raise FileNotFoundError("source file is not available")
    raw = path.read_bytes()
    content = raw.decode("utf-8")
    return {
        "name": name,
        "content": content,
        "lines": len(content.splitlines()) or 1,
        "revision": hashlib.sha256(raw).hexdigest(),
    }


def save_source(name, content, base_revision):
    path = discover_source_paths().get(name)
    if path is None:
        raise FileNotFoundError("source file is not available")
    if not isinstance(content, str) or len(content.encode("utf-8")) > MAX_SOURCE_BYTES:
        raise ValueError("source content is invalid or too large")
    if not isinstance(base_revision, str):
        raise ValueError("base_revision must be a string")

    temp_path = None
    with _source_lock:
        current_revision = hashlib.sha256(path.read_bytes()).hexdigest()
        if base_revision != current_revision:
            raise SourceConflictError("source changed on disk; reload before saving")
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", newline="", dir=path.parent,
                prefix=f".{path.name}.preview-", suffix=".tmp", delete=False,
            ) as handle:
                temp_path = Path(handle.name)
                handle.write(content)
                handle.flush()
                os.fsync(handle.fileno())
            os.chmod(temp_path, path.stat().st_mode & 0o777)
            os.replace(temp_path, path)
        finally:
            if temp_path is not None and temp_path.exists():
                temp_path.unlink()
    return read_source(name)


def search_project(query, case_sensitive=False, whole_word=False, regex=False, current_file=None, current_content=None):
    if not isinstance(query, str) or not query or len(query) > 200:
        raise ValueError("search query must contain between 1 and 200 characters")
    source_paths = discover_source_paths()
    if current_file is not None and current_file not in source_paths:
        raise ValueError("current search file is invalid")
    if current_content is not None:
        if not isinstance(current_content, str) or len(current_content.encode("utf-8")) > MAX_SOURCE_BYTES:
            raise ValueError("current search content is invalid or too large")
    flags = 0 if case_sensitive else re.IGNORECASE
    pattern = query if regex else re.escape(query)
    if whole_word:
        pattern = rf"(?<!\w)(?:{pattern})(?!\w)"
    try:
        matcher = re.compile(pattern, flags)
    except re.error as error:
        raise ValueError(f"invalid regular expression: {error}") from error

    results = []
    total = 0
    for name, path in source_paths.items():
        if name == current_file and current_content is not None:
            content = current_content
        else:
            content = path.read_text(encoding="utf-8", errors="replace")
        for line_number, line in enumerate(content.splitlines(), 1):
            for match in matcher.finditer(line):
                total += 1
                if len(results) < MAX_SEARCH_RESULTS:
                    results.append({
                        "file": name,
                        "line": line_number,
                        "column": match.start(),
                        "end": max(match.end(), match.start() + 1),
                        "preview": line[:1000],
                    })
    return {"results": results, "total": total, "truncated": total > len(results)}


def parse_synctex_output(output):
    fields = {}
    for line in output.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        if key in {"Input", "Line", "Column"} and key not in fields:
            fields[key] = value.strip()
    if "Input" not in fields or "Line" not in fields:
        return None
    input_path = Path(fields["Input"])
    if not input_path.is_absolute():
        input_path = (ROOT / input_path).resolve()
    else:
        input_path = input_path.resolve()
    try:
        name = input_path.relative_to(ROOT.resolve()).as_posix()
        line = int(fields["Line"])
        column = int(fields.get("Column", "-1"))
    except (ValueError, OSError):
        return None
    if name not in discover_source_paths() or line < 1:
        return None
    return {"file": name, "line": line, "column": column}


def synctex_edit(page, x, y):
    if not SYNCTEX_PATH.is_file():
        raise FileNotFoundError("SyncTeX data is unavailable; recompile the paper")
    if not isinstance(page, int) or page < 1 or page > 10000:
        raise ValueError("page is invalid")
    if not all(isinstance(value, (int, float)) and math.isfinite(value) and 0 <= value <= 10000 for value in (x, y)):
        raise ValueError("coordinates are invalid")
    proc = subprocess.run(
        ["synctex", "edit", "-o", f"{page}:{x:.3f}:{y:.3f}:{PDF_PATH.name}"],
        cwd=str(ROOT), capture_output=True, text=True, timeout=5,
    )
    result = parse_synctex_output(proc.stdout)
    if proc.returncode != 0 or result is None:
        raise LookupError("no source location found for this PDF position")
    return result


def compiler_available(compiler):
    return bool(shutil.which(compiler, path=ENV["PATH"]) and shutil.which("latexmk", path=ENV["PATH"]))


def compiler_install_commands(compiler):
    if compiler not in COMPILERS:
        raise ValueError("Unknown compiler")
    config = COMPILERS[compiler]
    tlmgr = shutil.which("tlmgr", path=ENV["PATH"])
    # Debian's tlmgr cannot manage engine binaries; use its native package manager.
    if tlmgr and not str(Path(tlmgr).resolve()).startswith("/usr/share/"):
        return [[tlmgr, "install", config["tl"], "latexmk"]]
    apt = shutil.which("apt-get", path=ENV["PATH"])
    if apt:
        prefix = []
        if os.geteuid() != 0:
            sudo = shutil.which("sudo", path=ENV["PATH"])
            if not sudo:
                raise RuntimeError("Installing TeX requires administrator access")
            prefix = [sudo, "-n"]
        return [[*prefix, apt, "update"],
                [*prefix, apt, "install", "-y", "--no-install-recommends", config["apt"], "latexmk"]]
    raise RuntimeError("One-click installation requires TeX Live or Debian/Ubuntu")


def compiler_status():
    with _install_lock:
        installation = dict(_install_state)
    return {"compilers": [{"id": key, "label": value["label"], "installed": compiler_available(key)}
                          for key, value in COMPILERS.items()], "installation": installation}


def _install_compiler_worker(compiler):
    log = ""
    error = ""
    try:
        for command in compiler_install_commands(compiler):
            result = subprocess.run(command, env=dict(ENV, DEBIAN_FRONTEND="noninteractive"),
                                    stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=900)
            log = (log + result.stdout + "\n" + result.stderr)[-8000:]
            if result.returncode:
                raise RuntimeError("Installation failed; see the installation log")
        if not compiler_available(compiler):
            raise RuntimeError("Installation finished, but the compiler is not available on PATH")
    except subprocess.TimeoutExpired:
        error = "Installation timed out; retry when the package repository is reachable"
    except (OSError, RuntimeError, ValueError) as exception:
        error = str(exception)
    with _install_lock:
        _install_state.update(state="error" if error else "ok", compiler=compiler, error=error, log=log)


def start_compiler_install(compiler):
    if not isinstance(compiler, str) or compiler not in COMPILERS:
        raise ValueError("Unknown compiler")
    with _install_lock:
        if _install_state["state"] == "installing":
            raise RuntimeError("An installation is already running")
        if compiler_available(compiler):
            _install_state.update(state="ok", compiler=compiler, error="", log="")
            return
        # Resolve a fixed, allowlisted command before scheduling the background job.
        compiler_install_commands(compiler)
        _install_state.update(state="installing", compiler=compiler, error="", log="")
    threading.Thread(target=_install_compiler_worker, args=(compiler,), daemon=True).start()


def settings_metadata():
    with _lock:
        settings = dict(_project_settings)
    files = sorted(path.name for path in ROOT.glob("*.tex")
                   if path.is_file() and not path.is_symlink() and not path.name.startswith(("-", ".")))
    return {"settings": settings, "main_files": files, **compiler_status()}


def extract_title(tex):
    """Read a balanced title argument, including optional short titles and comments."""
    tex = re.sub(r"(?<!\\)%[^\n]*", "", tex)
    match = re.search(r"\\title\s*(?:\[[^\]]*\]\s*)?\{", tex)
    if not match:
        return ""
    start = match.end()
    depth = 1
    index = start
    while index < len(tex):
        char = tex[index]
        if char == "\\":
            index += 2
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return " ".join(_clean_tex(tex[start:index].replace("\\\\", " ")).split())
        index += 1
    return ""


def validate_project_settings(payload):
    if not isinstance(payload, dict):
        raise ValueError("Settings must be an object")
    main_file = payload.get("main_file")
    title = payload.get("title", "")
    compiler = payload.get("compiler", "xelatex")
    if not isinstance(compiler, str) or compiler not in COMPILERS:
        raise ValueError("Unknown compiler")
    if not isinstance(main_file, str) or not isinstance(title, str) or len(title) > 200:
        raise ValueError("Invalid main file or title (maximum 200 characters)")
    # Only existing, editable root-level TeX files can be compilation entry points.
    if (Path(main_file).name != main_file or main_file.startswith("-")
            or not main_file.endswith(".tex") or main_file not in discover_source_paths()):
        raise ValueError("Choose an existing .tex file in the project root")
    return {"main_file": main_file, "title": title.strip(), "compiler": compiler}


def apply_project_settings(settings):
    global PDF_PATH, SYNCTEX_PATH, _pdf_snapshot
    _project_settings.update(settings)
    stem = Path(settings["main_file"]).stem
    PDF_PATH = ROOT / (stem + ".pdf")
    SYNCTEX_PATH = ROOT / (stem + ".synctex.gz")
    COMPILE_CMD[-1] = settings["main_file"]
    COMPILE_CMD[1] = COMPILERS[settings["compiler"]]["flag"]
    _pdf_snapshot = None


def load_project_settings():
    path = ROOT / ".leafover.json"
    if path.is_file():
        try:
            apply_project_settings(validate_project_settings(json.loads(path.read_text())))
        except (ValueError, OSError) as error:
            print(f"Ignoring invalid LeafOver settings: {error}", file=sys.stderr)


def save_project_settings(payload):
    settings = validate_project_settings(payload)
    with _lock:
        main_changed = settings["main_file"] != _project_settings["main_file"]
        changed = main_changed or settings["compiler"] != _project_settings["compiler"]
        if changed and not compiler_available(settings["compiler"]):
            raise ValueError("Install the selected compiler first")
        if changed and _state["state"] == "compiling":
            raise RuntimeError("Wait for compilation to finish before changing the main file or compiler")
        _atomic_write(ROOT / ".leafover.json", (json.dumps(settings, ensure_ascii=False, indent=2) + "\n").encode())
        if changed:
            apply_project_settings(settings)
            _g["pdf"] = time.time_ns()
            _state.update(state="compiling", log="", started_at=time.time())
        else:
            _project_settings.update(settings)
        _g["project"] = time.time_ns()
    if changed:
        threading.Thread(target=_compile_worker, daemon=True).start()
    return {"settings": dict(settings), "main_changed": main_changed, "compile_changed": changed}


def project_metadata():
    with _lock:
        settings = dict(_project_settings)
    try:
        tex = (ROOT / settings["main_file"]).read_text(encoding="utf-8", errors="replace")
    except OSError:
        tex = ""
    detected_title = extract_title(tex)
    title = settings["title"] or detected_title or Path(settings["main_file"]).stem
    outline = []
    section_no = 0
    subsection_no = 0
    in_appendix = False
    def visit_outline(source_name, source_text, stack):
        nonlocal section_no, subsection_no, in_appendix
        if len(stack) > 12:
            return
        for line_no, line in enumerate(source_text.splitlines(), 1):
            # Keep source and line of each heading so clicks reach the actual file.
            line = re.sub(r"(?<!\\)%.*$", "", line)
            if re.match(r"\s*\\appendix\b", line):
                in_appendix = True
                section_no = 0
                subsection_no = 0
                continue
            included = re.match(r"\s*\\(?:input|include)\{([^{}]+)\}", line)
            if included:
                candidate = Path(included.group(1))
                if not candidate.suffix:
                    candidate = candidate.with_suffix(".tex")
                included_path = (ROOT / source_name).parent / candidate
                resolved = included_path.resolve()
                if (resolved == ROOT or ROOT not in resolved.parents or included_path.is_symlink()
                        or not resolved.is_file() or resolved.stat().st_size > MAX_SOURCE_BYTES):
                    continue
                relative = resolved.relative_to(ROOT).as_posix()
                if relative not in stack:
                    visit_outline(relative, resolved.read_text(encoding="utf-8", errors="replace"), (*stack, relative))
                continue
            match = re.match(r"\s*\\(section|subsection|subsubsection)(\*)?\{(.+?)\}", line)
            if not match:
                continue
            kind, starred, heading = match.groups()
            if kind == "section":
                if not starred:
                    section_no += 1
                    subsection_no = 0
                number = "" if starred else (chr(64 + section_no) if in_appendix and section_no <= 26 else str(section_no))
                level = 1
            elif kind == "subsection":
                subsection_no += 1
                prefix = chr(64 + section_no) if in_appendix and section_no <= 26 else str(section_no)
                number = f"{prefix}.{subsection_no}"
                level = 2
            else:
                number = ""
                level = 3
            outline.append({"title": _clean_tex(heading), "number": number, "level": level,
                            "file": source_name, "line": line_no})

    visit_outline(settings["main_file"], tex, (settings["main_file"],))

    files = []
    for name, (path, file_stat) in discover_source_files().items():
        raw = path.read_bytes()
        files.append({
            "name": name,
            "size": file_stat.st_size,
            "modified": file_stat.st_mtime,
            "revision": hashlib.sha256(raw).hexdigest(),
        })
    figures = []
    for path in sorted(FIGURES_DIR.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in FIG_SUFFIXES:
            continue
        stat = path.stat()
        figures.append({
            "name": path.relative_to(FIGURES_DIR).as_posix(),
            "size": stat.st_size,
            "type": path.suffix.lower().removeprefix("."),
            "revision": f"{stat.st_mtime_ns}:{stat.st_size}",
        })
    return {
        "title": title,
        "detected_title": detected_title,
        "settings": settings,
        "terminal_enabled": TERMINAL_ENABLED,
        "terminal_auth_required": TERMINAL_AUTH_REQUIRED,
        "outline": outline,
        "files": files,
        "figures": figures,
        "figure_count": len(figures),
        "draft": {
            "todo": max(0, len(re.findall(r"\\draftnote\{", tex)) - 1),
            "evidence": max(0, len(re.findall(r"\\evidence\{", tex)) - 1),
            "citations": max(0, len(re.findall(r"\\refneeded\{", tex)) - 1),
        },
    }


def _compile_worker():
    started = time.monotonic()
    try:
        BUILD_DIR.mkdir(parents=True, exist_ok=True)
        build_pdf = BUILD_DIR / PDF_PATH.name
        build_synctex = BUILD_DIR / SYNCTEX_PATH.name
        command = [*COMPILE_CMD[:-1], f"-outdir={BUILD_DIR}", COMPILE_CMD[-1]]
        proc = subprocess.run(command, cwd=str(ROOT), env=ENV, capture_output=True, text=True, timeout=300)
        log = proc.stdout + "\n" + proc.stderr
        if proc.returncode == 0 and not build_synctex.is_file():
            forced_command = [*command[:-1], "-g", command[-1]]
            proc = subprocess.run(forced_command, cwd=str(ROOT), env=ENV, capture_output=True, text=True, timeout=300)
            log += "\nSyncTeX output was missing; forced a full rebuild.\n" + proc.stdout + "\n" + proc.stderr
        complete_pdf = read_complete_pdf(build_pdf) if proc.returncode == 0 else None
        ok = proc.returncode == 0 and build_synctex.is_file() and complete_pdf is not None
        if proc.returncode == 0 and not build_synctex.is_file():
            log += "\nCompilation finished, but SyncTeX output was not generated.\n"
        if proc.returncode == 0 and complete_pdf is None:
            log += "\nCompilation finished, but the PDF is incomplete. The previous preview was preserved.\n"
        if ok:
            promote_build_outputs(complete_pdf, build_synctex.read_bytes())
    except subprocess.TimeoutExpired:
        ok = False
        log = "Compile timed out after 300 seconds."
    except OSError as error:
        ok = False
        log = f"Could not publish the compiled PDF: {error}"
    duration = time.monotonic() - started
    with _lock:
        _state.update(state="ok" if ok else "error", log=log[-16000:], duration=round(duration, 1), finished_at=time.time())
        if ok:
            global _pdf_snapshot
            _pdf_snapshot = complete_pdf
            _g["pdf"] = mtime(PDF_PATH) or _g["pdf"]


def start_compile():
    refresh_pdf_snapshot()
    with _lock:
        if _state["state"] == "compiling":
            return False
        _state["state"] = "compiling"
        _state["log"] = ""
        _state["started_at"] = time.time()
    threading.Thread(target=_compile_worker, daemon=True).start()
    return True


def watcher():
    sources = scan_sources()
    compilation_sources = compile_inputs(sources)
    has_pdf = refresh_pdf_snapshot()
    with _lock:
        _g["pdf"] = mtime(PDF_PATH)
        _g["project"] = time.time_ns()
    if not has_pdf:
        start_compile()
    last_change = None
    while True:
        time.sleep(0.4)
        current = scan_sources()
        if current != sources:
            sources = current
            current_compilation_sources = compile_inputs(current)
            if current_compilation_sources != compilation_sources:
                last_change = time.time()
                compilation_sources = current_compilation_sources
            with _lock:
                _g["project"] = time.time_ns()
        pdf_mtime = mtime(PDF_PATH)
        with _lock:
            compiling = _state["state"] == "compiling"
            pdf_changed = pdf_mtime is not None and pdf_mtime != _g["pdf"] and not compiling
        if pdf_changed and refresh_pdf_snapshot():
            with _lock:
                _g["pdf"] = pdf_mtime
        if last_change and not compiling and time.time() - last_change >= 0.8:
            last_change = None
            start_compile()


MIME = {
    ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8", ".json": "application/json",
    ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
}


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send_bytes(self, code, body, content_type, **headers):
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for name, value in headers.items():
            self.send_header(name.replace("_", "-"), value)
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, payload, code=200):
        self._send_bytes(code, json.dumps(payload, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

    def _read_json(self, max_bytes=128 * 1024):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > max_bytes:
            raise ValueError("request body is invalid or too large")
        return json.loads(self.rfile.read(length))

    def _require_terminal(self):
        if not TERMINAL_ENABLED:
            self._send_json({"error": "terminal is available only on a loopback-bound preview server"}, 403)
            return False
        if TERMINAL_AUTH_REQUIRED and not secrets.compare_digest(
            self.headers.get("X-LeafOver-Terminal-Token", ""), TERMINAL_TOKEN
        ):
            self._send_json({"error": "terminal access key required"}, 401)
            return False
        return True

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/":
            self._send_bytes(200, (TOOLS_DIR / "preview_app.html").read_bytes(), "text/html; charset=utf-8")
            return
        if path in {"/app.css", "/app.js", "/leafover-logo.svg"}:
            file_path = TOOLS_DIR / path[1:]
            content_type = "image/svg+xml" if path.endswith(".svg") else MIME[file_path.suffix]
            self._send_bytes(200, file_path.read_bytes(), content_type)
            return
        if path == "/favicon.ico":
            self._send_bytes(204, b"", "image/x-icon")
            return
        if path in {"/pdf", "/download"}:
            body = served_pdf_bytes()
            if body is None:
                self._send_bytes(404, b"PDF not compiled yet", "text/plain; charset=utf-8")
                return
            headers = {"Content_Disposition": 'attachment; filename="leafover-paper.pdf"'} if path == "/download" else {}
            self._send_bytes(200, body, "application/pdf", **headers)
            return
        if path == "/download-source":
            try:
                body = latex_source_archive()
            except OSError as error:
                self._send_json({"error": str(error)}, 500)
                return
            self._send_bytes(
                200, body, "application/zip",
                Content_Disposition='attachment; filename="paper-latex-source.zip"',
            )
            return
        if path.startswith("/pdfjs/"):
            file_path = (PDFJS_DIR / path.removeprefix("/pdfjs/")).resolve()
            if PDFJS_DIR.resolve() not in file_path.parents or not file_path.is_file():
                self._send_bytes(404, b"not found", "text/plain")
                return
            self._send_bytes(200, file_path.read_bytes(), MIME.get(file_path.suffix, "application/octet-stream"))
            return
        if path.startswith("/xterm/"):
            file_path = (XTERM_DIR / path.removeprefix("/xterm/")).resolve()
            if XTERM_DIR.resolve() not in file_path.parents or not file_path.is_file():
                self._send_bytes(404, b"not found", "text/plain")
                return
            self._send_bytes(200, file_path.read_bytes(), MIME.get(file_path.suffix, "application/octet-stream"))
            return
        if path == "/api/settings":
            self._send_json(settings_metadata())
            return
        if path == "/api/compilers":
            self._send_json(compiler_status())
            return
        if path == "/api/project":
            self._send_json(project_metadata())
            return
        if path == "/api/source":
            name = parse_qs(parsed.query).get("file", [_project_settings["main_file"]])[0]
            try:
                payload = read_source(name)
            except (OSError, UnicodeError):
                self._send_json({"error": "source file not found"}, 404)
                return
            self._send_json(payload)
            return
        if path == "/api/figure":
            name = parse_qs(parsed.query).get("file", [""])[0]
            figure_path = (FIGURES_DIR / name).resolve()
            if FIGURES_DIR.resolve() not in figure_path.parents or figure_path.suffix.lower() not in FIG_SUFFIXES or not figure_path.is_file():
                self._send_json({"error": "figure file is not available"}, 404)
                return
            self._send_bytes(200, figure_path.read_bytes(), MIME[figure_path.suffix.lower()])
            return
        if path == "/api/synctex":
            query = parse_qs(parsed.query)
            try:
                page = int(query.get("page", [""])[0])
                x = float(query.get("x", [""])[0])
                y = float(query.get("y", [""])[0])
                payload = synctex_edit(page, x, y)
            except (ValueError, TypeError) as error:
                self._send_json({"error": str(error)}, 400)
                return
            except FileNotFoundError as error:
                self._send_json({"error": str(error)}, 409)
                return
            except (LookupError, subprocess.SubprocessError) as error:
                self._send_json({"error": str(error)}, 404)
                return
            self._send_json(payload)
            return
        if path == "/api/terminal/output":
            if not self._require_terminal():
                return
            query = parse_qs(parsed.query)
            terminal = get_terminal(query.get("session", [None])[0])
            if terminal is None:
                self._send_json({"error": "terminal session not found"}, 404)
                return
            try:
                offset = int(query.get("offset", ["0"])[0])
                wait_seconds = query.get("wait", ["0"])[0]
                data, next_offset, truncated = terminal.read(offset, wait_seconds)
            except (TypeError, ValueError):
                self._send_json({"error": "terminal offset is invalid"}, 400)
                return
            self._send_json({
                "data": base64.b64encode(data).decode("ascii"),
                "offset": next_offset,
                "truncated": truncated,
                "alive": terminal.alive,
            })
            return
        if path == "/poll":
            with _lock:
                payload = dict(
                    _state,
                    pdf=_g["pdf"],
                    project=_g["project"],
                    synctex=SYNCTEX_PATH.is_file(),
                )
                if payload["state"] == "compiling" and payload.get("started_at"):
                    payload["elapsed"] = round(time.time() - payload["started_at"])
            self._send_json(payload)
            return
        self._send_bytes(404, b"not found", "text/plain")

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/compilers/install":
            try:
                request = self._read_json()
                if not isinstance(request, dict):
                    raise ValueError("Invalid installation request")
                start_compiler_install(request.get("compiler"))
            except RuntimeError as error:
                self._send_json({"error": str(error)}, 409)
                return
            except (ValueError, TypeError, OSError) as error:
                self._send_json({"error": str(error)}, 400)
                return
            self._send_json(compiler_status(), 202)
            return
        if path == "/api/settings":
            try:
                result = save_project_settings(self._read_json())
            except RuntimeError as error:
                self._send_json({"error": str(error)}, 409)
                return
            except (ValueError, TypeError, OSError) as error:
                self._send_json({"error": str(error)}, 400)
                return
            self._send_json(result)
            return
        if path.startswith("/api/terminal/"):
            if not self._require_terminal():
                return
            try:
                request = self._read_json()
                if path == "/api/terminal/start":
                    session_id, terminal = create_terminal(request.get("columns", 100), request.get("rows", 28))
                    self._send_json({"session": session_id, "alive": terminal.alive, "cwd": str(ROOT)}, 201)
                    return
                session_id = request.get("session")
                terminal = get_terminal(session_id)
                if terminal is None:
                    self._send_json({"error": "terminal session not found"}, 404)
                    return
                if path == "/api/terminal/input":
                    data = request.get("data")
                    if not isinstance(data, str) or len(data.encode("utf-8")) > 65536:
                        raise ValueError("terminal input is invalid or too large")
                    terminal.write(data.encode("utf-8"))
                    self._send_json({"ok": True, "alive": terminal.alive})
                    return
                if path == "/api/terminal/resize":
                    terminal.resize(request.get("columns"), request.get("rows"))
                    self._send_json({"ok": True})
                    return
                if path == "/api/terminal/stop":
                    close_terminal(session_id)
                    self._send_json({"ok": True})
                    return
                self._send_json({"error": "terminal action not found"}, 404)
                return
            except json.JSONDecodeError:
                self._send_json({"error": "request body must be JSON"}, 400)
                return
            except BrokenPipeError as error:
                self._send_json({"error": str(error)}, 409)
                return
            except (ValueError, TypeError, OSError, RuntimeError) as error:
                self._send_json({"error": str(error)}, 400)
                return
        if path == "/compile":
            length = int(self.headers.get("Content-Length") or 0)
            if length:
                self.rfile.read(length)
            started = start_compile()
            self._send_json({"state": "compiling", "started": started}, 202)
            return
        if path == "/api/search":
            try:
                request = self._read_json(max_bytes=MAX_SOURCE_BYTES * 2)
                payload = search_project(
                    request.get("query"),
                    request.get("case_sensitive", False) is True,
                    request.get("whole_word", False) is True,
                    request.get("regex", False) is True,
                    request.get("current_file"),
                    request.get("current_content"),
                )
            except json.JSONDecodeError:
                self._send_json({"error": "request body must be JSON"}, 400)
                return
            except (ValueError, OSError, UnicodeError) as error:
                self._send_json({"error": str(error)}, 400)
                return
            self._send_json(payload)
            return
        if path == "/api/source":
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0 or length > MAX_SOURCE_BYTES * 2:
                self._send_json({"error": "request body is invalid or too large"}, 413)
                return
            try:
                request = json.loads(self.rfile.read(length))
                payload = save_source(request.get("name"), request.get("content"), request.get("base_revision"))
            except json.JSONDecodeError:
                self._send_json({"error": "request body must be JSON"}, 400)
                return
            except SourceConflictError as error:
                self._send_json({"error": str(error)}, 409)
                return
            except FileNotFoundError as error:
                self._send_json({"error": str(error)}, 404)
                return
            except (ValueError, TypeError, OSError, UnicodeError) as error:
                self._send_json({"error": str(error)}, 400)
                return
            self._send_json(payload)
            return
        self._send_bytes(404, b"not found", "text/plain")

    def log_message(self, fmt, *args):
        if self.path == "/poll" or self.path.startswith("/api/terminal/output"):
            return
        sys.stderr.write("[%s] %s\n" % (time.strftime("%H:%M:%S"), fmt % args))


def main():
    load_project_settings()
    threading.Thread(target=watcher, daemon=True).start()
    server = ThreadingHTTPServer((BIND, PORT), Handler)
    server.daemon_threads = True
    print(f"paper preview: http://{BIND}:{PORT}/  (root: {ROOT})")
    print("watching: paper sources and figures -> background latexmk + live reload")
    print(f"terminal: {'enabled' if TERMINAL_ENABLED else 'disabled (bind to loopback or opt in explicitly)'}")
    try:
        server.serve_forever()
    finally:
        with _terminal_lock:
            terminals = list(_terminals.values())
            _terminals.clear()
        for terminal in terminals:
            terminal.close()


if __name__ == "__main__":
    main()

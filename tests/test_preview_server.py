import importlib.util
import io
import tempfile
import threading
import time
import unittest
import zipfile
from email.message import Message
from pathlib import Path


SERVER_PATH = Path(__file__).resolve().parents[1] / "tools" / "preview_server.py"
SPEC = importlib.util.spec_from_file_location("paper_preview_server", SERVER_PATH)
preview_server = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(preview_server)


class TerminalAccessTest(unittest.TestCase):
    def test_terminal_key_is_optional_and_restricts_requests_when_set(self):
        old_values = (preview_server.TERMINAL_ENABLED, preview_server.TERMINAL_AUTH_REQUIRED,
                      preview_server.TERMINAL_TOKEN)
        preview_server.TERMINAL_ENABLED = True
        preview_server.TERMINAL_TOKEN = "a-test-terminal-token"
        try:
            for required, supplied, allowed in (
                (False, None, True), (True, None, False),
                (True, "wrong-token", False), (True, "a-test-terminal-token", True),
            ):
                preview_server.TERMINAL_AUTH_REQUIRED = required
                handler = preview_server.Handler.__new__(preview_server.Handler)
                handler.headers = Message()
                if supplied:
                    handler.headers["X-LeafOver-Terminal-Token"] = supplied
                replies = []
                handler._send_json = lambda payload, status=200: replies.append((status, payload))
                self.assertIs(handler._require_terminal(), allowed)
                self.assertEqual(replies, [] if allowed else [(401, {"error": "terminal access key required"})])
        finally:
            (preview_server.TERMINAL_ENABLED, preview_server.TERMINAL_AUTH_REQUIRED,
             preview_server.TERMINAL_TOKEN) = old_values


class SourceEditingTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        self.figures = self.root / "figures"
        self.figures.mkdir()
        self.old_root = preview_server.ROOT
        self.old_figures = preview_server.FIGURES_DIR
        self.old_source_files = preview_server.SOURCE_FILES
        preview_server.ROOT = self.root
        preview_server.FIGURES_DIR = self.figures
        preview_server.SOURCE_FILES = ("main.tex",)
        (self.root / "main.tex").write_text("\\title{Draft}\\author{}\n\\section{Intro}\n", encoding="utf-8")

    def tearDown(self):
        preview_server.ROOT = self.old_root
        preview_server.FIGURES_DIR = self.old_figures
        preview_server.SOURCE_FILES = self.old_source_files
        self.temp_dir.cleanup()

    def test_save_preserves_newer_external_edits(self):
        initial = preview_server.read_source("main.tex")
        saved = preview_server.save_source("main.tex", "first browser edit\n", initial["revision"])
        self.assertEqual((self.root / "main.tex").read_text(encoding="utf-8"), "first browser edit\n")
        self.assertNotEqual(saved["revision"], initial["revision"])

        with self.assertRaises(preview_server.SourceConflictError):
            preview_server.save_source("main.tex", "stale browser edit\n", initial["revision"])
        self.assertEqual((self.root / "main.tex").read_text(encoding="utf-8"), "first browser edit\n")

    def test_source_allowlist_rejects_path_traversal(self):
        with self.assertRaises(FileNotFoundError):
            preview_server.read_source("../secret.tex")
        with self.assertRaises(FileNotFoundError):
            preview_server.save_source("../secret.tex", "x", 1)

    def test_project_metadata_lists_supported_figures(self):
        (self.figures / "diagram.png").write_bytes(b"png")
        (self.figures / "notes.txt").write_text("ignore", encoding="utf-8")
        metadata = preview_server.project_metadata()
        self.assertEqual([item["name"] for item in metadata["figures"]], ["diagram.png"])
        self.assertEqual(metadata["figure_count"], 1)
        self.assertRegex(metadata["figures"][0]["revision"], r"^\d+:3$")

    def test_source_scan_detects_new_nested_figure(self):
        before = preview_server.scan_sources()
        nested = self.figures / "results"
        nested.mkdir()
        image = nested / "comparison.png"
        image.write_bytes(b"png")

        after = preview_server.scan_sources()

        self.assertNotEqual(before, after)
        self.assertIn(str(image), after)

        before_update = after
        image.write_bytes(b"larger png")
        after_update = preview_server.scan_sources()
        self.assertNotEqual(before_update, after_update)

    def test_source_scan_and_metadata_track_editable_markdown(self):
        preview_server.SOURCE_FILES = ("main.tex", "main_zh.md")
        markdown = self.root / "main_zh.md"
        markdown.write_text("first draft\n", encoding="utf-8")

        before = preview_server.scan_sources()
        metadata = preview_server.project_metadata()
        markdown_file = next(item for item in metadata["files"] if item["name"] == "main_zh.md")
        self.assertRegex(markdown_file["revision"], r"^[0-9a-f]{64}$")

        markdown.write_text("updated draft with more text\n", encoding="utf-8")
        after = preview_server.scan_sources()
        updated = preview_server.project_metadata()
        updated_file = next(item for item in updated["files"] if item["name"] == "main_zh.md")

        self.assertNotEqual(before, after)
        self.assertNotEqual(markdown_file["revision"], updated_file["revision"])

    def test_project_discovers_and_edits_nested_paper_sources(self):
        (self.root / "extra.tex").write_text("extra source\n", encoding="utf-8")
        table_dir = self.root / "tables" / "results"
        table_dir.mkdir(parents=True)
        table = table_dir / "table.tex"
        table.write_text("old table\n", encoding="utf-8")
        research = self.root / "research"
        research.mkdir()
        (research / "notes.md").write_text("paper note\n", encoding="utf-8")

        files = {item["name"] for item in preview_server.project_metadata()["files"]}
        self.assertTrue({"extra.tex", "tables/results/table.tex", "research/notes.md"} <= files)
        before = preview_server.scan_sources()
        initial = preview_server.read_source("tables/results/table.tex")
        preview_server.save_source("tables/results/table.tex", "new table\n", initial["revision"])
        self.assertEqual(table.read_text(encoding="utf-8"), "new table\n")
        self.assertNotEqual(before, preview_server.scan_sources())
        self.assertIn("tables/results/table.tex", {item["file"] for item in preview_server.search_project("new table")["results"]})

        with self.assertRaises(FileNotFoundError):
            preview_server.read_source("tables/../../secret.tex")

    def test_notes_refresh_file_list_without_triggering_latex_compile(self):
        figure = self.figures / "plot.png"
        figure.write_bytes(b"png")
        note = self.root / "research" / "draft.md"
        note.parent.mkdir()
        note.write_text("draft\n", encoding="utf-8")
        snapshot = preview_server.scan_sources()
        compiling = preview_server.compile_inputs(snapshot)

        self.assertIn(str(self.root / "main.tex"), compiling)
        self.assertIn(str(figure), compiling)
        self.assertNotIn(str(note), compiling)
        note.write_text("updated draft\n", encoding="utf-8")
        self.assertNotEqual(snapshot, preview_server.scan_sources())
        self.assertEqual(compiling, preview_server.compile_inputs(preview_server.scan_sources()))

    def test_synctex_output_maps_only_editable_project_sources(self):
        output = f"""SyncTeX result begin
Output:main.pdf
Input:{self.root / 'main.tex'}
Line:42
Column:7
SyncTeX result end
"""
        self.assertEqual(
            preview_server.parse_synctex_output(output),
            {"file": "main.tex", "line": 42, "column": 7},
        )
        outside = output.replace(str(self.root / "main.tex"), "/tmp/outside.tex")
        self.assertIsNone(preview_server.parse_synctex_output(outside))

    def test_successful_compile_forces_rebuild_when_synctex_is_missing(self):
        old_pdf = preview_server.PDF_PATH
        old_synctex = preview_server.SYNCTEX_PATH
        old_build_dir = preview_server.BUILD_DIR
        old_state = dict(preview_server._state)
        old_global = dict(preview_server._g)
        old_snapshot = preview_server._pdf_snapshot
        preview_server.PDF_PATH = self.root / "main.pdf"
        preview_server.SYNCTEX_PATH = self.root / "main.synctex.gz"
        preview_server.BUILD_DIR = self.root / "build"
        calls = []

        def fake_run(command, **_kwargs):
            calls.append(command)
            if "-g" in command:
                preview_server.BUILD_DIR.mkdir(exist_ok=True)
                (preview_server.BUILD_DIR / "main.pdf").write_bytes(b"%PDF-1.5\ncompiled\n%%EOF\n")
                (preview_server.BUILD_DIR / "main.synctex.gz").write_bytes(b"synctex")
            return preview_server.subprocess.CompletedProcess(command, 0, "compiled", "")

        original_run = preview_server.subprocess.run
        preview_server.subprocess.run = fake_run
        try:
            preview_server._compile_worker()
            self.assertEqual(len(calls), 2)
            self.assertNotIn("-g", calls[0])
            self.assertIn("-g", calls[1])
            self.assertIn(f"-outdir={preview_server.BUILD_DIR}", calls[0])
            self.assertEqual(preview_server._state["state"], "ok")
            self.assertTrue(preview_server.SYNCTEX_PATH.is_file())
            self.assertEqual(preview_server.PDF_PATH.read_bytes(), b"%PDF-1.5\ncompiled\n%%EOF\n")
        finally:
            preview_server.subprocess.run = original_run
            preview_server.PDF_PATH = old_pdf
            preview_server.SYNCTEX_PATH = old_synctex
            preview_server.BUILD_DIR = old_build_dir
            preview_server._state.clear()
            preview_server._state.update(old_state)
            preview_server._g.clear()
            preview_server._g.update(old_global)
            preview_server._pdf_snapshot = old_snapshot

    def test_pdf_snapshot_hides_incomplete_compile_output(self):
        old_pdf = preview_server.PDF_PATH
        old_snapshot = preview_server._pdf_snapshot
        preview_server.PDF_PATH = self.root / "main.pdf"
        complete = b"%PDF-1.5\nprevious complete preview\n%%EOF\n"
        try:
            preview_server.PDF_PATH.write_bytes(complete)
            self.assertTrue(preview_server.refresh_pdf_snapshot())
            preview_server.PDF_PATH.write_bytes(b"%PDF-1.5\npartial output")

            self.assertIsNone(preview_server.read_complete_pdf())
            self.assertEqual(preview_server.served_pdf_bytes(), complete)
        finally:
            preview_server.PDF_PATH = old_pdf
            preview_server._pdf_snapshot = old_snapshot

    def test_latex_source_archive_contains_sources_without_build_output(self):
        (self.root / "references.bib").write_text("@article{paper, title={Paper}}\n", encoding="utf-8")
        (self.root / "conference.sty").write_text("% style\n", encoding="utf-8")
        (self.root / "Makefile").write_text("all:\n\ttrue\n", encoding="utf-8")
        (self.root / "main.pdf").write_bytes(b"compiled output")
        (self.root / "core-browser").write_bytes(b"core dump")
        (self.figures / "plot.png").write_bytes(b"image")
        tables = self.root / "tables"
        tables.mkdir()
        (tables / "results.tex").write_text("table\n", encoding="utf-8")
        configs = self.root / "configs"
        configs.mkdir()
        (configs / "cvpr.sty").write_text("% template\n", encoding="utf-8")
        samples = self.root / "selected_images"
        samples.mkdir()
        (samples / "result.jpg").write_bytes(b"jpg")
        (self.root / ".leafover.json").write_text("{}\n", encoding="utf-8")

        with zipfile.ZipFile(io.BytesIO(preview_server.latex_source_archive())) as archive:
            names = set(archive.namelist())

        self.assertIn("main.tex", names)
        self.assertIn("references.bib", names)
        self.assertIn("conference.sty", names)
        self.assertIn("Makefile", names)
        self.assertIn("figures/plot.png", names)
        self.assertIn("tables/results.tex", names)
        self.assertIn("configs/cvpr.sty", names)
        self.assertIn("selected_images/result.jpg", names)
        self.assertIn(".leafover.json", names)
        self.assertNotIn("main.pdf", names)
        self.assertNotIn("core-browser", names)

    def test_project_search_supports_options_and_unsaved_content(self):
        preview_server.SOURCE_FILES = ("main.tex", "notes.tex")
        (self.root / "main.tex").write_text("Flow flowchart FLOW\n", encoding="utf-8")
        (self.root / "notes.tex").write_text("A grouped flow model\n", encoding="utf-8")

        whole_word = preview_server.search_project("flow", case_sensitive=True, whole_word=True)
        self.assertEqual(whole_word["total"], 1)
        self.assertEqual(whole_word["results"][0]["file"], "notes.tex")
        self.assertEqual(whole_word["results"][0]["column"], 10)

        unsaved = preview_server.search_project(
            r"new\s+result", regex=True, current_file="main.tex", current_content="A new result lives here\n"
        )
        self.assertEqual(unsaved["total"], 1)
        self.assertEqual(unsaved["results"][0]["file"], "main.tex")

        with self.assertRaisesRegex(ValueError, "invalid regular expression"):
            preview_server.search_project("[", regex=True)

    def test_terminal_starts_in_paper_root(self):
        terminal = preview_server.TerminalSession(columns=80, rows=24)
        try:
            terminal.write(b"printf '__PAPER_CWD__%s\\n' \"$PWD\"\n")
            terminal.write(
                b"printf '__COLOR_ENV__%s:%s:%s:%s\\n' "
                b"\"${NO_COLOR-unset}\" \"$FORCE_COLOR\" "
                b"\"$CLICOLOR_FORCE\" \"$TERM\"\n"
            )
            output = b""
            deadline = time.monotonic() + 3
            while (
                b"__PAPER_CWD__" not in output
                or str(self.root).encode() not in output
                or b"__COLOR_ENV__unset:1:1:xterm-256color" not in output
            ):
                if time.monotonic() >= deadline:
                    self.fail(f"terminal did not report its environment: {output!r}")
                time.sleep(0.05)
                output, _, _ = terminal.read(0)
            self.assertIn(f"__PAPER_CWD__{self.root}".encode(), output)
            self.assertIn(b"__COLOR_ENV__unset:1:1:xterm-256color", output)
        finally:
            terminal.close()

    def test_terminal_read_wakes_as_soon_as_output_arrives(self):
        terminal = preview_server.TerminalSession(columns=80, rows=24)
        try:
            time.sleep(0.1)
            _, offset, _ = terminal.read(0)
            writer = threading.Timer(0.05, terminal.write, args=(b"printf '__WAKE__\\n'\n",))
            writer.start()
            started = time.monotonic()
            output, _, _ = terminal.read(offset, wait_seconds=1)
            elapsed = time.monotonic() - started
            writer.join()
            self.assertIn(b"__WAKE__", output)
            self.assertLess(elapsed, 0.5)
        finally:
            terminal.close()

    def test_embedded_codex_preserves_terminal_scrollback(self):
        stub_dir = self.root / "bin"
        stub_dir.mkdir()
        stub = stub_dir / "codex"
        stub.write_text("#!/bin/sh\nprintf '__CODEX_ARGS__%s\\n' \"$*\"\n", encoding="utf-8")
        stub.chmod(0o755)
        terminal = preview_server.TerminalSession(columns=80, rows=24)
        try:
            terminal.write(f"PATH={stub_dir}:$PATH codex resume test-session\n".encode())
            deadline = time.monotonic() + 3
            output = b""
            while b"__CODEX_ARGS__" not in output:
                if time.monotonic() >= deadline:
                    self.fail(f"Codex stub did not run: {output!r}")
                time.sleep(0.05)
                output, _, _ = terminal.read(0)
            self.assertIn(b"__CODEX_ARGS__--no-alt-screen resume test-session", output)
        finally:
            terminal.close()

    def test_terminal_read_caps_each_browser_chunk(self):
        terminal = preview_server.TerminalSession.__new__(preview_server.TerminalSession)
        terminal.lock = threading.Lock()
        terminal.output_ready = threading.Condition(terminal.lock)
        payload = b"x" * (preview_server.MAX_TERMINAL_READ_BYTES + 4096)
        terminal.buffer = bytearray(payload)
        terminal.base_offset = 0
        terminal.last_active = time.monotonic()
        terminal.process = type("RunningProcess", (), {"poll": lambda self: None})()

        first, offset, truncated = terminal.read(0)
        second, final_offset, _ = terminal.read(offset)

        self.assertFalse(truncated)
        self.assertEqual(len(first), preview_server.MAX_TERMINAL_READ_BYTES)
        self.assertEqual(first + second, payload)
        self.assertEqual(final_offset, len(payload))


if __name__ == "__main__":
    unittest.main()

# LeafOver

A local LaTeX workspace with a live PDF preview, source editing, search, SyncTeX
navigation and an embedded terminal. Python standard library only; browser assets
are bundled, with no frontend build or CDN required.

## Run

Requirements: Python 3.10+, Linux or macOS, and a TeX distribution with `latexmk`
and at least one of XeLaTeX, pdfLaTeX or LuaLaTeX.

```bash
python3 scripts/fetch_jit.py
python3 run.py
```

Open http://127.0.0.1:8877/. Use the gear to select the main file, compiler and title.
Missing compilers can be installed from the settings dialog on supported systems;
see [compiler management](tools/LEAFOVER.md).

The example is the original TeX source of [JiT — Back to Basics: Let Denoising
Generative Models Denoise](https://arxiv.org/abs/2511.13720v2) by Tianhong Li and
Kaiming He. It is imported into `examples/jit/` from the pinned arXiv v2 source.
If arXiv blocks your network, download its [source archive](https://arxiv.org/src/2511.13720v2)
elsewhere and import it with:

```bash
python3 scripts/fetch_jit.py --archive /path/to/arxiv-source.tar.gz
```

To open your own project or use a different port:

```bash
python3 run.py /path/to/latex-project --port 8878
```

Choose **Recompile** for the first PDF. Later source changes automatically compile.
The default bind address is localhost. The app edits files and can run terminal
commands; keep it local, or place it behind authenticated access. Remote binding
disables the terminal unless explicitly enabled through the existing
`PAPER_PREVIEW_TERMINAL_ALLOW_REMOTE=1` option.

## Features

- Source editor, multiple tabs, autosave and conflict detection
- Live PDF preview, clickable references and PDF-to-source navigation
- Project, source and PDF search
- Persistent project settings and three LaTeX engines
- Dark/light themes, accent colors and Chinese/English interface
- Embedded terminal and source/PDF export

## Layout

```text
run.py                 Launcher; accepts any local paper directory
tools/                Server, interface and bundled browser libraries
tests/                Backend and interaction regression checks
scripts/fetch_jit.py   Original arXiv source downloader/importer
examples/jit/         JiT example project, separate from application code
```

## Development

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node tests/check_settings_latency.js
```

Node.js is only needed for the JavaScript regression test. The app itself has no
Node.js or pip dependencies. Build outputs and caches are excluded from Git.

## Attribution

LeafOver code is MIT licensed. Third-party browser libraries and the JiT paper
retain their own licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

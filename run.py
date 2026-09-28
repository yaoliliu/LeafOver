#!/usr/bin/env python3
"""Run LeafOver against the bundled JiT example or any local LaTeX project."""
import argparse
import os
from pathlib import Path
import runpy

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LeafOver — a local LaTeX workspace")
    parser.add_argument("project", nargs="?", type=Path, default=Path(__file__).resolve().parent / "examples" / "jit")
    parser.add_argument("--port", type=int, default=8877)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()
    project = args.project.expanduser().resolve()
    if not project.is_dir() or not any(project.glob("*.tex")):
        parser.error("Project must contain a TeX source file")
    os.environ.update(LEAFOVER_PROJECT=str(project), PAPER_PREVIEW_PORT=str(args.port), PAPER_PREVIEW_HOST=args.host)
    runpy.run_path(str(Path(__file__).resolve().parent / "tools" / "preview_server.py"), run_name="__main__")

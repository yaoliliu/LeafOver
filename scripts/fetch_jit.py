#!/usr/bin/env python3
"""Fetch the pinned, original JiT TeX submission from arXiv (or import its archive)."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import tarfile
import tempfile
import urllib.error
import urllib.request

PAPER_ID = "2511.13720v2"
SOURCE_URL = f"https://arxiv.org/src/{PAPER_ID}"
DEFAULT_DEST = Path(__file__).resolve().parents[1] / "examples" / "jit"


def unpack_source(archive, destination):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive, "r:*") as bundle:
        members = bundle.getmembers()
        if len(members) > 5000 or sum(member.size for member in members) > 512 * 1024 * 1024:
            raise ValueError("Source archive exceeds the import limit")
        for member in members:
            name = PurePosixPath(member.name)
            if name.is_absolute() or ".." in name.parts or ".git" in name.parts:
                raise ValueError(f"Unsafe archive path: {member.name}")
            if member.isdir():
                continue
            if not member.isfile():
                raise ValueError(f"Unsupported archive entry: {member.name}")
            target = destination.joinpath(*name.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with bundle.extractfile(member) as source, target.open("wb") as output:
                shutil.copyfileobj(source, output)
    candidates = []
    for path in destination.rglob("*.tex"):
        text = re.sub(r"(?<!\\)%[^\n]*", "", path.read_text(errors="replace"))
        if re.search(r"\\documentclass(?:\[.*?\])?\{", text):
            candidates.append(path)
    if not candidates:
        raise ValueError("No LaTeX document found in the source archive")
    candidates.sort(key=lambda path: (path.name != "main.tex", len(path.parts), str(path)))
    return candidates[0]


def install_source(archive, destination):
    destination = Path(destination).resolve()
    # Never overwrite an edited example when rerunning the downloader.
    if destination.exists() and any(destination.iterdir()):
        raise ValueError(f"Destination is not empty: {destination}. Choose --destination for a fresh copy.")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".jit-import-", dir=destination.parent) as folder:
        stage = Path(folder) / "source"
        main = unpack_source(archive, stage)
        if main.parent != stage:
            children = list(stage.iterdir())
            if len(children) != 1 or not children[0].is_dir():
                raise ValueError("Main file is nested; import requires a root-level compilation entry point")
            stage = main.parent
        settings = {"main_file": main.name, "title": "", "compiler": "pdflatex"}
        (stage / ".leafover.json").write_text(json.dumps(settings, indent=2) + "\n")
        provenance = {"paper": "Back to Basics: Let Denoising Generative Models Denoise", "authors": ["Tianhong Li", "Kaiming He"],
                      "arxiv_id": PAPER_ID, "source_url": SOURCE_URL,
                      "license": "https://creativecommons.org/licenses/by/4.0/",
                      "archive_sha256": hashlib.sha256(Path(archive).read_bytes()).hexdigest(),
                      "changes": "Original paper files unchanged; added LeafOver settings and provenance."}
        (stage / "SOURCE.json").write_text(json.dumps(provenance, indent=2) + "\n")
        if destination.exists():
            destination.rmdir()
        shutil.copytree(stage, destination)
    return destination / settings["main_file"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, help="Import an arXiv source archive already downloaded locally")
    parser.add_argument("--destination", type=Path, default=DEFAULT_DEST)
    args = parser.parse_args()
    try:
        if args.archive:
            entry = install_source(args.archive, args.destination)
        else:
            with tempfile.TemporaryDirectory(prefix="leafover-download-") as folder:
                archive = Path(folder) / "jit.tar"
                request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "LeafOver/1.0 (JiT example downloader)"})
                with urllib.request.urlopen(request, timeout=60) as response, archive.open("wb") as output:
                    shutil.copyfileobj(response, output)
                entry = install_source(archive, args.destination)
        print(f"JiT source ready: {entry}")
    except (OSError, ValueError, tarfile.TarError, urllib.error.URLError) as error:
        parser.exit(1, f"Cannot import JiT: {error}\nDownload {SOURCE_URL} and use --archive /path/to/archive to retry.\n")


if __name__ == "__main__":
    main()

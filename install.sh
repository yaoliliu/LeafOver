#!/usr/bin/env bash
# Install the TeX tools needed by the bundled JiT example, then start LeafOver.
set -euo pipefail

repo_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
cd "$repo_dir"

check_only=0
install_only=0
run_args=()
for arg in "$@"; do
  case "$arg" in
    --check) check_only=1 ;;
    --install-only) install_only=1 ;;
    *) run_args+=("$arg") ;;
  esac
done

if ! command -v python3 >/dev/null 2>&1 || ! python3 -c 'import sys; sys.exit(sys.version_info < (3, 10))'; then
  echo 'LeafOver requires Python 3.10 or newer.' >&2
  exit 1
fi

check_deps() {
  missing=()
  for executable in latexmk pdflatex kpsewhich; do
    command -v "$executable" >/dev/null 2>&1 || missing+=("$executable")
  done
  if command -v kpsewhich >/dev/null 2>&1; then
    for package in orcidlink.sty adjustbox.sty pgffor.sty textpos.sty silence.sty subcaption.sty wrapfig.sty threeparttable.sty bm.sty; do
      kpsewhich "$package" >/dev/null 2>&1 || missing+=("$package")
    done
  fi
}
check_deps

if (( check_only )); then
  if (( ${#missing[@]} )); then
    printf 'Missing TeX dependencies: %s\n' "${missing[*]}" >&2
    exit 1
  fi
  echo 'LeafOver dependencies are ready.'
  exit 0
fi

if (( ${#missing[@]} )); then
  printf 'Installing TeX dependencies: %s\n' "${missing[*]}"
  case "$(uname -s)" in
    Linux)
      if ! command -v apt-get >/dev/null 2>&1; then
        echo 'Automatic TeX installation supports Debian/Ubuntu. Install TeX Live and latexmk, then rerun this script.' >&2
        exit 1
      fi
      if (( EUID == 0 )); then
        apt_command=(apt-get)
      elif command -v sudo >/dev/null 2>&1; then
        apt_command=(sudo apt-get)
      else
        echo 'Installing TeX packages requires root access or sudo.' >&2
        exit 1
      fi
      "${apt_command[@]}" update
      "${apt_command[@]}" install -y --no-install-recommends \
        latexmk texlive-latex-base texlive-latex-recommended \
        texlive-latex-extra texlive-pictures texlive-fonts-recommended
      ;;
    Darwin)
      if ! command -v brew >/dev/null 2>&1; then
        echo 'Install Homebrew first, then rerun this script to install MacTeX.' >&2
        exit 1
      fi
      brew install --cask mactex-no-gui
      export PATH="/Library/TeX/texbin:$PATH"
      ;;
    *)
      echo 'Automatic TeX installation supports Debian/Ubuntu and macOS.' >&2
      exit 1
      ;;
  esac
  check_deps
  if (( ${#missing[@]} )); then
    printf 'TeX installation finished, but these dependencies are still missing: %s\n' "${missing[*]}" >&2
    exit 1
  fi
fi

echo 'LeafOver is ready.'
if (( install_only )); then
  exit 0
fi
exec python3 "$repo_dir/run.py" "${run_args[@]}"

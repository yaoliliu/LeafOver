# LeafOver project settings

The gear opens immediately using cached values. `GET /api/settings` refreshes only
root-level TeX filenames, project settings and compiler availability; it does not
hash source files, enumerate figures or refresh the editor.

`.leafover.json` stores `main_file`, `title` (empty means automatic), and `compiler`
(`xelatex`, `pdflatex`, or `lualatex`). The default compiler is XeLaTeX. Switching
engines or main files triggers compilation. An active compilation must finish
before either can change.

## Compiler installation

Availability requires both the selected engine and `latexmk` on the server PATH.
The Install button starts an asynchronous server job and polls its status. Failed
jobs expose a bounded log and can be retried. Only the three listed engines and
fixed package names are accepted; no shell commands come from request data.

- Standalone TeX Live uses `tlmgr install` for the engine collection and `latexmk`.
  The server account needs write access to that TeX Live installation.
- Debian/Ubuntu uses `apt-get update` followed by installation of the corresponding
  engine package and `latexmk`. The server must run as root or have noninteractive
  sudo permission. It never prompts for or accepts a password in the browser.
- Other environments report the unsupported installation method; existing engines
  on PATH still work. Installation also needs network access to package repositories.

TeX Live package management reference: [official tlmgr documentation](https://www.tug.org/texlive/doc/tlmgr.html).

Checks: `python -m unittest discover -s tests -p 'test_preview*.py'` and
`node tests/check_settings_latency.js` from the paper repository.

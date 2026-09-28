# Paper workspace interactive shell styling.
# Keep the user's aliases and environment setup, then apply a compact prompt
# designed for the embedded dark terminal.
if [[ -f ~/.bashrc ]]; then
  source ~/.bashrc
fi

unset NO_COLOR
export CLICOLOR=1
export CLICOLOR_FORCE=1
export FORCE_COLOR=1
export GREP_COLORS='ms=01;38;5;203:mc=01;38;5;203:sl=:cx=:fn=38;5;75:ln=38;5;245:bn=38;5;245:se=38;5;245'

if command -v dircolors >/dev/null 2>&1; then
  eval "$(dircolors -b)"
fi
alias ls='ls --color=auto'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# Codex's alternate screen has no xterm scrollback in the embedded terminal.
# Inline mode keeps wheel scrolling available while Codex is running.
unalias codex 2>/dev/null || true
codex() {
  command codex --no-alt-screen "$@"
}

# Green environment, blue directory name, and a clean second-line prompt keep
# the embedded view compact. The window title still carries host + full path.
PS1='\[\e]0;\u@\h: \w\a\]\[\e[38;5;108m\]${CONDA_PROMPT_MODIFIER}\[\e[38;5;75m\]\W\[\e[0m\]\n\[\e[38;5;114m\]❯\[\e[0m\] '
PS2='\[\e[38;5;245m\]·\[\e[0m\] '

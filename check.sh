#!/usr/bin/env bash
# Diagnostics ("doctor") for this Übersicht widget. Read-only: it checks setup
# and prints pass/fail per item so you can see exactly why a widget is blank.
#
# Usage:  ./check.sh
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG="$HOME/.config/widgetsuite"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
pass() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$*"; }
NAME="$(basename "$(/bin/ls -d "$DIR"/*.widget 2>/dev/null | head -1)")"
echo "Checking ${NAME:-widget}"
if [ -d "$WIDGETS" ]; then pass "Übersicht widgets folder found"; else fail "Übersicht widgets folder missing ($WIDGETS) — install Übersicht"; fi
if [ -n "${NAME:-}" ] && [ -d "$WIDGETS/$NAME" ]; then pass "$NAME is installed"; else warn "$NAME not copied into Übersicht yet — run ./install.sh"; fi
if pgrep -x "Übersicht" >/dev/null 2>&1; then pass "Übersicht is running"; else warn "Übersicht is not running"; fi
if command -v python3 >/dev/null 2>&1; then pass "python3 found ($(python3 --version 2>&1))"; else fail "python3 not found — install Xcode Command Line Tools or Homebrew python"; fi
n=$(ls "$HOME"/.claude/projects/*/*.jsonl 2>/dev/null | wc -l | tr -d ' '); if [ "$n" -gt 0 ]; then pass "$n Claude Code session logs found"; else warn "no Claude Code logs under ~/.claude/projects (sample data will show)"; fi
m=$(ls "$HOME"/.codex/sessions/*/*/*/*.jsonl 2>/dev/null | wc -l | tr -d ' '); if [ "$m" -gt 0 ]; then pass "$m Codex session logs found"; else warn "no Codex logs (optional)"; fi
if python3 "$DIR/setup/fleet.py" >/dev/null 2>&1; then pass "helper runs"; else fail "helper failed — run: python3 setup/fleet.py"; fi

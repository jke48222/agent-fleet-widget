# agent-fleet: setup

Nothing to configure. The widget reads `~/.claude/projects/*/*.jsonl` and
`~/.codex/sessions/**/*.jsonl` and writes two small files under
`~/.config/widgetsuite/`: `fleet-cache.json` (per-file token counters) and
`fleet.json` (the latest summary, read by the Window Pet widget).

See the [README](../README.md) for what the widget shows and how it decides.

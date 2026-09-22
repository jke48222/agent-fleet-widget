# agent-fleet: troubleshooting

Run `./check.sh` first; it prints a pass/fail line per item.

- **Sample data never goes away.** The helper found no logs. Check `ls ~/.claude/projects` and that `python3` runs from a login shell; Übersicht runs commands through your shell.
- **A finished session says "running".** Its log is still being appended (hooks, summaries). It flips to "needs you" or "paused" within a couple of minutes.
- **"needs you" for a session I closed.** The status also requires a live `claude` process; quit the terminal that ran it and it becomes "paused".
- **Totals look too big.** They include cache reads and writes, which is what the usage limits count. Output tokens are shown separately.
- Test the helper directly: `python3 setup/fleet.py | python3 -m json.tool`.

#!/usr/bin/env python3
# agent-fleet helper: every coding-agent session on this Mac, from the logs the
# agents already write. Read-only. Prints one JSON object and mirrors it to
# ~/.config/widgetsuite/fleet.json so other widgets (the pet) can read it.
import os, sys, json, time, glob, subprocess, datetime
HOME = os.path.expanduser("~"); NOW = time.time()
CFG = os.path.join(HOME, ".config", "widgetsuite"); os.makedirs(CFG, exist_ok=True)
CACHE = os.path.join(CFG, "fleet-cache.json"); OUT = os.path.join(CFG, "fleet.json")
TODAY = time.strftime("%Y-%m-%d"); DAY0 = time.mktime(time.strptime(TODAY, "%Y-%m-%d"))
try: cache = json.load(open(CACHE))
except Exception: cache = {}

def iso(ts):
    try: return datetime.datetime.strptime(ts[:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=datetime.timezone.utc).timestamp()
    except Exception: return None
def short_model(m):
    if not m: return ""
    m = m.replace("claude-", "").replace("-20251001", "")
    parts = m.split("-"); name = parts[0].capitalize()
    ver = ".".join(p for p in parts[1:] if p.isdigit())
    return (name + " " + ver).strip()
def read_tail(p, n=96 * 1024):
    with open(p, "rb") as f:
        f.seek(0, 2); sz = f.tell(); f.seek(max(0, sz - n)); data = f.read()
    lines = data.decode("utf-8", "replace").split("\n")
    return lines[1:] if sz > n else lines
def read_head(p, n=64 * 1024):
    with open(p, "rb") as f: data = f.read(n)
    return data.decode("utf-8", "replace").split("\n")
def text_of(content):
    if isinstance(content, str): return content
    if isinstance(content, list):
        for b in content:
            if isinstance(b, dict) and b.get("type") == "text" and b.get("text"): return b["text"]
    return ""

claude_procs = 0
try:
    ps = subprocess.run(["ps", "-axo", "command"], capture_output=True, text=True, timeout=3).stdout
    claude_procs = sum(1 for l in ps.split("\n") if "/claude" in l and "MacOS/claude" in l or l.strip().startswith("claude"))
    codex_procs = sum(1 for l in ps.split("\n") if "codex" in l.lower() and "Codex Framework" not in l and "ChatGPT.app" not in l)
except Exception: codex_procs = 0

sessions = []; tok_in = tok_out = 0
for p in glob.glob(os.path.join(HOME, ".claude", "projects", "*", "*.jsonl")):
    try:
        st = os.stat(p)
    except OSError: continue
    if st.st_size == 0 or NOW - st.st_mtime > 24 * 3600: continue
    key = p; c = cache.get(key) or {}
    if c.get("day") != TODAY: c = {"size": 0, "in": 0, "out": 0, "turns": 0, "day": TODAY, "first": None}
    if st.st_size > c["size"]:
        with open(p, "rb") as f: f.seek(c["size"]); chunk = f.read().decode("utf-8", "replace")
        for line in chunk.split("\n"):
            if '"usage"' in line and '"assistant"' in line:
                try: o = json.loads(line)
                except Exception: continue
                t = iso(o.get("timestamp", "")) or 0
                u = (o.get("message") or {}).get("usage") or {}
                c["turns"] += 1
                if t >= DAY0:
                    c["in"] += int(u.get("input_tokens", 0) or 0) + int(u.get("cache_creation_input_tokens", 0) or 0) + int(u.get("cache_read_input_tokens", 0) or 0)
                    c["out"] += int(u.get("output_tokens", 0) or 0)
        c["size"] = st.st_size
    cache[key] = c; tok_in += c["in"]; tok_out += c["out"]

    tail = read_tail(p); recs = []
    for line in reversed(tail):
        line = line.strip()
        if not line: continue
        try: recs.append(json.loads(line))
        except Exception: continue
        if len(recs) >= 80: break
    if not recs: continue
    last_asst = next((r for r in recs if r.get("type") == "assistant"), None)
    last_user = next((r for r in recs if r.get("type") == "user"), None)
    last_prompt = next((r.get("lastPrompt") for r in recs if r.get("type") == "last-prompt"), None)
    any_rec = next((r for r in recs if r.get("cwd")), recs[0])
    cwd = any_rec.get("cwd") or ""; branch = any_rec.get("gitBranch") or ""
    sid = any_rec.get("sessionId") or os.path.basename(p)[:8]
    title = None
    for line in read_head(p):
        if '"custom-title"' in line or '"ai-title"' in line:
            try: o = json.loads(line)
            except Exception: continue
            if o.get("type") == "custom-title" and o.get("customTitle"): title = o["customTitle"]; break
            if o.get("type") == "ai-title" and o.get("aiTitle") and not title: title = o["aiTitle"]
    for r in recs:  # a later title in the tail wins
        if r.get("type") == "custom-title" and r.get("customTitle"): title = r["customTitle"]; break
        if r.get("type") == "ai-title" and r.get("aiTitle"): title = r["aiTitle"]; break
    if not title and last_prompt: title = last_prompt
    if not title and last_user: title = text_of((last_user.get("message") or {}).get("content"))
    title = " ".join((title or "Untitled session").split())[:90]
    if c.get("first") is None:
        first = None
        for line in read_head(p, 16 * 1024):
            if '"timestamp"' not in line: continue
            try: first = iso(json.loads(line).get("timestamp", ""))
            except Exception: first = None
            if first: break
        c["first"] = first
    model = short_model(((last_asst or {}).get("message") or {}).get("model"))
    usage = ((last_asst or {}).get("message") or {}).get("usage") or {}
    ctx = int(usage.get("input_tokens", 0) or 0) + int(usage.get("cache_creation_input_tokens", 0) or 0) + int(usage.get("cache_read_input_tokens", 0) or 0)
    mraw = (((last_asst or {}).get("message") or {}).get("model") or "").lower()
    window = 1000000 if ("1m" in mraw or "-5" in mraw) else 200000
    if ctx > window: window = 1000000
    tool = ""
    for b in (((last_asst or {}).get("message") or {}).get("content") or []):
        if isinstance(b, dict) and b.get("type") == "tool_use": tool = b.get("name") or tool
    age = NOW - st.st_mtime
    t_asst = iso((last_asst or {}).get("timestamp", "")) or 0; t_user = iso((last_user or {}).get("timestamp", "")) or 0
    stop = ((last_asst or {}).get("message") or {}).get("stop_reason")
    if last_asst and stop in ("end_turn", "stop_sequence") and t_asst >= t_user and age < 6 * 3600 and claude_procs > 0: status = "needs you"
    elif age < 150: status = "running"
    elif age < 45 * 60: status = "paused"
    else: status = "idle"
    if status == "running" and claude_procs == 0: status = "paused"
    sessions.append({"agent": "claude", "id": sid, "title": title, "project": os.path.basename(cwd.rstrip("/")) or "~", "cwd": cwd, "branch": branch,
                     "model": model, "status": status, "age": int(age), "since": c.get("first"), "tool": tool, "ctx": ctx, "window": window,
                     "turns": c.get("turns", 0), "in": c["in"], "out": c["out"]})

# Codex (OpenAI) sessions, best effort.
for p in glob.glob(os.path.join(HOME, ".codex", "sessions", "*", "*", "*", "*.jsonl")):
    try: st = os.stat(p)
    except OSError: continue
    if st.st_size == 0 or NOW - st.st_mtime > 24 * 3600: continue
    try:
        meta = None; title = None
        with open(p, "rb") as fh:
            for raw in fh:
                line = raw.decode("utf-8", "replace")
                if meta is None and '"session_meta"' in line:
                    try: meta = (json.loads(line).get("payload") or {})
                    except Exception: pass
                if title is None and '"role":"user"' in line.replace(" ", ""):
                    try:
                        pl = json.loads(line).get("payload") or {}
                        if pl.get("role") == "user":
                            t = text_of(pl.get("content"))
                            if t and not t.startswith("<"): title = t
                    except Exception: pass
                if meta is not None and title is not None: break
        tail = read_tail(p); last_ev = None; tin = tout = 0
        for line in reversed(tail):
            line = line.strip()
            if not line: continue
            try: o = json.loads(line)
            except Exception: continue
            if o.get("type") == "event_msg" and last_ev is None: last_ev = (o.get("payload") or {}).get("type")
        cwd = (meta or {}).get("cwd") or ""; age = NOW - st.st_mtime
        if last_ev == "task_started" and age < 150: status = "running"
        elif last_ev in ("task_complete", "turn_complete") and age < 6 * 3600 and codex_procs > 0: status = "needs you"
        elif age < 45 * 60: status = "paused"
        else: status = "idle"
        sessions.append({"agent": "codex", "id": os.path.splitext(os.path.basename(p))[0][-12:], "title": " ".join((title or "Codex session").split())[:90],
                         "project": os.path.basename(cwd.rstrip("/")) or "~", "cwd": cwd, "branch": ((meta or {}).get("git") or {}).get("branch", "") or "",
                         "model": ((meta or {}).get("model") or (meta or {}).get("model_provider") or "Codex").replace("openai", "Codex"), "status": status, "age": int(age),
                         "since": iso((meta or {}).get("timestamp", "")), "tool": "", "ctx": 0, "window": 0, "turns": 0, "in": 0, "out": 0})
    except Exception: continue

rank = {"needs you": 0, "running": 1, "paused": 2, "idle": 3}
sessions.sort(key=lambda s: (rank.get(s["status"], 9), s["age"]))
out = {"now": int(NOW), "sessions": sessions[:12],
       "totals": {"in": tok_in, "out": tok_out, "sessions": len(sessions),
                  "running": sum(1 for s in sessions if s["status"] == "running"),
                  "needs": sum(1 for s in sessions if s["status"] == "needs you")}}
try: json.dump(cache, open(CACHE, "w"))
except Exception: pass
try: json.dump(out, open(OUT, "w"))
except Exception: pass
print(json.dumps(out))

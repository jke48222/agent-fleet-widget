import { React } from "uebersicht";
// --- Inlined design system (self-contained; formerly theme.js) ---
// Shared design system for the widget set: color tokens, fonts, layout, the
// common card shell, drag/resize handles, a last-known-good cache, and the
// standard data-resolution helper. Imported by every widget so they stay
// visually and behaviorally consistent.
const T = {
  // Accent tints
  tintBlue: "#296BE0",
  tintPink: "#E86E87",
  tintGreen: "#59A875",
  tintOrange: "#D9946B",
  tintPurple: "#A861DE",

  // Cards
  cardLight: "rgba(255,255,255,0.74)",
  cardDark: "rgba(33,36,43,0.88)",

  // Ink (text on light)
  ink: "#1F2129",
  inkDim: "#616670",
  inkMute: "#8C919C",

  // Text on dark
  onDark: "#F7F7FA",
  onDarkDim: "#BDBFC7",
  onDarkMute: "#8F949E",

  // Walls (desktop stand-in backgrounds)
  wall1: "#F0F2F7",
  wall2: "#DBE3ED",
  wall3: "#BFC7DB",

  // GitHub ramp
  ghEmpty: "rgba(255,255,255,0.10)",
  ghGreen1: "#9CE8A8",
  ghGreen2: "#40C463",
  ghGreen3: "#30A14F",
  ghGreen4: "#216E38",

  // Scene colors
  nightSky: "#14141A",
  cosmicBase: "#0A051A",
  cosmicViolet: "#8C338C",
  cosmicMagenta: "#D9598C",
  cosmicIndigo: "#331A66",
  shaderPurple: "#402673",
  shaderTeal: "#268C8C",
  duskBase: "#4D408C",
  duskAmber: "#D9A666",
  duskPurple: "#8C4DA6",
  duskGlow: "#F28073",
  cardCream: "#F2F0E6",
  paperGrain: "#9E8052",

  archivePalette: [
    "#D98C4D", "#A64D33", "#733326", "#E0B359",
    "#8C6640", "#B88CCC", "#594D80", "#8C73BF",
    "#8CBF8C", "#4D8059", "#598CD9", "#334D8C",
  ],

  // Layout
  radius: "24px",
  captionTracking: "1.5px",
};

// Fonts. Install Instrument Serif, Geist, and Geist Mono for the intended look;
// each stack falls back to a system font if the family is missing.
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Geist', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'Geist Mono', 'SF Mono', ui-monospace, monospace";

// Default desktop placement [x, y] per widget. Each widget calls
// card(variant, w, h, ...LAYOUT.<key>) so widgets lay out at distinct positions
// rather than stacking at the origin. These are overridden by any saved
// position from the drag handle.
const LAYOUT = {
  nowSpinning:  [380, 40],
  musicArchive: [40, 40],
  spatial:      [380, 200],
  mosaic:       [1120, 40],
  stack:        [1120, 486],
  drop:         [1120, 708],
  swap:         [380, 672],
  aiDailyPull:  [40, 368],
  apod:         [40, 576],
  atlas:        [1280, 224],
  tarot:        [1120, 224],
};

// Shared card shell. variant is "dark" or "light"; x/y set the on-desktop
// position. The common loading/empty/stale state styles are appended so every
// widget can render those states without repeating CSS.
const card = (variant, w, h, x = 0, y = 0) => `
  position: absolute;
  left: ${x}px; top: ${y}px;
  width: ${w}px;
  height: ${h}px;
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  background: ${variant === "dark" ? T.cardDark : T.cardLight};
  backdrop-filter: blur(20px);
  color: ${variant === "dark" ? T.onDark : T.ink};
  font-family: ${sans};
  box-sizing: border-box;
  transform-origin: top left;

  /* Promote each card to its own GPU layer so a sibling widget's frequent
     refresh cannot trigger a backdrop-filter recomposite, which otherwise made
     the blur flicker on and off. */
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  .ws-stale { position:absolute; top:8px; right:10px; z-index:5;
              font-family:${mono}; font-size:8px; letter-spacing:1px;
              text-transform:uppercase; opacity:0.72;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute}; }
  .ws-empty { position:absolute; inset:0; display:flex; align-items:center;
              justify-content:center; padding:24px; text-align:center;
              font-family:${serif}; font-style:italic; font-size:18px;
              opacity:0.6; color:${variant === "dark" ? T.onDarkDim : T.inkDim}; }
  .ws-skel  { position:absolute; inset:14px; border-radius:14px; opacity:0.18;
              animation: ws-pulse 1.6s ease-in-out infinite; }
  @keyframes ws-pulse { 0%,100% { opacity:0.10; } 50% { opacity:0.24; } }
  @media (prefers-reduced-motion: reduce) {
    .ws-skel { animation:none; opacity:0.16; }
  }

  .ws-drag  { position:absolute; top:6px; left:6px; z-index:30;
              width:18px; height:18px; border-radius:6px;
              display:flex; align-items:center; justify-content:center;
              font-size:11px; line-height:1; cursor:grab; opacity:0.22;
              transition:opacity .15s ease; user-select:none;
              -webkit-user-select:none;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute};
              background:${variant === "dark"
                ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-drag:hover  { opacity:0.95; }
  .ws-drag:active { cursor:grabbing; }

  .ws-resize { position:absolute; bottom:5px; right:5px; z-index:30;
               width:16px; height:16px; border-radius:5px;
               display:flex; align-items:center; justify-content:center;
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.22;
               transition:opacity .15s ease; user-select:none;
               -webkit-user-select:none;
               color:${variant === "dark" ? T.onDarkMute : T.inkMute};
               background:${variant === "dark"
                 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-resize:hover { opacity:0.95; }
`;

// Small uppercase monospace caption used for metadata labels.
const caption = (color) => `
  font-family: ${mono};
  text-transform: uppercase;
  letter-spacing: ${T.captionTracking};
  color: ${color};
`;

// State helpers, returned as React elements (this is plain JS, not JSX).
const h = React.createElement;

// Loading: an accent-tinted skeleton block.
const Skel = ({ tint = T.tintBlue }) =>
  h("div", { className: "ws-skel", style: { background: tint } });

// Empty: a single quiet line of text.
const Empty = ({ text }) => h("div", { className: "ws-empty" }, text);

// Stale: a small marker showing the time of the last successful refresh.
const Stale = ({ ts }) =>
  h("div", { className: "ws-stale" }, `stale · ${clockStamp(ts)}`);

// Drag and resize support.
//
// Übersicht renders each widget into its own absolutely-positioned `.widget`
// node, all inside a shared `#uebersicht` container. The wrapper to move is the
// nearest `.widget` ancestor of a handle — not the topmost absolute element,
// which is the shared container.
//
// DragHandle updates the wrapper's left/top. ResizeHandle scales it uniformly
// via a top-left-anchored CSS transform, keeping these fixed-layout cards crisp
// instead of clipping. Both persist to localStorage, so position and size
// survive refreshes and reboots.
const posKey = (k) => `ws:pos:${k}`;
const scaleKey = (k) => `ws:scale:${k}`;
const MIN_SCALE = 0.4, MAX_SCALE = 3;

const findWrapper = (node) => node && node.closest(".widget");

// Apply any saved position and scale. Runs on every mount, since the wrapper
// may have been recreated on refresh.
const applySaved = (wrapper, key) => {
  try {
    const pos = JSON.parse(localStorage.getItem(posKey(key)) || "null");
    if (pos && typeof pos.x === "number") {
      wrapper.style.left = pos.x + "px";
      wrapper.style.top = pos.y + "px";
    }
  } catch (e) { /* storage unavailable */ }
  try {
    const scale = parseFloat(localStorage.getItem(scaleKey(key)));
    if (scale > 0) wrapper.style.transform = `scale(${scale})`;
  } catch (e) { /* storage unavailable */ }
};

const initDrag = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsDragWired) return; // attach listeners once per node
  node.__wsDragWired = true;

  // Keep grip clicks from reaching the card's own onClick handler.
  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    const origX = parseFloat(wrapper.style.left || cs.left) || 0;
    const origY = parseFloat(wrapper.style.top || cs.top) || 0;
    const onMove = (ev) => {
      wrapper.style.left = origX + (ev.clientX - startX) + "px";
      wrapper.style.top = origY + (ev.clientY - startY) + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(posKey(key), JSON.stringify({
          x: parseFloat(wrapper.style.left) || 0,
          y: parseFloat(wrapper.style.top) || 0,
        }));
      } catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the grip to snap back to the card's default LAYOUT slot.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(posKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.left = "";
    wrapper.style.top = "";
  });
};

const initResize = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsResizeWired) return;
  node.__wsResizeWired = true;

  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    // Layout width/height are unaffected by transform, so they stay constant.
    const baseW = parseFloat(cs.width) || 1;
    const baseH = parseFloat(cs.height) || 1;
    const m = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
    const origScale = m ? parseFloat(m[1]) || 1 : 1;
    const onMove = (ev) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / (baseW + baseH);
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, origScale + delta));
      wrapper.style.transform = `scale(${next})`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const m2 = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
      try { localStorage.setItem(scaleKey(key), String(m2 ? m2[1] : 1)); }
      catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the corner to restore the card's default size.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(scaleKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.transform = "";
  });
};

// Each handle takes the widget's LAYOUT key so position and scale are stored
// per widget. DragHandle renders top-left, ResizeHandle bottom-right.
const DragHandle = ({ k }) =>
  h("div", { className: "ws-drag", title: "Drag to move · double-click to reset",
             ref: (n) => initDrag(n, k) }, "☰");

const ResizeHandle = ({ k }) =>
  h("div", { className: "ws-resize", title: "Drag to resize · double-click to reset",
             ref: (n) => initResize(n, k) }, "⤡");

// Last-known-good cache, persisted in localStorage with a timestamp.
const remember = (key, data) => {
  try { localStorage.setItem(`ws:${key}`, JSON.stringify({ data, ts: Date.now() })); }
  catch (e) { /* storage unavailable; skip */ }
};

const recall = (key) => {
  try { return JSON.parse(localStorage.getItem(`ws:${key}`)); }
  catch (e) { return null; }
};

const clockStamp = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// True before the command has produced any output (the initial load tick).
const isLoading = ({ output, error }) =>
  output === undefined && !error;

// Standard data flow for command-backed widgets. parse(output) must return a
// falsy value when there is nothing usable.
//   loading -> { loading: true }            render <Skel/>
//   success -> { data }                     cached as last-known-good
//   failure -> { data, staleTs }            last-known-good + time, render <Stale/>
//   cold    -> { data, mock: true }         mock data, nothing cached yet
const resolve = (key, props, parse, mock) => {
  if (isLoading(props)) return { loading: true };
  let data = null;
  try { data = parse(props.output); } catch (e) { data = null; }
  if (data) { remember(key, data); return { data }; }
  const cached = recall(key);
  if (cached && cached.data) return { data: cached.data, staleTs: cached.ts };
  return { data: mock, mock: true };
};
// --- End inlined design system ---

// agent-fleet — every coding-agent session on this Mac at a glance: what each
// one is doing, which ones are waiting on you, how much context each carries,
// and today's token totals. It reads the logs Claude Code and Codex already
// write (~/.claude/projects, ~/.codex/sessions). Read-only; nothing is sent
// anywhere. The helper also mirrors its JSON to ~/.config/widgetsuite/fleet.json
// so the window-pet widget can react to the same sessions.

const POS = [640, 40];
const KEY = "fleet";

export const command = String.raw`python3 - <<'PY'
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
PY`;

export const refreshFrequency = 1000 * 10;

const parse = (out) => { const j = JSON.parse(out); return j && Array.isArray(j.sessions) ? j : null; };

const MOCK = { now: 0, sessions: [
  { agent: "claude", title: "Add badges, license, and hero image to every README", project: "github", branch: "main", model: "Fable 5.1", status: "running", age: 12, tool: "Bash", ctx: 143000, window: 200000, turns: 41 },
  { agent: "claude", title: "Fix the flaky worktree test", project: "relay-oms", branch: "fix/worktree", model: "Opus 5", status: "needs you", age: 340, tool: "", ctx: 61000, window: 200000, turns: 9 },
  { agent: "codex", title: "Migrate the KUL site to Next 16", project: "KUL-Enterprises-Website", branch: "main", model: "Codex", status: "paused", age: 2400, tool: "", ctx: 0, window: 0, turns: 0 },
], totals: { in: 2140000, out: 96000, sessions: 3, running: 1, needs: 1 } };

const fmtK = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n || 0);
const ago = (s) => s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
const STATUS = {
  "needs you": { tint: T.tintOrange, label: "needs you", slug: "needs" },
  running:     { tint: T.tintGreen,  label: "running",   slug: "running" },
  paused:      { tint: T.onDarkMute, label: "paused",    slug: "paused" },
  idle:        { tint: T.onDarkMute, label: "idle",      slug: "idle" },
};
const headline = (t) => {
  if (!t || !t.sessions) return "No agents running.";
  if (t.needs) return t.needs === 1 ? "One agent is waiting on you." : `${t.needs} agents are waiting on you.`;
  if (t.running) return t.running === 1 ? "One agent working. Nothing needs you." : `${t.running} agents working. Nothing needs you.`;
  return "All quiet. Every session is paused.";
};

const W = 440, H = 372, ROWS = 5;

export const className = card("dark", W, H, ...POS) + `
  padding: 16px 18px 12px;
  display: flex; flex-direction: column;

  .cap { ${caption(T.onDarkMute)} display:flex; justify-content:space-between; }
  .cap b { font-weight: 500; color: ${T.onDarkDim}; }
  .head { font-family:${serif}; font-style:italic; font-size:22px; line-height:1.15; margin: 6px 0 10px; color:${T.onDark}; }
  .head em { font-style:italic; color:${T.tintOrange}; }

  .rows { flex:1; display:flex; flex-direction:column; min-height:0; }
  .row { display:flex; align-items:center; gap: 10px; padding: 5px 0; border-top: 1px solid rgba(255,255,255,0.07); min-height: 34px; }
  .row:first-child { border-top: 0; }
  .dot { flex:none; width:8px; height:8px; border-radius:50%; background: var(--tint); box-shadow: 0 0 0 3px color-mix(in srgb, var(--tint) 18%, transparent); }
  .row.st-running .dot { animation: fl-pulse 1.6s ease-in-out infinite; }
  .row.st-paused .dot, .row.st-idle .dot { opacity: 0.45; box-shadow: none; }
  @keyframes fl-pulse { 0%,100% { box-shadow: 0 0 0 3px color-mix(in srgb, var(--tint) 18%, transparent); } 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--tint) 8%, transparent); } }
  @media (prefers-reduced-motion: reduce) { .row.st-running .dot { animation: none; } }
  .main { flex:1; min-width:0; }
  .title { font-size: 12.5px; font-weight: 500; color: ${T.onDark}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row.st-paused .title, .row.st-idle .title { color: ${T.onDarkDim}; font-weight: 400; }
  .meta { margin-top: 2px; font-family:${mono}; font-size: 8.5px; letter-spacing: 0.6px; color: ${T.onDarkMute}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .meta span { color: ${T.onDarkDim}; }
  .ctx { flex:none; width: 58px; text-align:right; font-family:${mono}; font-size: 9px; color:${T.onDarkDim}; }
  .ctx i { display:block; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.10); margin-bottom: 4px; overflow:hidden; }
  .ctx i b { display:block; height:100%; background: var(--tint); border-radius: 2px; }
  .badge { flex:none; font-family:${mono}; font-size: 8px; letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 7px; border-radius: 6px;
           color: var(--tint); background: color-mix(in srgb, var(--tint) 16%, transparent); }
  .row.st-paused .badge, .row.st-idle .badge { color:${T.onDarkMute}; background: rgba(255,255,255,0.06); }
  .more { font-family:${mono}; font-size: 8.5px; letter-spacing: 1px; text-transform: uppercase; color: ${T.onDarkMute}; padding: 6px 0 0 18px; }

  .foot { display:flex; justify-content:space-between; align-items:baseline; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.07);
          font-family:${mono}; font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase; color: ${T.onDarkMute}; }
  .foot b { font-weight: 500; color: ${T.onDarkDim}; }
  .mock { color: ${T.tintOrange}; }
`;

const Row = ({ s }) => {
  const st = STATUS[s.status] || STATUS.idle;
  const pct = s.ctx && s.window ? Math.min(100, Math.round((s.ctx / s.window) * 100)) : 0;
  const parts = [s.project, s.branch, s.model, ago(s.age)].filter(Boolean);
  return (
    <div className={`row st-${st.slug}`} style={{ "--tint": st.tint }}>
      <span className="dot" />
      <div className="main">
        <div className="title">{s.title}</div>
        <div className="meta">{parts.join(" · ")}{s.tool && s.status === "running" ? <span> · {s.tool}</span> : null}{s.agent === "codex" ? <span> · codex</span> : null}</div>
      </div>
      <div className="ctx" title={s.ctx ? `Context carried into the last turn: ${s.ctx.toLocaleString()} tokens` : "No usage data"}>
        {s.ctx ? <i><b style={{ width: `${pct}%` }} /></i> : null}
        {s.ctx ? `${fmtK(s.ctx)} ctx` : "—"}
      </div>
      <span className="badge">{st.label}</span>
    </div>
  );
};

const Fleet = ({ data, staleTs, mock }) => {
  const t = data.totals || {}; const rows = (data.sessions || []).slice(0, ROWS); const extra = (data.sessions || []).length - rows.length;
  return (
    <div>
      <DragHandle k={KEY} />
      <ResizeHandle k={KEY} />
      {staleTs ? <Stale ts={staleTs} /> : null}
      <div className="cap"><span>Agent fleet</span><span><b>{t.running || 0}</b> running · <b>{t.needs || 0}</b> waiting</span></div>
      <div className="head">{headline(t)}</div>
      <div className="rows">
        {rows.length ? rows.map((s) => <Row key={`${s.agent}-${s.id || s.title}`} s={s} />) : <Empty text="No agents in the last 24 hours. Start claude or codex in a terminal and this fills in." />}
        {extra > 0 ? <div className="more">+{extra} more session{extra > 1 ? "s" : ""}</div> : null}
      </div>
      <div className="foot">
        <span>today <b>{fmtK(t.in || 0)}</b> in · <b>{fmtK(t.out || 0)}</b> out · <b>{t.sessions || 0}</b> sessions</span>
        <span>{mock ? <span className="mock">sample data</span> : clockStamp(Date.now())}</span>
      </div>
    </div>
  );
};

export const render = (props) => {
  const r = resolve(KEY, props, parse, MOCK);
  if (r.loading) return <Skel tint={T.tintGreen} />;
  return <Fleet data={r.data} staleTs={r.staleTs} mock={r.mock} />;
};

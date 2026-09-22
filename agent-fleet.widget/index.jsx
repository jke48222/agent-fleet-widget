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

// agent-fleet — every coding-agent session on this Mac, shown the way an
// airport shows flights: a split-flap departures board. Each row is a session;
// the TIME column is its last activity, STATUS flips between RUNNING, NEEDS
// YOU, PAUSED, and IDLE, and the characters flutter through the drum when a
// value changes, the way a Solari board does. The data helper is embedded
// below; it reads the logs Claude Code and Codex already write (read-only) and
// mirrors its summary to ~/.config/widgetsuite/fleet.json for the window-pet.

const POS = [640, 40];
const KEY = "fleet";
const FONTS = "agent-fleet.widget/fonts";

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
  { agent: "claude", id: "m1", title: "Add badges, license, and hero image to every README", project: "github", branch: "main", model: "Fable 5.1", status: "running", age: 12, tool: "Bash", ctx: 143000, window: 1000000, turns: 41 },
  { agent: "claude", id: "m2", title: "Fix the flaky worktree test", project: "relay-oms", branch: "fix/worktree", model: "Opus 5", status: "needs you", age: 340, tool: "", ctx: 61000, window: 1000000, turns: 9 },
  { agent: "codex", id: "m3", title: "Migrate the KUL site to Next 16", project: "KUL-Enterprises-Website", branch: "main", model: "Codex", status: "paused", age: 2400, tool: "", ctx: 0, window: 0, turns: 0 },
  { agent: "claude", id: "m4", title: "Album art matrix render daemon", project: "album-art-matrix", branch: "main", model: "Opus 5", status: "idle", age: 19000, tool: "", ctx: 210000, window: 1000000, turns: 88 },
], totals: { in: 2140000, out: 96000, sessions: 4, running: 1, needs: 1 } };

const fmtK = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "K" : String(n || 0);
const COLS = [["time", 5], ["agent", 6], ["project", 10], ["task", 15], ["status", 9]];
const STATUS = { "needs you": { text: "NEEDS YOU", color: "#F5B52A" }, running: { text: "RUNNING", color: "#43E07E" }, paused: { text: "PAUSED", color: "#9A9A96" }, idle: { text: "IDLE", color: "#5F5F5C" } };
const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-./&";
const clean = (s, n) => { const t = String(s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Z0-9:\-./& ]/g, " ").replace(/\s+/g, " ").trim(); return (t.length > n ? t.slice(0, n) : t).padEnd(n, " "); };
const hhmm = (age, now) => { const d = new Date(((now || Date.now() / 1000) - (age || 0)) * 1000); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

const ROWS = 8, FW = 10, FH = 19, GAP = 2;
const W = 620, H = 306;

export const className = card("dark", W, H, ...POS) + `
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-600.woff2") format("woff2"); font-weight: 600; }
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-700.woff2") format("woff2"); font-weight: 700; }
  --cond: "Barlow Condensed", "Arial Narrow", sans-serif; --yellow: #F2C231; --ivory: #F1EDE3;
  padding: 0; border-radius: 12px; backdrop-filter: none; overflow: hidden;
  background: linear-gradient(180deg, #4A4A4A 0%, #2E2E2E 12%, #262626 88%, #171717 100%);
  box-shadow: 0 30px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px #0a0a0a;
  font-family: var(--cond); user-select:none; -webkit-user-select:none;
  .ws-drag { top: 6px; left: 6px; }
  .screw { position:absolute; width: 7px; height: 7px; border-radius:50%; background: radial-gradient(circle at 40% 35%, #8a8a8a, #3a3a3a 70%); box-shadow: inset 0 0 0 1px #111; }
  .screw::after { content:""; position:absolute; left: 1px; right: 1px; top: 3px; height: 1px; background: #111; transform: rotate(35deg); }
  .board { position:absolute; inset: 9px; border-radius: 6px; background: #0B0B0B; box-shadow: inset 0 0 0 1px #000, inset 0 2px 14px rgba(0,0,0,0.9); padding: 10px 14px 9px; display:flex; flex-direction:column; }
  .hdr { display:flex; align-items:baseline; justify-content:space-between; margin-bottom: 6px; }
  .hdr .t { font: 700 15px/1 var(--cond); letter-spacing: 3px; color: var(--yellow); text-transform:uppercase; }
  .hdr .t small { font-weight: 600; font-size: 9px; letter-spacing: 2px; color: #8f8368; margin-left: 10px; }
  .cols { display:flex; gap: 10px; margin-bottom: 4px; padding-left: 1px; }
  .cols span { font: 600 8.5px/1 var(--cond); letter-spacing: 2px; color: var(--yellow); text-transform:uppercase; opacity: 0.85; }
  .row { display:flex; gap: 10px; margin-bottom: 5px; }
  .cell { display:flex; gap: ${GAP}px; }
  .flap { position:relative; width: ${FW}px; height: ${FH}px; perspective: 120px; }
  .flap .half { position:absolute; left:0; right:0; overflow:hidden; background: linear-gradient(180deg, #303030 0%, #232323 100%); border-radius: 2px 2px 0 0; }
  .flap .half span { position:absolute; left:0; width:100%; text-align:center; font: 600 14px/${FH}px var(--cond); color: var(--ivory); letter-spacing: 0; }
  .flap .top { top:0; height: ${Math.floor(FH / 2)}px; transform-origin: 50% 100%; backface-visibility: hidden; }
  .flap .top span { top: 0; }
  .flap .bot { bottom:0; height: ${Math.ceil(FH / 2)}px; border-radius: 0 0 2px 2px; background: linear-gradient(180deg, #1E1E1E 0%, #151515 100%); transform-origin: 50% 0; backface-visibility: hidden; }
  .flap .bot span { bottom: 0; }
  .flap .seam { position:absolute; left:0; right:0; top: ${Math.floor(FH / 2)}px; height: 1px; background: #000; z-index: 3; }
  .flap.f .top { animation: flp-top 75ms ease-in; }
  .flap.f .bot { animation: flp-bot 75ms ease-out 40ms both; }
  @keyframes flp-top { from { transform: rotateX(0deg); filter: brightness(1); } to { transform: rotateX(-88deg); filter: brightness(0.5); } }
  @keyframes flp-bot { from { transform: rotateX(88deg); filter: brightness(0.5); } to { transform: rotateX(0deg); filter: brightness(1); } }
  @media (prefers-reduced-motion: reduce) { .flap.f .top, .flap.f .bot { animation: none; } }
  .foot { margin-top:auto; display:flex; justify-content:space-between; align-items:baseline; padding-top: 6px; border-top: 1px solid #1c1c1c; }
  .foot span { font: 600 8.5px/1 var(--cond); letter-spacing: 2px; text-transform:uppercase; color: #8f8368; }
  .foot b { color: var(--yellow); font-weight: 700; }
  .foot .mock { color: #F5B52A; }
`;

// One character position. When the target changes it flutters through a few
// neighbouring drum characters before settling, like the real mechanism.
const Flap = ({ ch, color }) => {
  const target = ch || " ";
  const [cur, setCur] = React.useState(target);
  const [tick, setTick] = React.useState(0);
  const timer = React.useRef(null);
  React.useEffect(() => {
    if (cur === target) return;
    clearTimeout(timer.current);
    const from = DRUM.indexOf(cur), to = DRUM.indexOf(target);
    const steps = (from < 0 || to < 0) ? 1 : Math.min(6, Math.max(1, ((to - from) + DRUM.length) % DRUM.length));
    let i = 0;
    const run = () => {
      i += 1;
      const next = i >= steps ? target : DRUM[(from + i) % DRUM.length];
      setCur(next); setTick((t) => t + 1);
      if (next !== target) timer.current = setTimeout(run, 78 + Math.random() * 20);
    };
    timer.current = setTimeout(run, 20 + Math.random() * 120);
    return () => clearTimeout(timer.current);
  }, [target]);
  return (
    <span className={`flap ${tick ? "f" : ""}`} key={tick}>
      <span className="half top"><span style={{ color }}>{cur}</span></span>
      <span className="half bot"><span style={{ color }}>{cur}</span></span>
      <span className="seam" />
    </span>
  );
};
const Text = ({ text, width, color }) => <span className="cell">{clean(text, width).split("").map((c, i) => <Flap key={i} ch={c} color={color} />)}</span>;

const Clock = () => {
  const [t, setT] = React.useState(() => hhmm(0));
  React.useEffect(() => { const id = setInterval(() => setT(hhmm(0)), 5000); return () => clearInterval(id); }, []);
  return <Text text={t} width={5} color="var(--ivory)" />;
};

const Board = ({ data, staleTs, mock }) => {
  const t = data.totals || {}; const rows = (data.sessions || []).slice(0, ROWS);
  while (rows.length < ROWS) rows.push(null);
  return (
    <div>
      <DragHandle k={KEY} />
      <ResizeHandle k={KEY} />
      <span className="screw" style={{ top: 5, left: 5 }} /><span className="screw" style={{ top: 5, right: 5 }} /><span className="screw" style={{ bottom: 5, left: 5 }} /><span className="screw" style={{ bottom: 5, right: 5 }} />
      <div className="board">
        <div className="hdr"><span className="t">Agent fleet<small>Departures · {t.running || 0} running · {t.needs || 0} waiting</small></span><Clock /></div>
        <div className="cols">{COLS.map(([n, w]) => <span key={n} style={{ width: w * (FW + GAP) - GAP }}>{n}</span>)}</div>
        {rows.map((s, i) => {
          const st = s ? (STATUS[s.status] || STATUS.idle) : null;
          return (
            <div className="row" key={s ? `${s.agent}-${s.id}` : `empty-${i}`}>
              <Text text={s ? hhmm(s.age, data.now) : ""} width={5} color="var(--ivory)" />
              <Text text={s ? s.agent : ""} width={6} color="var(--ivory)" />
              <Text text={s ? s.project : ""} width={10} color="var(--ivory)" />
              <Text text={s ? s.title : ""} width={15} color="var(--ivory)" />
              <Text text={s ? st.text : ""} width={9} color={s ? st.color : "var(--ivory)"} />
            </div>
          );
        })}
        <div className="foot">
          <span>Today <b>{fmtK(t.in || 0)}</b> in · <b>{fmtK(t.out || 0)}</b> out · <b>{t.sessions || 0}</b> sessions</span>
          <span>{mock ? <span className="mock">Sample data</span> : staleTs ? `Stale · ${clockStamp(staleTs)}` : `Updated ${clockStamp(Date.now())}`}</span>
        </div>
      </div>
    </div>
  );
};

export const render = (props) => {
  const r = resolve(KEY, props, parse, MOCK);
  if (r.loading) return <Skel tint={T.tintOrange} />;
  return <Board data={r.data} staleTs={r.staleTs} mock={r.mock} />;
};

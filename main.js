const { app, BrowserWindow, clipboard, ipcMain, Tray, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const os = require("os");
const https = require("https");

// ── Cross-Platform Detection ────────────────────────────────────────
const PLATFORM = process.platform;
const IS_MAC = PLATFORM === "darwin";
const IS_WIN = PLATFORM === "win32";
const IS_LINUX = PLATFORM === "linux";
// ── CRITICAL: call dock.hide() at module load time (before whenReady) ──
if (IS_MAC) {
  app.dock.hide();
}

let win;
let tray;
let clipboardHistory = [];
let lastClipboard = "";
let ignoreClipboard = false;
let pollInterval;
const MAX_ITEMS = 30;

let savedPrompts = [];
let aiConfig = { provider: "openai", apiKey: "", model: "gpt-4o-mini", baseUrl: "", systemPrompt: "" };
const PROMPTS_FILE = path.join(os.homedir(), ".repromptr-prompts");
const POS_FILE = path.join(os.homedir(), ".repromptr-window-pos");
const CONFIG_FILE = path.join(os.homedir(), ".repromptr-config");

// ── Window Position Persistence ───────────────────────────────────

function saveWindowPosition() {
  if (!win || win.isDestroyed()) return;
  const [x, y] = win.getPosition();
  try { fs.writeFileSync(POS_FILE, JSON.stringify({ x, y })); } catch (e) { }
}

function loadWindowPosition() {
  try {
    const pos = JSON.parse(fs.readFileSync(POS_FILE, "utf-8"));
    return {
      x: typeof pos.x === "number" ? pos.x : undefined,
      y: typeof pos.y === "number" ? pos.y : undefined,
    };
  } catch (e) {
    return { x: undefined, y: undefined };
  }
}

// ── Saved Prompts Persistence ─────────────────────────────────────

function loadPrompts() {
  try { savedPrompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf-8")); }
  catch (e) { savedPrompts = []; }
}

function savePrompts() {
  try { fs.writeFileSync(PROMPTS_FILE, JSON.stringify(savedPrompts)); } catch (e) { }
}

// ── AI Config Persistence ──────────────────────────────────────────

function loadConfig() {
  try {
    const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    aiConfig = { ...aiConfig, ...saved };
  } catch (e) { }
}

function saveConfig() {
  try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(aiConfig)); } catch (e) { }
}

// ── Tray icon ─────────────────────────────────────────────────────

function makeTrayIcon() {
  const img = nativeImage.createFromPath(path.join(__dirname, "repromptr_logo.png"));
  return img.resize({ width: 22, height: 22 });
}

// ── Window ────────────────────────────────────────────────────────

function createWindow() {
  const savedPosition = loadWindowPosition();

  const windowOptions = {
    width: 320,
    height: 440,
    x: savedPosition.x,
    y: savedPosition.y,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    focusable: false,
    resizable: true,
    hasShadow: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (IS_MAC) {
    windowOptions.type = "panel";
  }

  win = new BrowserWindow(windowOptions);
  win.loadFile("index.html");
  win.webContents.setBackgroundThrottling(false);

  if (IS_MAC) {
    win.setAlwaysOnTop(true, "screen-saver");
  } else {
    win.setAlwaysOnTop(true, "floating");
  }

  win.on("moved", saveWindowPosition);
  win.on("close", saveWindowPosition);

  lastClipboard = clipboard.readText() || "";
  pollInterval = setInterval(checkClipboard, 800);
}

function createTray() {
  const icon = makeTrayIcon();
  tray = new Tray(icon);
  if (IS_MAC) app.dock.setIcon(nativeImage.createFromPath(path.join(__dirname, "repromptr_logo.png")));
  tray.setToolTip("Repromptr — click to show/hide");
  const toggleWin = () => {
    if (!win || win.isDestroyed()) return;
    win.isVisible() ? win.hide() : win.show();
  };
  tray.on("click", toggleWin);
  tray.on("double-click", toggleWin);
}

// ── Clipboard monitoring ─────────────────────────────────────────

function checkClipboard() {
  if (ignoreClipboard) return;
  const text = clipboard.readText();
  if (text && text.trim() && text !== lastClipboard) {
    lastClipboard = text;
    addToHistory(text);
  }
}

function addToHistory(text) {
  if (text.length > 50000) {
    text = text.slice(0, 50000);
  }
  const idx = clipboardHistory.indexOf(text);
  if (idx === 0) return;
  if (idx > 0) clipboardHistory.splice(idx, 1);
  clipboardHistory.unshift(text);
  if (clipboardHistory.length > MAX_ITEMS) clipboardHistory.pop();
  if (win && !win.isDestroyed()) {
    win.webContents.send("clipboard-update", clipboardHistory);
  }
}

// ── Paste ─────────────────────────────────────────────────────────

function simulatePaste() {
  return new Promise((resolve, reject) => {
    if (IS_MAC) {
      execFile(
        "osascript",
        ["-e", 'tell application "System Events" to keystroke "v" using command down'],
        { timeout: 3000 },
        (err, stdout, stderr) => {
          if (err) reject(new Error(stderr || err.message));
          else resolve();
        }
      );
    } else if (IS_WIN) {
      execFile(
        "powershell.exe",
        ["-NoProfile", "-Command", "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"],
        { timeout: 3000 },
        (err, stdout, stderr) => {
          if (err) reject(new Error(stderr || err.message));
          else resolve();
        }
      );
    } else if (IS_LINUX) {
      execFile("xdotool", ["key", "ctrl+v"], { timeout: 3000 }, (err) => {
        if (!err) { resolve(); return; }
        execFile("ydotool", ["key", "ctrl+v"], { timeout: 3000 }, (err2) => {
          if (!err2) { resolve(); return; }
          reject(new Error("Neither xdotool nor ydotool available. Install: sudo apt-get install xdotool"));
        });
      });
    } else {
      reject(new Error(`Unsupported platform: ${PLATFORM}`));
    }
  });
}

// ── Paste helpers ────────────────────────────────────────────────
// Make window invisible + release focus so the target app receives Cmd+V.
// setOpacity(0) is instant (no hide/show animation = no blink).
// setFocusable(false) + blur() actually releases keyboard focus.
function pasteDeactivate() {
  if (!win || win.isDestroyed()) return;
  win.setOpacity(0);
  win.setFocusable(false);
  win.blur();
}
function pasteReactivate() {
  if (!win || win.isDestroyed()) return;
  win.setOpacity(1);
  // focusable state is restored by the renderer via setFocusable IPC
}

// ── IPC Handlers ─────────────────────────────────────────────────

ipcMain.handle("paste-item", async (_event, text) => {
  ignoreClipboard = true;
  clipboard.writeText(text);
  // Do NOT update lastClipboard — so if the user copies the same text later it still registers

  pasteDeactivate();
  await new Promise(r => setTimeout(r, 80));

  let error = null;
  try {
    await simulatePaste();
  } catch (e) {
    error = e.message;
    console.error("Paste failed:", e.message);
  }

  await new Promise(r => setTimeout(r, 30));
  pasteReactivate();

  // Stop ignoring immediately after paste completes so next copy is captured
  ignoreClipboard = false;

  // Always remove from queue on paste (one-time use)
  const idx = clipboardHistory.indexOf(text);
  if (idx >= 0) {
    clipboardHistory.splice(idx, 1);
    if (win && !win.isDestroyed()) {
      win.webContents.send("clipboard-update", clipboardHistory);
    }
  }

  return { ok: !error, error, removed: idx >= 0 };
});

ipcMain.handle("paste-next", async () => {
  if (clipboardHistory.length === 0) {
    return { ok: false, error: "Queue is empty" };
  }

  const text = clipboardHistory[0];
  ignoreClipboard = true;
  clipboard.writeText(text);
  // Do NOT update lastClipboard

  pasteDeactivate();
  await new Promise(r => setTimeout(r, 80));

  let error = null;
  try {
    await simulatePaste();
  } catch (e) {
    error = e.message;
    console.error("Paste failed:", e.message);
  }

  await new Promise(r => setTimeout(r, 30));
  pasteReactivate();

  ignoreClipboard = false;

  if (!error) {
    clipboardHistory.shift();
    if (win && !win.isDestroyed()) {
      win.webContents.send("clipboard-update", clipboardHistory);
    }
  }

  return { ok: !error, error, text, remaining: clipboardHistory.length };
});

ipcMain.handle("copy-item", (_event, text) => {
  ignoreClipboard = true;
  clipboard.writeText(text);
  setTimeout(() => { ignoreClipboard = false; }, 200);
  return { ok: true };
});

ipcMain.handle("delete-item", (_event, text) => {
  const idx = clipboardHistory.indexOf(text);
  if (idx >= 0) clipboardHistory.splice(idx, 1);
  return { history: clipboardHistory };
});

ipcMain.handle("move-to-top", (_event, text) => {
  const idx = clipboardHistory.indexOf(text);
  if (idx > 0) clipboardHistory.splice(idx, 1);
  if (idx !== -1) clipboardHistory.unshift(text);
  return { history: clipboardHistory };
});

ipcMain.handle("clear-all", () => {
  clipboardHistory = [];
  lastClipboard = clipboard.readText() || "";
  return { history: clipboardHistory };
});

ipcMain.handle("set-focusable", (_event, focusable) => {
  if (win && !win.isDestroyed()) {
    win.setFocusable(focusable);
    if (focusable) win.focus();
  }
  return { ok: true };
});

ipcMain.handle("toggle-sticky", (_event, sticky) => {
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(sticky, IS_MAC ? "screen-saver" : "floating");
  }
  return { sticky };
});

ipcMain.handle("minimize-app", () => {
  if (win && !win.isDestroyed()) win.hide();
});

ipcMain.handle("close-app", () => {
  app.quit();
});

ipcMain.handle("get-history", () => ({ history: clipboardHistory }));

// ── Saved Prompts Handlers ────────────────────────────────────────

ipcMain.handle("get-prompts", () => savedPrompts);

ipcMain.handle("save-prompt", (_event, text) => {
  if (!text || savedPrompts.find((p) => p.text === text)) return { ok: false };
  savedPrompts.push({ id: Date.now().toString(), text, createdAt: Date.now() });
  savePrompts();
  return { ok: true };
});

ipcMain.handle("delete-prompt", (_event, id) => {
  savedPrompts = savedPrompts.filter((p) => p.id !== id);
  savePrompts();
  return { ok: true };
});


// ── Reprompt Handlers ─────────────────────────────────────────────

let cfgWin = null;
ipcMain.handle("open-config-window", () => {
  if (cfgWin && !cfgWin.isDestroyed()) { cfgWin.focus(); return; }
  cfgWin = new BrowserWindow({
    width: 320,
    height: 420,
    resizable: false,
    alwaysOnTop: true,
    frame: true,
    focusable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  cfgWin.loadFile("config.html");
  cfgWin.setMenuBarVisibility(false);
  cfgWin.on("closed", () => { cfgWin = null; });
});

ipcMain.handle("get-config", () => aiConfig);

ipcMain.handle("save-config", (_event, cfg) => {
  aiConfig = { ...aiConfig, ...cfg };
  saveConfig();
  return { ok: true };
});

ipcMain.handle("reprompt", (event, text, instruction) => {
  const { provider, apiKey, model, baseUrl, systemPrompt: customSystemPrompt } = aiConfig;
  if (!apiKey) return { ok: false, error: "No API key configured — click ⚙." };
  if (!text || !text.trim()) return { ok: false, error: "No text to enhance." };

  const defaultSystem = `You are a text rewriting assistant. Rewrite the text exactly as instructed: ${instruction}. Output only the rewritten text — no explanations, no preamble, no quotes, nothing else.`;
  const systemPrompt = customSystemPrompt
    ? `${customSystemPrompt}\n\nInstruction: ${instruction}. Output only the rewritten text — no explanations, no preamble, no quotes, nothing else.`
    : defaultSystem;
  const userPrompt = text;

  const wc = event.sender;
  const send = (type, payload) => {
    if (!wc || wc.isDestroyed()) return;
    wc.send("reprompt-stream", { type, payload });
  };

  // Fire and forget — return immediately so renderer isn't blocked awaiting invoke
  // Stream events (start/chunk/done/error) go via wc.send
  const run = async () => {
    try {
      if (provider === "claude") {
        await streamClaude(apiKey, model, systemPrompt, userPrompt, send);
      } else {
        const isOpenRouter = provider === "openrouter";
        const host = isOpenRouter ? "openrouter.ai"
          : provider === "custom" ? baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
            : "api.openai.com";
        await streamOpenAICompat(host, apiKey, model, systemPrompt, userPrompt, isOpenRouter, send);
      }
    } catch (e) {
      console.error("[reprompt error]", e.message);
      send("error", e.message);
    }
  };
  run();
  return { ok: true };
});

function streamOpenAICompat(host, apiKey, model, system, user, isOpenRouter, send) {
  const body = JSON.stringify({
    model, stream: true, max_tokens: 2048,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  });
  const headers = {
    "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`,
    "Content-Length": Buffer.byteLength(body),
  };
  if (isOpenRouter) { headers["HTTP-Referer"] = "https://github.com/omkarbhad/repromptr"; headers["X-Title"] = "Repromptr"; }
  const apiPath = isOpenRouter ? "/api/v1/chat/completions" : "/v1/chat/completions";

  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: host, path: apiPath, method: "POST", headers }, (res) => {
      if (res.statusCode !== 200) {
        let raw = "";
        res.on("data", (c) => { raw += c; });
        res.on("end", () => {
          try { const j = JSON.parse(raw); reject(new Error(j.error?.message || raw.slice(0, 200))); }
          catch { reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`)); }
        });
        return;
      }
      send("start", null);
      let buf = "";
      res.on("data", (chunk) => {
        buf += chunk.toString();
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) send("chunk", delta);
          } catch { }
        }
      });
      res.on("end", () => { send("done", null); resolve(); });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Request timed out")); });
    req.write(body);
    req.end();
  });
}

function streamClaude(apiKey, model, system, user, send) {
  const body = JSON.stringify({
    model, max_tokens: 2048, stream: true, system,
    messages: [{ role: "user", content: user }],
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.anthropic.com", path: "/v1/messages", method: "POST",
      headers: {
        "Content-Type": "application/json", "x-api-key": apiKey,
        "anthropic-version": "2023-06-01", "Content-Length": Buffer.byteLength(body)
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        let raw = "";
        res.on("data", (c) => { raw += c; });
        res.on("end", () => {
          try { const j = JSON.parse(raw); reject(new Error(j.error?.message || raw.slice(0, 200))); }
          catch { reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`)); }
        });
        return;
      }
      send("start", null);
      let buf = "";
      res.on("data", (chunk) => {
        buf += chunk.toString();
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.type === "content_block_delta" && ev.delta?.text) send("chunk", ev.delta.text);
          } catch { }
        }
      });
      res.on("end", () => { send("done", null); resolve(); });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Request timed out")); });
    req.write(body);
    req.end();
  });
}

// ── App lifecycle ────────────────────────────────────────────────

app.whenReady().then(() => {
  loadPrompts();
  loadConfig();
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  clearInterval(pollInterval);
  // Don't quit — let the tray keep the app alive
});

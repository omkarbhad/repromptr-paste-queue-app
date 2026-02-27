const { app, BrowserWindow, clipboard, ipcMain, Tray, nativeImage } = require("electron");
const path = require("path");
const { execFile, execSync } = require("child_process");
const os = require("os");

// ── Cross-Platform Detection ────────────────────────────────────────
const PLATFORM = process.platform; // 'darwin', 'win32', 'linux'
const ARCH = process.arch; // 'x64', 'arm64', 'ia32', etc.
const IS_MAC = PLATFORM === "darwin";
const IS_WIN = PLATFORM === "win32";
const IS_LINUX = PLATFORM === "linux";
const IS_ARM = ARCH === "arm64" || ARCH === "arm";
const IS_X86 = ARCH === "x64" || ARCH === "ia32";

// ── CRITICAL: call dock.hide() at module load time (before whenReady) ──
// This sets activation policy to "accessory" immediately, so the app never
// steals focus from other applications — not even on the very first click.
if (IS_MAC) {
  app.dock.hide();
}

let win;
let tray;
let clipboardHistory = [];
let lastClipboard = "";
let ignoreClipboard = false;
let pollInterval;
let autoRemove = true;
const MAX_ITEMS = 30;

let savedPrompts = [];
const PROMPTS_FILE = path.join(os.homedir(), ".pastr-prompts");

// ── Window Position Persistence ───────────────────────────────────

function saveWindowPosition() {
  if (win) {
    const [x, y] = win.getPosition();
    try {
      require("fs").writeFileSync(
        require("path").join(require("os").homedir(), ".pastr-window-pos"),
        JSON.stringify({ x, y })
      );
    } catch (e) {
      // Silently fail if unable to save position
    }
  }
}

function loadWindowPosition() {
  try {
    const data = require("fs").readFileSync(
      require("path").join(require("os").homedir(), ".pastr-window-pos"),
      "utf-8"
    );
    const pos = JSON.parse(data);
    return { x: pos.x || undefined, y: pos.y || undefined };
  } catch (e) {
    return { x: undefined, y: undefined };
  }
}

// ── Saved Prompts Persistence ─────────────────────────────────────

function loadPrompts() {
  try {
    savedPrompts = JSON.parse(require("fs").readFileSync(PROMPTS_FILE, "utf-8"));
  } catch (e) {
    savedPrompts = [];
  }
}

function savePrompts() {
  try {
    require("fs").writeFileSync(PROMPTS_FILE, JSON.stringify(savedPrompts));
  } catch (e) {}
}

// ── Tray icon ─────────────────────────────────────────────────────

function makeTrayIcon() {
  const size = 22;
  const buf = Buffer.alloc(size * size * 4, 0);
  const set = (x, y) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = buf[i + 1] = buf[i + 2] = 0;
    buf[i + 3] = 255;
  };
  for (let x = 3; x <= 18; x++) { set(x, 4); set(x, 20); }
  for (let y = 5; y <= 19; y++) { set(3, y); set(18, y); }
  for (let x = 8; x <= 13; x++) { set(x, 2); set(x, 5); }
  set(8, 3); set(8, 4); set(13, 3); set(13, 4);
  for (let x = 6; x <= 15; x++) { set(x, 9); set(x, 13); }
  for (let x = 6; x <= 12; x++) { set(x, 17); }
  const img = nativeImage.createFromBuffer(buf, { width: size, height: size });
  img.setTemplateImage(true);
  return img;
}

// ── Window ────────────────────────────────────────────────────────

function createWindow() {
  const savedPosition = loadWindowPosition();

  // Platform-specific window options
  const windowOptions = {
    width: 300,
    height: 420,
    x: savedPosition.x,
    y: savedPosition.y,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    focusable: false,
    resizable: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  // macOS supports panel type for better focus handling
  if (IS_MAC) {
    windowOptions.type = "panel";
  }

  win = new BrowserWindow(windowOptions);
  win.loadFile("index.html");

  // macOS: use highest z-level, others: use standard alwaysOnTop
  if (IS_MAC) {
    win.setAlwaysOnTop(true, "screen-saver");
  } else {
    win.setAlwaysOnTop(true, "floating");
  }

  // Save position on move
  win.on("moved", saveWindowPosition);

  lastClipboard = clipboard.readText() || "";
  pollInterval = setInterval(checkClipboard, 1000);
}

function createTray() {
  tray = new Tray(makeTrayIcon());
  tray.setToolTip("Pastr — click to show/hide");
  tray.on("click", () => {
    if (!win || win.isDestroyed()) return;
    win.isVisible() ? win.hide() : win.show();
  });
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
  // Limit item size to 50KB to prevent memory bloat
  if (text.length > 50000) {
    console.warn("Clipboard item too large, truncating");
    text = text.slice(0, 50000);
  }

  const idx = clipboardHistory.indexOf(text);
  if (idx === 0) return; // Already at top, skip
  if (idx > 0) clipboardHistory.splice(idx, 1); // Remove from wherever it is
  clipboardHistory.unshift(text);
  if (clipboardHistory.length > MAX_ITEMS) {
    clipboardHistory.pop(); // Faster than slice
  }
  if (win && !win.isDestroyed()) {
    win.webContents.send("clipboard-update", clipboardHistory);
  }
}

// ── Paste ─────────────────────────────────────────────────────────

function simulatePaste() {
  return new Promise((resolve, reject) => {
    if (IS_MAC) {
      // macOS: Use osascript to send Cmd+V (works on all Macs: Intel, M1, M2, etc.)
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
      // Windows: Use PowerShell to send Ctrl+V (works on all Windows versions & architectures)
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
      // Linux: Try xdotool first, fall back to other methods
      execFile("xdotool", ["key", "ctrl+v"], { timeout: 3000 }, (err) => {
        if (!err) {
          resolve();
        } else {
          // Fallback for systems without xdotool: try wmctrl or ydotool
          tryLinuxFallback(resolve, reject);
        }
      });
    }
  });
}

function tryLinuxFallback(resolve, reject) {
  // Try ydotool (xdotool alternative)
  execFile("ydotool", ["key", "ctrl+v"], { timeout: 3000 }, (err) => {
    if (!err) {
      resolve();
    } else {
      // Final fallback: use keyboard event injection if available
      reject(new Error("Neither xdotool nor ydotool available. Install: sudo apt-get install xdotool"));
    }
  });
}

// ── IPC Handlers ─────────────────────────────────────────────────

ipcMain.handle("paste-item", async (_event, text) => {
  ignoreClipboard = true;
  clipboard.writeText(text);
  lastClipboard = text;

  let error = null;
  try {
    await simulatePaste();
  } catch (e) {
    error = e.message;
    console.error("Paste failed:", e.message);
  }

  // Auto-remove: delete item from queue after successful paste
  if (!error && autoRemove) {
    clipboardHistory = clipboardHistory.filter((item) => item !== text);
    if (win && !win.isDestroyed()) {
      win.webContents.send("clipboard-update", clipboardHistory);
    }
  }

  setTimeout(() => { ignoreClipboard = false; lastClipboard = ""; }, 400);
  return { ok: !error, error, autoRemoved: !error && autoRemove };
});

ipcMain.handle("paste-next", async () => {
  if (clipboardHistory.length === 0) {
    return { ok: false, error: "Queue is empty" };
  }

  const text = clipboardHistory[0];
  ignoreClipboard = true;
  clipboard.writeText(text);
  lastClipboard = text;

  let error = null;
  try {
    await simulatePaste();
  } catch (e) {
    error = e.message;
    console.error("Paste failed:", e.message);
  }

  // Always remove after paste-next (this is the sequential behavior)
  if (!error) {
    clipboardHistory.shift();
    if (win && !win.isDestroyed()) {
      win.webContents.send("clipboard-update", clipboardHistory);
    }
  }

  setTimeout(() => { ignoreClipboard = false; lastClipboard = ""; }, 400);
  return { ok: !error, error, text, remaining: clipboardHistory.length };
});

ipcMain.handle("copy-item", (_event, text) => {
  ignoreClipboard = true;
  clipboard.writeText(text);
  lastClipboard = text;
  setTimeout(() => { ignoreClipboard = false; lastClipboard = ""; }, 250);
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
  return { history: clipboardHistory };
});

ipcMain.handle("toggle-sticky", (_event, sticky) => {
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(sticky, "screen-saver");
  }
  return { sticky };
});

ipcMain.handle("minimize-app", () => {
  if (win && !win.isDestroyed()) win.hide();
});

ipcMain.handle("close-app", () => {
  app.quit();
});

ipcMain.handle("set-auto-remove", (_event, enabled) => {
  autoRemove = enabled;
  return { autoRemove };
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

ipcMain.handle("use-prompt", (_event, text) => {
  // Push to queue so it shows up and can be pasted
  if (!clipboardHistory.includes(text)) {
    clipboardHistory.unshift(text);
    if (clipboardHistory.length > MAX_ITEMS) clipboardHistory.pop();
    if (win && !win.isDestroyed()) {
      win.webContents.send("clipboard-update", clipboardHistory);
    }
  }
  clipboard.writeText(text);
  return { ok: true };
});

// ── App lifecycle ────────────────────────────────────────────────

app.whenReady().then(() => {
  loadPrompts();
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  clearInterval(pollInterval);
  // Don't quit — let the tray keep the app alive
});

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Receive clipboard updates from main process
  onClipboardUpdate: (callback) => {
    ipcRenderer.on("clipboard-update", (_event, history) => callback(history));
  },

  // Get current history on load
  getHistory: () => ipcRenderer.invoke("get-history"),

  // Actions
  pasteItem: (text) => ipcRenderer.invoke("paste-item", text),
  pasteNext: () => ipcRenderer.invoke("paste-next"),
  copyItem: (text) => ipcRenderer.invoke("copy-item", text),
  deleteItem: (text) => ipcRenderer.invoke("delete-item", text),
  moveToTop: (text) => ipcRenderer.invoke("move-to-top", text),
  clearAll: () => ipcRenderer.invoke("clear-all"),

  // Window controls
  toggleSticky: (sticky) => ipcRenderer.invoke("toggle-sticky", sticky),
  minimizeApp: () => ipcRenderer.invoke("minimize-app"),
  closeApp: () => ipcRenderer.invoke("close-app"),

  // Saved prompts
  getPrompts:   ()     => ipcRenderer.invoke("get-prompts"),
  savePrompt:   (text) => ipcRenderer.invoke("save-prompt", text),
  deletePrompt: (id)   => ipcRenderer.invoke("delete-prompt", id),
  // Reprompt / AI config
  getConfig:        ()           => ipcRenderer.invoke("get-config"),
  saveConfig:       (cfg)        => ipcRenderer.invoke("save-config", cfg),
  reprompt:         (text, inst) => ipcRenderer.invoke("reprompt", text, inst),
  onRepromptStream: (cb) => {
    ipcRenderer.removeAllListeners("reprompt-stream");
    ipcRenderer.on("reprompt-stream", (_e, msg) => cb(msg));
  },
  setFocusable:     (v)          => ipcRenderer.invoke("set-focusable", v),
  openConfigWindow: ()           => ipcRenderer.invoke("open-config-window"),
});

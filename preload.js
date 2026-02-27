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

  // Auto-remove toggle
  setAutoRemove: (enabled) => ipcRenderer.invoke("set-auto-remove", enabled),

  // Window controls
  toggleSticky: (sticky) => ipcRenderer.invoke("toggle-sticky", sticky),
  minimizeApp: () => ipcRenderer.invoke("minimize-app"),
  closeApp: () => ipcRenderer.invoke("close-app"),
});

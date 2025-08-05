// Preload script for Electron
// This file runs in a special context that has access to both 
// the Node.js and browser environments

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods here if needed
  // Example:
  // sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  // onMessage: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});
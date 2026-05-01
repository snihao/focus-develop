const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (data) => ipcRenderer.invoke('write-file', data),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),

  // 应用信息
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // 事件监听
  onFileOpened: (callback) => {
    ipcRenderer.on('file-opened', (event, data) => callback(data))
  },
  onRequestSaveContent: (callback) => {
    ipcRenderer.on('request-save-content', () => callback())
  },

  // 移除监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },

  // 平台信息
  platform: process.platform,
})

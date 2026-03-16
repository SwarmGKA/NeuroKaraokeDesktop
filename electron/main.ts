import { app, BrowserWindow, ipcMain, WebContents } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { ApiClient } from './api/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 辅助函数：从 WebContents 获取 BrowserWindow
function getWindowFromWebContents(contents: WebContents): BrowserWindow | null {
  return BrowserWindow.fromWebContents(contents)
}

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 无边框窗口
    transparent: false,
    hasShadow: true,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ========== 窗口控制 IPC ==========

ipcMain.on('window-minimize', (event) => {
  event.sender.getOwnerBrowserWindow()?.minimize()
})

ipcMain.on('window-maximize', (event) => {
  const window = event.sender.getOwnerBrowserWindow()
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  }
})

ipcMain.on('window-close', (event) => {
  event.sender.getOwnerBrowserWindow()?.close()
})

ipcMain.on('window-start-drag', (event) => {
  event.sender.getOwnerBrowserWindow()?.startDragging()
})

// ========== API 调用 IPC ==========

// 播放列表相关
ipcMain.handle('api:get-playlist', async (_, id: string) => {
  return ApiClient.getPlaylist(id)
})

ipcMain.handle('api:get-official-playlists', async (_, startIndex: number, pageSize: number, year: number) => {
  return ApiClient.getOfficialPlaylists(startIndex, pageSize, year)
})

ipcMain.handle('api:get-public-playlists', async () => {
  return ApiClient.getPublicPlaylists()
})

// 歌曲相关
ipcMain.handle('api:get-song-lyrics', async (_, songId: string) => {
  return ApiClient.getSongLyrics(songId)
})

ipcMain.handle('api:search-songs', async (_, request) => {
  return ApiClient.searchSongs(request)
})

ipcMain.handle('api:get-song-details', async (_, songId: string) => {
  return ApiClient.getSongDetails(songId)
})

ipcMain.handle('api:get-song-poll', async (_, songId: string) => {
  return ApiClient.getSongPoll(songId)
})

// 艺术家相关
ipcMain.handle('api:get-all-artists', async () => {
  return ApiClient.getAllArtists()
})

// 探索相关
ipcMain.handle('api:get-trending-songs', async (_, days: number) => {
  return ApiClient.getTrendingSongs(days)
})

// 电台相关
ipcMain.handle('api:get-radio-current-state', async () => {
  return ApiClient.getRadioCurrentState()
})

ipcMain.handle('api:get-radio-stream-url', () => {
  return ApiClient.getRadioStreamUrl()
})

// 统计相关
ipcMain.handle('api:get-cover-distribution', async () => {
  return ApiClient.getCoverDistribution()
})

// ========== 数据存储 IPC ==========
// 简单的内存存储（实际项目中可以使用 electron-store）

const settingsStore = new Map<string, unknown>()

ipcMain.handle('store:get', async (_, key: string) => {
  return settingsStore.get(key)
})

ipcMain.handle('store:set', async (_, key: string, value: unknown) => {
  settingsStore.set(key, value)
  return true
})

ipcMain.handle('store:delete', async (_, key: string) => {
  settingsStore.delete(key)
  return true
})

// 启动应用
app.whenReady().then(createWindow)

import { app, BrowserWindow, ipcMain, WebContents } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
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
  const isMac = process.platform === 'darwin'

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 无边框窗口
    transparent: false, // 不透明
    hasShadow: true,
    // macOS: 设置红绿灯按钮位置（隐藏，因为我们有自定义标题栏）
    trafficLightPosition: isMac ? { x: -24, y: 12 } : undefined,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Windows 11: 无边框窗口默认会有系统圆角（如果系统设置启用）
  // macOS: 系统自动处理窗口样式
  // Linux: 通常由窗口管理器决定，无法通过代码控制

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
  getWindowFromWebContents(event.sender)?.minimize()
})

ipcMain.on('window-maximize', (event) => {
  const window = getWindowFromWebContents(event.sender)
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  }
})

ipcMain.on('window-close', (event) => {
  getWindowFromWebContents(event.sender)?.close()
})

// 窗口拖拽已通过 CSS -webkit-app-region: drag 实现，此处无需处理
ipcMain.on('window-start-drag', () => {
  // 窗口拖拽由前端 CSS 处理
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

// ========== i18n 文件读取 IPC ==========
ipcMain.handle('i18n:load-translations', async (_, lang: string) => {
  try {
    // 开发环境从 public 目录读取，生产环境从 resources 目录读取
    const fileName = lang === 'zh' ? 'zh-CN.properties' : 'en-US.properties'
    const devPath = path.join(process.env.APP_ROOT, 'public', 'i18n', fileName)

    // 生产环境路径：i18n 文件会被打包到 resources/i18n 目录
    const prodPath = path.join(process.resourcesPath, 'i18n', fileName)

    let filePath = devPath
    if (!VITE_DEV_SERVER_URL && fs.existsSync(prodPath)) {
      filePath = prodPath
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return { success: true, content }
    }

    return { success: false, error: `Translation file not found: ${filePath}` }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

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

// ========== 下载管理 IPC ==========

import type { DownloadedSong } from './downloadManager'
import { DownloadManager } from './downloadManager'

// ========== 下载管理 IPC ==========

ipcMain.handle('download:audio', async (_, songId: string, audioUrl: string, title: string) => {
  return DownloadManager.downloadAudio(songId, audioUrl, title)
})

ipcMain.handle('download:get-downloads', async () => {
  return DownloadManager.getDownloads()
})

ipcMain.handle('download:delete', async (_, songId: string) => {
  return DownloadManager.deleteDownload(songId)
})

ipcMain.handle('download:is-downloaded', async (_, songId: string) => {
  return DownloadManager.isDownloaded(songId)
})

// 下载进度事件
ipcMain.on('download:subscribe-progress', (event, songId: string) => {
  DownloadManager.subscribeProgress(songId, (progress) => {
    event.sender.send('download:progress', { songId, progress })
  })
})

// 启动应用
app.whenReady().then(createWindow)

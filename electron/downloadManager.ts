import { app, shell } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import http from 'node:http'

// 已下载歌曲的数据结构
export interface DownloadedSong {
  id: string
  title: string
  filePath: string
  fileSize: number
  downloadedAt: string
  // 封面信息
  coverUrl?: string
  artists?: string
}

// 下载进度回调类型
type ProgressCallback = (progress: number) => void

// 下载管理器
export class DownloadManager {
  private static downloadsDir: string
  private static metadataPath: string
  private static downloads: Map<string, DownloadedSong> = new Map()
  private static progressCallbacks: Map<string, Set<ProgressCallback>> = new Map()
  private static activeDownloads: Map<string, boolean> = new Map()

  // 初始化下载目录
  private static init() {
    if (this.downloadsDir) return

    const userDataPath = app.getPath('userData')
    this.downloadsDir = path.join(userDataPath, 'downloads')
    this.metadataPath = path.join(userDataPath, 'downloads-metadata.json')

    // 创建下载目录
    if (!fs.existsSync(this.downloadsDir)) {
      fs.mkdirSync(this.downloadsDir, { recursive: true })
    }

    // 加载元数据
    this.loadMetadata()
  }

  // 加载元数据
  private static loadMetadata() {
    try {
      if (fs.existsSync(this.metadataPath)) {
        const content = fs.readFileSync(this.metadataPath, 'utf-8')
        const data = JSON.parse(content) as DownloadedSong[]
        data.forEach(song => {
          this.downloads.set(song.id, song)
        })
      }
    } catch (error) {
      console.error('[DownloadManager] Failed to load metadata:', error)
    }
  }

  // 保存元数据
  private static saveMetadata() {
    try {
      const data = Array.from(this.downloads.values())
      fs.writeFileSync(this.metadataPath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      console.error('[DownloadManager] Failed to save metadata:', error)
    }
  }

  // 下载音频
  static async downloadAudio(
    songId: string,
    audioUrl: string,
    title: string,
    coverUrl?: string,
    artists?: string
  ): Promise<{ success: boolean; error?: string; song?: DownloadedSong }> {
    this.init()

    // 检查是否已下载
    if (this.downloads.has(songId)) {
      return { success: true, song: this.downloads.get(songId) }
    }

    // 检查是否正在下载
    if (this.activeDownloads.get(songId)) {
      return { success: false, error: 'Already downloading' }
    }

    this.activeDownloads.set(songId, true)

    try {
      // 创建安全的文件名
      const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_')
      const fileName = `${songId}-${safeTitle}.mp3`
      const filePath = path.join(this.downloadsDir, fileName)

      // 下载文件
      const downloadedSong = await this.downloadFile(audioUrl, filePath, songId, title)

      // 保存元数据
      this.downloads.set(songId, downloadedSong)
      this.saveMetadata()

      return { success: true, song: downloadedSong }
    } catch (error) {
      console.error('[DownloadManager] Download failed:', error)
      return { success: false, error: String(error) }
    } finally {
      this.activeDownloads.delete(songId)
      this.progressCallbacks.delete(songId)
    }
  }

  // 下载文件
  private static downloadFile(
    url: string,
    filePath: string,
    songId: string,
    title: string
  ): Promise<DownloadedSong> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http

      const file = fs.createWriteStream(filePath)
      let downloadedBytes = 0
      let totalBytes = 0

      const request = protocol.get(url, (response) => {
        // 处理重定向
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            file.close()
            fs.unlinkSync(filePath)
            this.downloadFile(redirectUrl, filePath, songId, title)
              .then(resolve)
              .catch(reject)
            return
          }
        }

        if (response.statusCode !== 200) {
          file.close()
          fs.unlinkSync(filePath)
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        totalBytes = parseInt(response.headers['content-length'] || '0', 10)

        response.pipe(file)

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length
          if (totalBytes > 0) {
            const progress = Math.round((downloadedBytes / totalBytes) * 100)
            this.notifyProgress(songId, progress)
          }
        })

        file.on('finish', () => {
          file.close()

          // 获取文件大小
          const stats = fs.statSync(filePath)

          const song: DownloadedSong = {
            id: songId,
            title,
            filePath,
            fileSize: stats.size,
            downloadedAt: new Date().toISOString(),
            coverUrl,
            artists,
          }

          resolve(song)
        })
      })

      request.on('error', (error) => {
        file.close()
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        reject(error)
      })

      request.setTimeout(30000, () => {
        request.destroy()
        file.close()
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        reject(new Error('Download timeout'))
      })
    })
  }

  // 获取已下载列表
  static getDownloads(): DownloadedSong[] {
    this.init()
    return Array.from(this.downloads.values())
  }

  // 删除下载
  static deleteDownload(songId: string): { success: boolean; error?: string } {
    this.init()

    const song = this.downloads.get(songId)
    if (!song) {
      return { success: false, error: 'Song not found' }
    }

    try {
      // 删除文件
      if (fs.existsSync(song.filePath)) {
        fs.unlinkSync(song.filePath)
      }

      // 从元数据中删除
      this.downloads.delete(songId)
      this.saveMetadata()

      return { success: true }
    } catch (error) {
      console.error('[DownloadManager] Delete failed:', error)
      return { success: false, error: String(error) }
    }
  }

  // 检查是否已下载
  static isDownloaded(songId: string): boolean {
    this.init()
    return this.downloads.has(songId)
  }

  // 订阅进度
  static subscribeProgress(songId: string, callback: ProgressCallback) {
    if (!this.progressCallbacks.has(songId)) {
      this.progressCallbacks.set(songId, new Set())
    }
    this.progressCallbacks.get(songId)!.add(callback)
  }

  // 通知进度
  private static notifyProgress(songId: string, progress: number) {
    const callbacks = this.progressCallbacks.get(songId)
    if (callbacks) {
      callbacks.forEach(cb => cb(progress))
    }
  }

  // 打开文件所在位置
  static showInFolder(songId: string): { success: boolean; error?: string } {
    this.init()

    const song = this.downloads.get(songId)
    if (!song) {
      return { success: false, error: 'Song not found' }
    }

    if (!fs.existsSync(song.filePath)) {
      return { success: false, error: 'File not found' }
    }

    shell.showItemInFolder(song.filePath)
    return { success: true }
  }
}

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
  coverPath?: string // 本地封面路径
  artists?: string
  originalArtists?: string
}

// 封面索引条目
interface CoverIndexEntry {
  songId: string
  audioFileName: string
  coverFileName: string
}

// 下载进度回调类型
type ProgressCallback = (progress: number) => void

// 下载管理器
export class DownloadManager {
  private static baseDir: string
  private static downloadsDir: string
  private static coversDir: string
  private static metadataPath: string
  private static coverIndexPath: string
  private static downloads: Map<string, DownloadedSong> = new Map()
  private static coverIndex: Map<string, string> = new Map() // songId -> coverFileName
  private static progressCallbacks: Map<string, Set<ProgressCallback>> = new Map()
  private static activeDownloads: Map<string, boolean> = new Map()

  // 初始化下载目录
  private static init() {
    if (this.baseDir) return

    const userDataPath = app.getPath('userData')
    this.baseDir = path.join(userDataPath, 'downloads')
    this.downloadsDir = path.join(this.baseDir, 'audio')
    this.coversDir = path.join(this.baseDir, 'covers')
    this.metadataPath = path.join(this.baseDir, 'metadata.json')
    this.coverIndexPath = path.join(this.baseDir, 'cover-index.json')

    // 创建目录
    if (!fs.existsSync(this.downloadsDir)) {
      fs.mkdirSync(this.downloadsDir, { recursive: true })
    }
    if (!fs.existsSync(this.coversDir)) {
      fs.mkdirSync(this.coversDir, { recursive: true })
    }

    // 加载元数据
    this.loadMetadata()
    this.loadCoverIndex()
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

  // 加载封面索引
  private static loadCoverIndex() {
    try {
      if (fs.existsSync(this.coverIndexPath)) {
        const content = fs.readFileSync(this.coverIndexPath, 'utf-8')
        const data = JSON.parse(content) as CoverIndexEntry[]
        data.forEach(entry => {
          this.coverIndex.set(entry.songId, entry.coverFileName)
        })
      }
    } catch (error) {
      console.error('[DownloadManager] Failed to load cover index:', error)
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

  // 保存封面索引
  private static saveCoverIndex() {
    try {
      const data: CoverIndexEntry[] = []
      this.downloads.forEach((song, songId) => {
        if (song.coverPath) {
          data.push({
            songId,
            audioFileName: path.basename(song.filePath),
            coverFileName: path.basename(song.coverPath),
          })
        }
      })
      fs.writeFileSync(this.coverIndexPath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      console.error('[DownloadManager] Failed to save cover index:', error)
    }
  }

  // 生成安全的文件名：歌名 - 原作者名
  private static generateFileName(title: string, originalArtists?: string): string {
    const safeTitle = (title || 'Unknown').replace(/[<>:"/\\|?*]/g, '_')
    const safeArtists = originalArtists ? ` - ${originalArtists.replace(/[<>:"/\\|?*]/g, '_')}` : ''
    return `${safeTitle}${safeArtists}`
  }

  // 下载音频
  static async downloadAudio(
    songId: string,
    audioUrl: string,
    title: string,
    coverUrl?: string,
    artists?: string,
    originalArtists?: string
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
      // 生成文件名
      const baseFileName = this.generateFileName(title, originalArtists)
      const audioFileName = `${baseFileName}.mp3`
      const audioPath = path.join(this.downloadsDir, audioFileName)

      // 下载音频文件
      const downloadedSong = await this.downloadFile(audioUrl, audioPath, songId, title, artists, originalArtists)

      // 下载封面
      let coverPath: string | undefined
      if (coverUrl) {
        try {
          const coverFileName = `${baseFileName}.jpg`
          coverPath = await this.downloadCover(coverUrl, coverFileName)
          downloadedSong.coverPath = coverPath
        } catch (error) {
          console.error('[DownloadManager] Failed to download cover:', error)
        }
      }

      // 保存元数据
      this.downloads.set(songId, downloadedSong)
      this.saveMetadata()
      this.saveCoverIndex()

      return { success: true, song: downloadedSong }
    } catch (error) {
      console.error('[DownloadManager] Download failed:', error)
      return { success: false, error: String(error) }
    } finally {
      this.activeDownloads.delete(songId)
      this.progressCallbacks.delete(songId)
    }
  }

  // 下载封面图片
  private static downloadCover(coverUrl: string, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const protocol = coverUrl.startsWith('https') ? https : http
      const coverPath = path.join(this.coversDir, fileName)

      // 如果文件已存在，直接返回
      if (fs.existsSync(coverPath)) {
        resolve(coverPath)
        return
      }

      const file = fs.createWriteStream(coverPath)

      const request = protocol.get(coverUrl, (response) => {
        // 处理重定向
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            file.close()
            fs.unlinkSync(coverPath)
            this.downloadCover(redirectUrl, fileName)
              .then(resolve)
              .catch(reject)
            return
          }
        }

        if (response.statusCode !== 200) {
          file.close()
          fs.unlinkSync(coverPath)
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        response.pipe(file)

        file.on('finish', () => {
          file.close()
          resolve(coverPath)
        })
      })

      request.on('error', (error) => {
        file.close()
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath)
        }
        reject(error)
      })

      request.setTimeout(15000, () => {
        request.destroy()
        file.close()
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath)
        }
        reject(new Error('Cover download timeout'))
      })
    })
  }

  // 下载文件
  private static downloadFile(
    url: string,
    filePath: string,
    songId: string,
    title: string,
    artists?: string,
    originalArtists?: string
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
            this.downloadFile(redirectUrl, filePath, songId, title, artists, originalArtists)
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
            artists,
            originalArtists,
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

      request.setTimeout(60000, () => {
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
      // 删除音频文件
      if (fs.existsSync(song.filePath)) {
        fs.unlinkSync(song.filePath)
      }

      // 删除封面文件
      if (song.coverPath && fs.existsSync(song.coverPath)) {
        fs.unlinkSync(song.coverPath)
      }

      // 从元数据中删除
      this.downloads.delete(songId)
      this.coverIndex.delete(songId)
      this.saveMetadata()
      this.saveCoverIndex()

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

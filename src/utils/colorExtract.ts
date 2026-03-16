// 封面颜色提取工具

export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

// RGB 转 HSL
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

// HSL 转 RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

// 计算颜色的感知亮度
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// 判断是否需要深色文字
export function needsDarkText(r: number, g: number, b: number): boolean {
  return getLuminance(r, g, b) > 0.5
}

// 从图片提取主色调
export function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve('#667eea')
        return
      }

      // 缩小图片以加快处理速度
      const size = 50
      canvas.width = size
      canvas.height = size

      ctx.drawImage(img, 0, 0, size, size)

      const imageData = ctx.getImageData(0, 0, size, size)
      const pixels = imageData.data

      // 简单的颜色量化 - 收集所有像素的颜色
      const colorCounts: Map<string, { count: number; r: number; g: number; b: number }> = new Map()

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        if (a < 128) continue // 跳过透明像素

        // 量化颜色 (减少颜色数量)
        const qr = Math.round(r / 32) * 32
        const qg = Math.round(g / 32) * 32
        const qb = Math.round(b / 32) * 32

        const key = `${qr},${qg},${qb}`

        const existing = colorCounts.get(key)
        if (existing) {
          existing.count++
        } else {
          colorCounts.set(key, { count: 1, r: qr, g: qg, b: qb })
        }
      }

      // 找出出现次数最多的颜色
      let dominantColor = { r: 102, g: 126, b: 234 } // 默认颜色
      let maxCount = 0

      colorCounts.forEach((value) => {
        if (value.count > maxCount) {
          // 避免太亮或太暗的颜色
          const hsl = rgbToHsl(value.r, value.g, value.b)
          if (hsl.l > 20 && hsl.l < 80 && hsl.s > 10) {
            maxCount = value.count
            dominantColor = value
          }
        }
      })

      // 调整颜色使其更适合作为背景
      const hsl = rgbToHsl(dominantColor.r, dominantColor.g, dominantColor.b)

      // 降低饱和度，调整亮度
      hsl.s = Math.min(hsl.s * 0.7, 60)
      hsl.l = Math.max(20, Math.min(hsl.l * 0.8, 50))

      const adjusted = hslToRgb(hsl.h, hsl.s, hsl.l)

      resolve(`rgb(${adjusted.r}, ${adjusted.g}, ${adjusted.b})`)
    }

    img.onerror = () => {
      resolve('#667eea')
    }

    img.src = imageUrl
  })
}

// 生成渐变色
export function generateGradient(color: string): string {
  // 解析 RGB 值
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return `linear-gradient(180deg, ${color} 0%, #000000 100%)`

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  // 生成更暗的版本
  const darkR = Math.round(r * 0.3)
  const darkG = Math.round(g * 0.3)
  const darkB = Math.round(b * 0.3)

  return `linear-gradient(180deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${darkR}, ${darkG}, ${darkB}) 100%)`
}

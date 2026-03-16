// API 客户端模块

export const API_BASE_URL = 'https://api.neurokaraoke.com';
export const IDK_BASE_URL = 'https://idk.neurokaraoke.com';
export const RADIO_SOCKET_URL = 'https://socket.neurokaraoke.com';
export const RADIO_STREAM_URL = 'https://radio.twinskaraoke.com';
export const IMAGE_CDN_URL = 'https://images.neurokaraoke.com';
export const STORAGE_URL = 'https://storage.neurokaraoke.com';
export const HLS_BASE_URL = 'https://hls.neurokaraoke.com';

// 图片 URL 生成函数
export function getImageUrl(cloudflareId: string | undefined, fallbackPath?: string): string | undefined {
  if (cloudflareId) {
    return `${IMAGE_CDN_URL}/${cloudflareId}/public`;
  }
  if (fallbackPath) {
    if (fallbackPath.startsWith('http')) {
      return fallbackPath;
    }
    return `${STORAGE_URL}${fallbackPath.startsWith('/') ? '' : '/'}${fallbackPath}`;
  }
  return undefined;
}

// 音频 URL 生成函数
export function getAudioUrl(absolutePath: string | undefined): string | undefined {
  if (!absolutePath) return undefined;
  if (absolutePath.startsWith('http')) return absolutePath;
  return `${STORAGE_URL}${absolutePath.startsWith('/') ? '' : '/'}${absolutePath}`;
}

// HLS 流 URL 生成函数
export function getHlsUrl(hlsPath: string | undefined): string | undefined {
  if (!hlsPath) return undefined;
  if (hlsPath.startsWith('http')) return hlsPath;
  return `${HLS_BASE_URL}/${hlsPath}`;
}

async function handleResponse<T>(response: globalThis.Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '无法读取错误信息');
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const text = await response.text();

  // 尝试解析 JSON
  try {
    const json = JSON.parse(text);

    // 检查是否是包装格式 { data: ..., message: ..., success: ... }
    if (json && typeof json === 'object') {
      // 如果有 data 字段且 success 不为 false，返回 data
      if ('data' in json && json.success !== false) {
        return json.data;
      }
      // 如果有 message 且 success 为 false，抛出错误
      if ('success' in json && json.success === false) {
        throw new Error(json.message || '请求失败');
      }
    }

    // 直接返回 JSON 数据
    return json as T;
  } catch (e) {
    // JSON 解析失败，返回空或抛出错误
    if (e instanceof SyntaxError) {
      console.error('JSON 解析失败:', text.substring(0, 200));
      throw new Error('响应格式错误');
    }
    throw e;
  }
}

async function get<T>(url: string): Promise<T> {
  console.log(`发送 GET 请求: ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'NeuroKaraokeDesktop/1.0',
    },
  });
  return handleResponse<T>(response);
}

async function post<T>(url: string, body: unknown): Promise<T> {
  console.log(`发送 POST 请求: ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'NeuroKaraokeDesktop/1.0',
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

// 导出 API 函数
export const ApiClient = {
  // 播放列表相关
  async getPlaylist(id: string) {
    const url = `${IDK_BASE_URL}/public/playlist/${id}`;
    return get<import('./models').Playlist>(url);
  },

  async getOfficialPlaylists(startIndex: number, pageSize: number, year: number) {
    // 正确的端点: /api/playlists (不是 /api/playlists/official)
    const url = `${API_BASE_URL}/api/playlists?startIndex=${startIndex}&pageSize=${pageSize}&isSetlist=true&year=${year}`;
    return get<import('./models').Playlist[]>(url);
  },

  async getPublicPlaylists() {
    // 正确的端点: /api/playlist/public (注意是单数 playlist)
    const url = `${API_BASE_URL}/api/playlist/public`;
    return get<import('./models').Playlist[]>(url);
  },

  // 歌曲相关
  async getSongLyrics(songId: string) {
    const url = `${API_BASE_URL}/api/songs/${songId}/lyrics`;
    return get<import('./models').Lyric[]>(url);
  },

  async searchSongs(request: import('./models').SongSearchRequest) {
    const url = `${API_BASE_URL}/api/songs/search`;
    return post<import('./models').SongSearchResponse>(url, request);
  },

  async getSongDetails(songId: string) {
    const url = `${API_BASE_URL}/api/songs/${songId}`;
    return get<import('./models').Song>(url);
  },

  async getSongPoll(songId: string) {
    const url = `${API_BASE_URL}/api/polls/song/${songId}`;
    return get<import('./models').SongPoll[]>(url);
  },

  // 艺术家相关
  async getAllArtists() {
    const url = `${API_BASE_URL}/api/artists`;
    return get<import('./models').Artist[]>(url);
  },

  // 探索相关
  async getTrendingSongs(days: number) {
    // 正确的端点: /api/explore/trendings (复数)
    const url = `${API_BASE_URL}/api/explore/trendings?days=${days}`;
    return get<import('./models').TrendingSong[]>(url);
  },

  // 电台相关
  async getRadioCurrentState() {
    const url = `${RADIO_SOCKET_URL}/api/radio/current-state`;
    return get<import('./models').RadioState>(url);
  },

  getRadioStreamUrl() {
    return `${RADIO_STREAM_URL}/listen/neuro_21/radio.mp3`;
  },

  // 统计相关
  async getCoverDistribution() {
    // 正确的端点: /api/stats/cover-distribution (不是 statistics)
    const url = `${API_BASE_URL}/api/stats/cover-distribution`;
    return get<import('./models').CoverDistribution>(url);
  },
};

// API 客户端模块

export const API_BASE_URL = 'https://api.neurokaraoke.com';
export const IDK_BASE_URL = 'https://idk.neurokaraoke.com';
export const RADIO_SOCKET_URL = 'https://socket.neurokaraoke.com';
export const RADIO_STREAM_URL = 'https://radio.twinskaraoke.com';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

async function handleResponse<T>(response: globalThis.Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '无法读取错误信息');
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const text = await response.text();
  const apiResponse: ApiResponse<T> = JSON.parse(text);

  if (apiResponse.data !== undefined && apiResponse.data !== null) {
    return apiResponse.data;
  }

  throw new Error(apiResponse.message || '未知错误');
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
    const url = `${API_BASE_URL}/api/playlists/official?startIndex=${startIndex}&pageSize=${pageSize}&year=${year}`;
    return get<import('./models').Playlist[]>(url);
  },

  async getPublicPlaylists() {
    const url = `${API_BASE_URL}/api/playlists/public`;
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
    const url = `${API_BASE_URL}/api/songs/${songId}/poll`;
    return get<import('./models').SongPoll[]>(url);
  },

  // 艺术家相关
  async getAllArtists() {
    const url = `${API_BASE_URL}/api/artists`;
    return get<import('./models').Artist[]>(url);
  },

  // 探索相关
  async getTrendingSongs(days: number) {
    const url = `${API_BASE_URL}/api/explore/trending?days=${days}`;
    return get<import('./models').TrendingSong[]>(url);
  },

  // 电台相关
  async getRadioCurrentState() {
    const url = `${RADIO_SOCKET_URL}/api/radio/current-state`;
    return get<import('./models').RadioState>(url);
  },

  getRadioStreamUrl() {
    return RADIO_STREAM_URL;
  },

  // 统计相关
  async getCoverDistribution() {
    const url = `${API_BASE_URL}/api/statistics/cover-distribution`;
    return get<import('./models').CoverDistribution>(url);
  },
};

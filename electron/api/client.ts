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
    const errorText = await response.text().catch(() => 'Unable to read error');
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const text = await response.text();

  // Try to parse JSON
  try {
    const json = JSON.parse(text);

    // Check if it's a wrapped format { data: ..., message: ..., success: ... }
    if (json && typeof json === 'object') {
      // If has data field and success is not false, return data
      if ('data' in json && json.success !== false) {
        return json.data;
      }
      // If has message and success is false, throw error
      if ('success' in json && json.success === false) {
        throw new Error(json.message || 'Request failed');
      }
    }

    // Return JSON data directly
    return json as T;
  } catch (e) {
    // JSON parse failed
    if (e instanceof SyntaxError) {
      console.error('[API] JSON parse failed:', text.substring(0, 200));
      throw new Error('Invalid response format');
    }
    throw e;
  }
}

async function get<T>(url: string): Promise<T> {
  console.log(`[API] GET: ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'NeuroKaraokeDesktop/1.0',
    },
  });
  return handleResponse<T>(response);
}

// 缓存所有歌曲数据
let allSongsCache: import('./models').SongListItem[] | null = null;

// 客户端搜索过滤函数
function filterSongs(
  songs: import('./models').SongListItem[],
  request: import('./models').SongSearchRequest
): import('./models').SongListItem[] {
  let filtered = [...songs];

  // 文本搜索 - 支持分词搜索
  if (request.search) {
    const searchTerms = request.search.toLowerCase().trim().split(/\s+/).filter(Boolean);

    if (searchTerms.length > 0) {
      filtered = filtered.filter(song => {
        const titleLower = song.title?.toLowerCase() || '';
        const coverArtistsLower = song.coverArtists?.map(a => a.toLowerCase()).join(' ') || '';
        const originalArtistsLower = song.originalArtists?.map(a => a.toLowerCase()).join(' ') || '';
        const searchText = `${titleLower} ${coverArtistsLower} ${originalArtistsLower}`;

        // 匹配任意一个关键词即可
        return searchTerms.some(term => searchText.includes(term));
      });
    }
  }

  return filtered;
}

// 导出 API 函数
export const ApiClient = {
  // 播放列表相关
  async getPlaylist(id: string) {
    const url = `${IDK_BASE_URL}/public/playlist/${id}`;
    return get<import('./models').Playlist>(url);
  },

  async getOfficialPlaylists(startIndex: number, pageSize: number, year: number) {
    const url = `${API_BASE_URL}/api/playlists?startIndex=${startIndex}&pageSize=${pageSize}&isSetlist=true&year=${year}`;
    return get<import('./models').Playlist[]>(url);
  },

  async getPublicPlaylists() {
    const url = `${API_BASE_URL}/api/playlist/public`;
    return get<import('./models').Playlist[]>(url);
  },

  // 歌曲相关
  async getSongLyrics(songId: string) {
    const url = `${API_BASE_URL}/api/songs/${songId}/lyrics`;
    return get<import('./models').Lyric[]>(url);
  },

  async searchSongs(request: import('./models').SongSearchRequest) {
    // Fetch all songs if not cached
    if (!allSongsCache) {
      console.log('[API] Fetching all songs for search...');
      const url = `${API_BASE_URL}/api/songs`;
      allSongsCache = await get<import('./models').SongListItem[]>(url);
      console.log(`[API] Cached ${allSongsCache?.length || 0} songs`);
    }

    // Client-side filtering
    const filtered = filterSongs(allSongsCache!, request);
    console.log(`[API] Search "${request.search}" found ${filtered.length} songs`);

    // Debug: print first result's cover data
    if (filtered.length > 0) {
      const first = filtered[0];
      console.log('[DEBUG] First result cover data:', JSON.stringify({
        title: first.title,
        coverArt: first.coverArt,
        thumbnailArt: first.thumbnailArt,
      }, null, 2));
    }

    // Pagination
    const page = request.page || 0;
    const pageSize = request.pageSize || 20;
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalCount: filtered.length,
      page: page,
      pageSize: pageSize,
    } as import('./models').SongSearchResponse;
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
    const url = `${API_BASE_URL}/api/stats/cover-distribution`;
    return get<import('./models').CoverDistribution>(url);
  },
};

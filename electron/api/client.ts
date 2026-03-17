// API Client Module

export const API_BASE_URL = 'https://api.neurokaraoke.com';
export const IDK_BASE_URL = 'https://idk.neurokaraoke.com';
export const RADIO_SOCKET_URL = 'https://socket.neurokaraoke.com';
export const RADIO_STREAM_URL = 'https://radio.twinskaraoke.com';
export const IMAGE_CDN_URL = 'https://images.neurokaraoke.com';
export const STORAGE_URL = 'https://storage.neurokaraoke.com';
export const HLS_BASE_URL = 'https://hls.neurokaraoke.com';

// Image URL generator
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

// Audio URL generator
export function getAudioUrl(absolutePath: string | undefined): string | undefined {
  if (!absolutePath) return undefined;
  if (absolutePath.startsWith('http')) return absolutePath;
  return `${STORAGE_URL}${absolutePath.startsWith('/') ? '' : '/'}${absolutePath}`;
}

// HLS stream URL generator
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

  try {
    const json = JSON.parse(text);

    // Check if it's a wrapped format { data: ..., message: ..., success: ... }
    if (json && typeof json === 'object') {
      if ('data' in json && json.success !== false) {
        return json.data;
      }
      if ('success' in json && json.success === false) {
        throw new Error(json.message || 'Request failed');
      }
    }

    return json as T;
  } catch (e) {
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

async function post<T>(url: string, body?: object): Promise<T> {
  console.log(`[API] POST: ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'NeuroKaraokeDesktop/1.0',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

// Song details cache (songId -> Song with coverArt)
const songDetailsCache = new Map<string, import('./models').Song>()

// Get song details from cache or fetch
export function getSongDetailsFromCache(songId: string | undefined): import('./models').Song | undefined {
  if (!songId) return undefined
  return songDetailsCache.get(songId)
}

// Export API functions
export const ApiClient = {
  // Playlists
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

  // Songs
  async getSongLyrics(songId: string) {
    const url = `${API_BASE_URL}/api/songs/${songId}/lyrics`;
    return get<import('./models').Lyric[]>(url);
  },

  async searchSongs(request: import('./models').SongSearchRequest) {
    // Use POST /api/songs with search parameter for server-side search
    const requestBody = {
      search: request.search || null,
      page: request.page || 0,
      pageSize: request.pageSize || 20,
      sortBy: request.sortBy || 'KaraokeDate',
      sortDesc: request.sortDesc !== false,
      genreIds: request.genreIds || null,
      themeIds: request.themeIds || null,
      moodIds: request.moodIds || null,
      artistIds: request.artistIds || null,
      coverArtistIds: request.coverArtistIds || null,
      energyLevel: request.energyLevel || null,
      tempo: request.tempo || null,
      key: request.key || null,
      karaokeStart: request.karaokeStart || null,
      karaokeEnd: request.karaokeEnd || null,
    };

    const response = await post<import('./models').SongSearchResponse>(
      `${API_BASE_URL}/api/songs`,
      requestBody
    );

    console.log(`[API] Search "${request.search}" found ${response?.totalCount || 0} songs`);

    return response;
  },

  async getSongDetails(songId: string) {
    // Check cache first
    const cached = songDetailsCache.get(songId);
    if (cached) return cached;

    const url = `${API_BASE_URL}/api/songs/${songId}`;
    const song = await get<import('./models').Song>(url);

    // Cache the result
    if (song) {
      songDetailsCache.set(songId, song);
    }

    return song;
  },

  async getSongPoll(songId: string) {
    const url = `${API_BASE_URL}/api/polls/song/${songId}`;
    return get<import('./models').SongPoll[]>(url);
  },

  // Artists
  async getAllArtists() {
    const url = `${API_BASE_URL}/api/artists`;
    return get<import('./models').Artist[]>(url);
  },

  // Explore
  async getTrendingSongs(days: number) {
    const url = `${API_BASE_URL}/api/explore/trendings?days=${days}`;
    return get<import('./models').TrendingSong[]>(url);
  },

  // Radio
  async getRadioCurrentState() {
    const url = `${RADIO_SOCKET_URL}/api/radio/current-state`;
    return get<import('./models').RadioState>(url);
  },

  getRadioStreamUrl() {
    return `${RADIO_STREAM_URL}/listen/neuro_21/radio.mp3`;
  },

  // Stats
  async getCoverDistribution() {
    const url = `${API_BASE_URL}/api/stats/cover-distribution`;
    return get<import('./models').CoverDistribution>(url);
  },
};

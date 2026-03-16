import axios, { AxiosInstance } from 'axios';
import {
  ApiResponse,
  Artist,
  CoverDistribution,
  Lyric,
  Playlist,
  RadioState,
  Song,
  SongPoll,
  SongSearchRequest,
  SongSearchResponse,
  TrendingSong,
} from './types';

const API_BASE_URL = 'https://api.neurokaraoke.com';
const IDK_BASE_URL = 'https://idk.neurokaraoke.com';
const RADIO_SOCKET_URL = 'https://socket.neurokaraoke.com';
const RADIO_STREAM_URL = 'https://radio.twinskaraoke.com';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'NeuroKaraokeDesktop/1.0',
      },
    });
  }

  private async get<T>(url: string): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url);
    const apiResponse = response.data;

    if (apiResponse.data) {
      return apiResponse.data;
    }

    throw new Error(apiResponse.message || '未知错误');
  }

  private async post<T>(url: string, body: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, body);
    const apiResponse = response.data;

    if (apiResponse.data) {
      return apiResponse.data;
    }

    throw new Error(apiResponse.message || '未知错误');
  }

  async getPlaylist(id: string): Promise<Playlist> {
    const url = `${IDK_BASE_URL}/public/playlist/${id}`;
    return this.get<Playlist>(url);
  }

  async getOfficialPlaylists(
    startIndex: number,
    pageSize: number,
    year: number
  ): Promise<Playlist[]> {
    const url = `${API_BASE_URL}/api/playlists/official?startIndex=${startIndex}&pageSize=${pageSize}&year=${year}`;
    return this.get<Playlist[]>(url);
  }

  async getPublicPlaylists(): Promise<Playlist[]> {
    const url = `${API_BASE_URL}/api/playlists/public`;
    return this.get<Playlist[]>(url);
  }

  async getSongLyrics(songId: string): Promise<Lyric[]> {
    const url = `${API_BASE_URL}/api/songs/${songId}/lyrics`;
    return this.get<Lyric[]>(url);
  }

  async searchSongs(request: SongSearchRequest): Promise<SongSearchResponse> {
    const url = `${API_BASE_URL}/api/songs/search`;
    return this.post<SongSearchResponse>(url, request);
  }

  async getSongDetails(songId: string): Promise<Song> {
    const url = `${API_BASE_URL}/api/songs/${songId}`;
    return this.get<Song>(url);
  }

  async getSongPoll(songId: string): Promise<SongPoll[]> {
    const url = `${API_BASE_URL}/api/songs/${songId}/poll`;
    return this.get<SongPoll[]>(url);
  }

  async getAllArtists(): Promise<Artist[]> {
    const url = `${API_BASE_URL}/api/artists`;
    return this.get<Artist[]>(url);
  }

  async getTrendingSongs(days: number): Promise<TrendingSong[]> {
    const url = `${API_BASE_URL}/api/explore/trending?days=${days}`;
    return this.get<TrendingSong[]>(url);
  }

  async getRadioCurrentState(): Promise<RadioState> {
    const url = `${RADIO_SOCKET_URL}/api/radio/current-state`;
    return this.get<RadioState>(url);
  }

  getRadioStreamUrl(): string {
    return RADIO_STREAM_URL;
  }

  async getCoverDistribution(): Promise<CoverDistribution> {
    const url = `${API_BASE_URL}/api/statistics/cover-distribution`;
    return this.get<CoverDistribution>(url);
  }
}

export const apiClient = new ApiClient();

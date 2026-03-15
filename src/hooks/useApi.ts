import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface Playlist {
  id?: string;
  name?: string;
  cover?: string;
  song_count?: number;
  set_list_date?: string;
  media?: Media;
  mosaic_media?: Media[];
  song_list_dtos?: SongListDTO[];
  description?: string;
  created_by?: string;
}

export interface Media {
  cloudflare_id?: string;
  absolute_path?: string;
}

export interface SongListDTO {
  id?: string;
  absolute_path?: string;
  title?: string;
}

export interface Song {
  id?: string;
  title?: string;
  audio_url?: string;
  absolute_path?: string;
  duration?: number;
  play_count?: number;
  stream_date?: string;
  date_added?: string;
  cover_artists?: SongArtist[];
  original_artists?: SongArtist[];
  genres?: SongTag[];
  moods?: SongTag[];
  themes?: SongTag[];
  metadata?: SongMetadata;
  similar_songs?: SongListItem[];
  cover_art?: CoverArt;
  videos?: Video[];
  lyrics_dtos?: Lyric[];
  setlist?: string;
  setlist_id?: string;
  video_id?: string;
  hls?: string;
  has_lyrics?: boolean;
  user_uploaded?: boolean;
  karaoke_date?: string;
}

export interface SongMetadata {
  tempo_bpm?: number;
  genre?: string;
  key?: string;
  energy_level?: number;
  language?: string;
  comments?: string;
  occasion?: string;
  description?: string;
  writers?: string;
  composers?: string;
  featured_artists?: string;
  publishers?: string;
  updated_by?: string;
  updated_date?: string;
  foreign_title?: string;
  english_title?: string;
}

export interface SongArtist {
  id?: string;
  name?: string;
}

export interface SongTag {
  id?: string;
  name?: string;
  song_count?: number;
}

export interface CoverArt {
  id?: string;
  file_name?: string;
  content_type?: string;
  description?: string;
  credit?: string;
  cloudflare_id?: string;
  media_storage_type?: number;
  absolute_path?: string;
  artist?: CoverArtArtist;
  upvotes?: number;
  tag_string?: string;
}

export interface CoverArtArtist {
  id?: string;
  name?: string;
  social_link?: string;
  user_id?: string;
  arts?: string[];
}

export interface Video {
  id?: string;
  song_id?: string;
  song_title?: string;
  name?: string;
  description?: string;
  content_type?: string;
  absolute_path?: string;
  url?: string;
  video_type?: number;
  cloudflare_id?: string;
  created_by?: string;
  thumbnail_url?: string;
  duration?: number;
  width?: number;
  height?: number;
  created_date?: string;
}

export interface Lyric {
  time?: string;
  text?: string;
}

export interface SongPoll {
  id?: string;
  song_id?: string;
  song_title?: string;
  date?: string;
  total_votes?: number;
  masterpiece?: number;
  amazing?: number;
  good?: number;
  bad?: number;
}

export interface SongSearchRequest {
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_desc?: boolean;
  genre_ids?: string[];
  theme_ids?: string[];
  mood_ids?: string[];
  artist_ids?: string[];
  cover_artist_ids?: string[];
  energy_level?: number;
  tempo?: number;
  key?: string;
  karaoke_start?: string;
  karaoke_end?: string;
}

export interface SongSearchResponse {
  items?: SongListItem[];
  total_count?: number;
  page?: number;
  page_size?: number;
}

export interface SongListItem {
  id?: string;
  title?: string;
  absolute_path?: string;
  play_count?: number;
  duration?: number;
  stream_date?: string;
  date_added?: string;
  cover_artists?: string[];
  original_artists?: string[];
  genres?: SongTag[];
  cover_art?: CoverArt;
  thumbnail_art?: CoverArt;
  order?: number;
  has_lyrics?: boolean;
  user_uploaded?: boolean;
  video_id?: string;
  hls?: string;
}

export interface Artist {
  id?: string;
  name?: string;
  image_path?: string;
  song_count?: number;
  summary?: string;
}

export interface RadioState {
  current?: RadioSong;
  upcoming?: RadioSong[];
  history?: RadioSong[];
  listener_count?: number;
  offline?: boolean;
}

export interface RadioSong {
  id?: string;
  title?: string;
  original_artists?: string[];
  cover_artists?: string[];
  duration?: number;
  cover_art?: RadioCoverArt;
}

export interface RadioCoverArt {
  cloudflare_id?: string;
  credit?: string;
}

export interface TrendingSong {
  title?: string;
  original_artists?: string[];
  cover_artists?: string[];
  absolute_path?: string;
  duration?: number;
  cover_art?: TrendingCoverArt;
}

export interface TrendingCoverArt {
  cloudflare_id?: string;
  absolute_path?: string;
  credit?: string;
}

export interface CoverDistribution {
  total_songs?: number;
  neuro_count?: number;
  evil_count?: number;
  duet_count?: number;
  other_count?: number;
}

interface ApiHookResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function usePlaylists() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [officialPlaylists, setOfficialPlaylists] = useState<Playlist[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlaylist = useCallback(async (id: string): Promise<ApiHookResult<Playlist>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Playlist>("get_playlist", { id });
      setPlaylist(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取播放列表失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOfficialPlaylists = useCallback(
    async (startIndex: number, pageSize: number, year: number): Promise<ApiHookResult<Playlist[]>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await invoke<Playlist[]>("get_official_playlists", {
          startIndex,
          pageSize,
          year,
        });
        setOfficialPlaylists(result);
        return { data: result, loading: false, error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "获取官方播放列表失败";
        setError(errorMessage);
        return { data: null, loading: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPublicPlaylists = useCallback(async (): Promise<ApiHookResult<Playlist[]>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Playlist[]>("get_public_playlists");
      setPublicPlaylists(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取公开播放列表失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    playlist,
    officialPlaylists,
    publicPlaylists,
    loading,
    error,
    getPlaylist,
    getOfficialPlaylists,
    getPublicPlaylists,
  };
}

export function useSongs() {
  const [lyrics, setLyrics] = useState<Lyric[]>([]);
  const [searchResults, setSearchResults] = useState<SongSearchResponse | null>(null);
  const [songDetails, setSongDetails] = useState<Song | null>(null);
  const [songPoll, setSongPoll] = useState<SongPoll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSongLyrics = useCallback(async (songId: string): Promise<ApiHookResult<Lyric[]>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Lyric[]>("get_song_lyrics", { songId });
      setLyrics(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取歌曲歌词失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchSongs = useCallback(
    async (request: SongSearchRequest): Promise<ApiHookResult<SongSearchResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await invoke<SongSearchResponse>("search_songs", { request });
        setSearchResults(result);
        return { data: result, loading: false, error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "搜索歌曲失败";
        setError(errorMessage);
        return { data: null, loading: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSongDetails = useCallback(async (songId: string): Promise<ApiHookResult<Song>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Song>("get_song_details", { songId });
      setSongDetails(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取歌曲详情失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getSongPoll = useCallback(async (songId: string): Promise<ApiHookResult<SongPoll[]>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<SongPoll[]>("get_song_poll", { songId });
      setSongPoll(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取歌曲投票失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    lyrics,
    searchResults,
    songDetails,
    songPoll,
    loading,
    error,
    getSongLyrics,
    searchSongs,
    getSongDetails,
    getSongPoll,
  };
}

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllArtists = useCallback(async (): Promise<ApiHookResult<Artist[]>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Artist[]>("get_all_artists");
      setArtists(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取艺术家列表失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    artists,
    loading,
    error,
    getAllArtists,
  };
}

export function useRadio() {
  const [radioState, setRadioState] = useState<RadioState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRadioCurrentState = useCallback(async (): Promise<ApiHookResult<RadioState>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<RadioState>("get_radio_current_state");
      setRadioState(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取电台状态失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getRadioStreamUrl = useCallback(async (): Promise<ApiHookResult<string>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<string>("get_radio_stream_url");
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取电台流 URL 失败";
      setError(errorMessage);
      return { data: "", loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    radioState,
    loading,
    error,
    getRadioCurrentState,
    getRadioStreamUrl,
  };
}

export function useExplore() {
  const [trendingSongs, setTrendingSongs] = useState<TrendingSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTrendingSongs = useCallback(async (days: number): Promise<ApiHookResult<TrendingSong[]>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<TrendingSong[]>("get_trending_songs", { days });
      setTrendingSongs(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取热门歌曲失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trendingSongs,
    loading,
    error,
    getTrendingSongs,
  };
}

export function useStatistics() {
  const [coverDistribution, setCoverDistribution] = useState<CoverDistribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCoverDistribution = useCallback(async (): Promise<ApiHookResult<CoverDistribution>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<CoverDistribution>("get_cover_distribution");
      setCoverDistribution(result);
      return { data: result, loading: false, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取封面分布失败";
      setError(errorMessage);
      return { data: null, loading: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    coverDistribution,
    loading,
    error,
    getCoverDistribution,
  };
}

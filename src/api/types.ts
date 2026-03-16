export interface Media {
  cloudflare_id?: string;
  absolute_path?: string;
}

export interface SongListDTO {
  id?: string;
  absolute_path?: string;
  title?: string;
}

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

export interface PlaylistSong {
  title?: string;
  original_artists?: string;
  cover_artists?: string;
  cover_art?: string;
  audio_url?: string;
  art_credit?: string;
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

export interface CoverArtArtist {
  id?: string;
  name?: string;
  social_link?: string;
  user_id?: string;
  arts?: string[];
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

export interface SongSearchResponse {
  items?: SongListItem[];
  total_count?: number;
  page?: number;
  page_size?: number;
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

export interface Artist {
  id?: string;
  name?: string;
  image_path?: string;
  song_count?: number;
  summary?: string;
}

export interface RadioCoverArt {
  cloudflare_id?: string;
  credit?: string;
}

export interface RadioSong {
  id?: string;
  title?: string;
  original_artists?: string[];
  cover_artists?: string[];
  duration?: number;
  cover_art?: RadioCoverArt;
}

export interface RadioState {
  current?: RadioSong;
  upcoming?: RadioSong[];
  history?: RadioSong[];
  listener_count?: number;
  offline?: boolean;
}

export interface CoverDistribution {
  total_songs?: number;
  neuro_count?: number;
  evil_count?: number;
  duet_count?: number;
  other_count?: number;
}

export interface TrendingCoverArt {
  cloudflare_id?: string;
  absolute_path?: string;
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

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

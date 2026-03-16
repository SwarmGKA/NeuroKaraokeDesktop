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

// API 数据模型定义（驼峰命名匹配 API 返回格式）

// 播放列表相关
export interface Playlist {
  id?: string;
  name?: string;
  cover?: string;
  songCount?: number;  // API 返回 songCount
  setListDate?: string;
  media?: Media;
  mosaicMedia?: Media[];  // API 返回 mosaicMedia
  songListDTOs?: SongListDTO[];
  description?: string;
  createdBy?: string;
  totalDuration?: number;
  playCount?: number;
  favoriteCount?: number;
  playlistType?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Media {
  id?: string;
  cloudflareId?: string;
  absolutePath?: string;
  fileName?: string;
  contentType?: string;
  description?: string;
  credit?: string;
}

export interface SongListDTO {
  id?: string;
  absolutePath?: string;
  title?: string;
  playCount?: number;
  duration?: number;
}

// 歌曲相关
export interface Song {
  id?: string;
  title?: string;
  audioUrl?: string;
  absolutePath?: string;
  duration?: number;
  playCount?: number;
  streamDate?: string;
  dateAdded?: string;
  coverArtists?: SongArtist[];
  originalArtists?: SongArtist[];
  genres?: SongTag[];
  moods?: SongTag[];
  themes?: SongTag[];
  metadata?: SongMetadata;
  similarSongs?: SongListItem[];
  coverArt?: CoverArt;
  videos?: Video[];
  lyricsDTOs?: Lyric[];
  setlist?: string;
  setlistId?: string;
  videoId?: string;
  hls?: string;
  hasLyrics?: boolean;
  userUploaded?: boolean;
  karaokeDate?: string;
}

export interface SongMetadata {
  tempoBpm?: number;
  genre?: string;
  key?: string;
  energyLevel?: number;
  language?: string;
  comments?: string;
  occasion?: string;
  description?: string;
  writers?: string;
  composers?: string;
  featuredArtists?: string;
  publishers?: string;
  updatedBy?: string;
  updatedDate?: string;
  foreignTitle?: string;
  englishTitle?: string;
}

export interface SongArtist {
  id?: string;
  name?: string;
}

export interface SongTag {
  id?: string;
  name?: string;
  songCount?: number;
}

export interface CoverArt {
  id?: string;
  fileName?: string;
  contentType?: string;
  description?: string;
  credit?: string;
  cloudflareId?: string;
  mediaStorageType?: number;
  absolutePath?: string;
  artist?: CoverArtArtist;
  upvotes?: number;
  tagString?: string;
}

export interface CoverArtArtist {
  id?: string;
  name?: string;
  socialLink?: string;
  userId?: string;
  arts?: string[];
}

export interface Video {
  id?: string;
  songId?: string;
  songTitle?: string;
  name?: string;
  description?: string;
  contentType?: string;
  absolutePath?: string;
  url?: string;
  videoType?: number;
  cloudflareId?: string;
  createdBy?: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  createdDate?: string;
}

export interface Lyric {
  time?: string;
  text?: string;
}

export interface SongPoll {
  id?: string;
  songId?: string;
  songTitle?: string;
  date?: string;
  totalVotes?: number;
  masterpiece?: number;
  amazing?: number;
  good?: number;
  bad?: number;
}

export interface SongSearchRequest {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  genreIds?: string[];
  themeIds?: string[];
  moodIds?: string[];
  artistIds?: string[];
  coverArtistIds?: string[];
  energyLevel?: number;
  tempo?: number;
  key?: string;
  karaokeStart?: string;
  karaokeEnd?: string;
}

export interface SongSearchResponse {
  items?: SongListItem[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

export interface SongListItem {
  id?: string;
  title?: string;
  absolutePath?: string;
  playCount?: number;
  duration?: number;
  streamDate?: string;
  dateAdded?: string;
  coverArtists?: string[];
  originalArtists?: string[];
  genres?: SongTag[];
  coverArt?: CoverArt;
  thumbnailArt?: CoverArt;
  order?: number;
  hasLyrics?: boolean;
  userUploaded?: boolean;
  videoId?: string;
  hls?: string;
}

// 艺术家相关
export interface Artist {
  id?: string;
  name?: string;
  imagePath?: string;
  songCount?: number;
  summary?: string;
}

// 电台相关
export interface RadioState {
  current?: RadioSong;
  upcoming?: RadioSong[];
  history?: RadioSong[];
  listenerCount?: number;
  offline?: boolean;
}

export interface RadioSong {
  id?: string;
  title?: string;
  originalArtists?: string[];
  coverArtists?: string[];
  duration?: number;
  coverArt?: RadioCoverArt;
}

export interface RadioCoverArt {
  cloudflareId?: string;
  credit?: string;
}

// 探索相关
export interface TrendingSong {
  id?: string;
  title?: string;
  originalArtists?: string[];
  coverArtists?: string[];
  absolutePath?: string;
  duration?: number;
  playCount?: number;
  streamDate?: string;
  dateAdded?: string;
  genres?: SongTag[];
  coverArt?: TrendingCoverArt;
}

export interface TrendingCoverArt {
  id?: string;
  cloudflareId?: string;
  absolutePath?: string;
  credit?: string;
  fileName?: string;
  contentType?: string;
  description?: string;
}

// 统计相关
export interface CoverDistribution {
  totalSongs?: number;
  neuroCount?: number;
  evilCount?: number;
  duetCount?: number;
  otherCount?: number;
}

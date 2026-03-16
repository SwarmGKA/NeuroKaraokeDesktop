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

export interface Media {
  cloudflare_id?: string;
  absolute_path?: string;
}

export interface SongListDTO {
  id?: string;
  absolute_path?: string;
  title?: string;
}

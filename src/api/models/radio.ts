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

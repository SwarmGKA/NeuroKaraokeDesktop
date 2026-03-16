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

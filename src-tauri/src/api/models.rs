use serde::{Deserialize, Serialize};

pub mod playlist {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Playlist {
        pub id: Option<String>,
        pub name: Option<String>,
        pub cover: Option<String>,
        pub song_count: Option<i32>,
        pub set_list_date: Option<String>,
        pub media: Option<Media>,
        pub mosaic_media: Option<Vec<Media>>,
        pub song_list_dtos: Option<Vec<SongListDTO>>,
        pub description: Option<String>,
        pub created_by: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct PlaylistSong {
        pub title: Option<String>,
        pub original_artists: Option<String>,
        pub cover_artists: Option<String>,
        pub cover_art: Option<String>,
        pub audio_url: Option<String>,
        pub art_credit: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Media {
        pub cloudflare_id: Option<String>,
        pub absolute_path: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SongListDTO {
        pub id: Option<String>,
        pub absolute_path: Option<String>,
        pub title: Option<String>,
    }
}

pub mod song {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Song {
        pub id: Option<String>,
        pub title: Option<String>,
        pub audio_url: Option<String>,
        pub absolute_path: Option<String>,
        pub duration: Option<i32>,
        pub play_count: Option<i32>,
        pub stream_date: Option<String>,
        pub date_added: Option<String>,
        pub cover_artists: Option<Vec<SongArtist>>,
        pub original_artists: Option<Vec<SongArtist>>,
        pub genres: Option<Vec<SongTag>>,
        pub moods: Option<Vec<SongTag>>,
        pub themes: Option<Vec<SongTag>>,
        pub metadata: Option<SongMetadata>,
        pub similar_songs: Option<Vec<SongListItem>>,
        pub cover_art: Option<CoverArt>,
        pub videos: Option<Vec<Video>>,
        pub lyrics_dtos: Option<Vec<Lyric>>,
        pub setlist: Option<String>,
        pub setlist_id: Option<String>,
        pub video_id: Option<String>,
        pub hls: Option<String>,
        pub has_lyrics: Option<bool>,
        pub user_uploaded: Option<bool>,
        pub karaoke_date: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SongMetadata {
        pub tempo_bpm: Option<i32>,
        pub genre: Option<String>,
        pub key: Option<String>,
        pub energy_level: Option<i32>,
        pub language: Option<String>,
        pub comments: Option<String>,
        pub occasion: Option<String>,
        pub description: Option<String>,
        pub writers: Option<String>,
        pub composers: Option<String>,
        pub featured_artists: Option<String>,
        pub publishers: Option<String>,
        pub updated_by: Option<String>,
        pub updated_date: Option<String>,
        pub foreign_title: Option<String>,
        pub english_title: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SongArtist {
        pub id: Option<String>,
        pub name: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SongTag {
        pub id: Option<String>,
        pub name: Option<String>,
        pub song_count: Option<i32>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct CoverArt {
        pub id: Option<String>,
        pub file_name: Option<String>,
        pub content_type: Option<String>,
        pub description: Option<String>,
        pub credit: Option<String>,
        pub cloudflare_id: Option<String>,
        pub media_storage_type: Option<i32>,
        pub absolute_path: Option<String>,
        pub artist: Option<CoverArtArtist>,
        pub upvotes: Option<i32>,
        pub tag_string: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct CoverArtArtist {
        pub id: Option<String>,
        pub name: Option<String>,
        pub social_link: Option<String>,
        pub user_id: Option<String>,
        pub arts: Option<Vec<String>>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Video {
        pub id: Option<String>,
        pub song_id: Option<String>,
        pub song_title: Option<String>,
        pub name: Option<String>,
        pub description: Option<String>,
        pub content_type: Option<String>,
        pub absolute_path: Option<String>,
        pub url: Option<String>,
        pub video_type: Option<i32>,
        pub cloudflare_id: Option<String>,
        pub created_by: Option<String>,
        pub thumbnail_url: Option<String>,
        pub duration: Option<i32>,
        pub width: Option<i32>,
        pub height: Option<i32>,
        pub created_date: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Lyric {
        pub time: Option<String>,
        pub text: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SongPoll {
        pub id: Option<String>,
        pub song_id: Option<String>,
        pub song_title: Option<String>,
        pub date: Option<String>,
        pub total_votes: Option<i32>,
        pub masterpiece: Option<i32>,
        pub amazing: Option<i32>,
        pub good: Option<i32>,
        pub bad: Option<i32>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SongSearchRequest {
        pub search: Option<String>,
        pub page: Option<i32>,
        pub page_size: Option<i32>,
        pub sort_by: Option<String>,
        pub sort_desc: Option<bool>,
        pub genre_ids: Option<Vec<String>>,
        pub theme_ids: Option<Vec<String>>,
        pub mood_ids: Option<Vec<String>>,
        pub artist_ids: Option<Vec<String>>,
        pub cover_artist_ids: Option<Vec<String>>,
        pub energy_level: Option<i32>,
        pub tempo: Option<i32>,
        pub key: Option<String>,
        pub karaoke_start: Option<String>,
        pub karaoke_end: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SongSearchResponse {
        pub items: Option<Vec<SongListItem>>,
        pub total_count: Option<i32>,
        pub page: Option<i32>,
        pub page_size: Option<i32>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SongListItem {
        pub id: Option<String>,
        pub title: Option<String>,
        pub absolute_path: Option<String>,
        pub play_count: Option<i32>,
        pub duration: Option<i32>,
        pub stream_date: Option<String>,
        pub date_added: Option<String>,
        pub cover_artists: Option<Vec<String>>,
        pub original_artists: Option<Vec<String>>,
        pub genres: Option<Vec<SongTag>>,
        pub cover_art: Option<CoverArt>,
        pub thumbnail_art: Option<CoverArt>,
        pub order: Option<i32>,
        pub has_lyrics: Option<bool>,
        pub user_uploaded: Option<bool>,
        pub video_id: Option<String>,
        pub hls: Option<String>,
    }
}

pub mod artist {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Artist {
        pub id: Option<String>,
        pub name: Option<String>,
        pub image_path: Option<String>,
        pub song_count: Option<i32>,
        pub summary: Option<String>,
    }
}

pub mod radio {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct RadioState {
        pub current: Option<RadioSong>,
        pub upcoming: Option<Vec<RadioSong>>,
        pub history: Option<Vec<RadioSong>>,
        pub listener_count: Option<i32>,
        pub offline: Option<bool>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct RadioSong {
        pub id: Option<String>,
        pub title: Option<String>,
        pub original_artists: Option<Vec<String>>,
        pub cover_artists: Option<Vec<String>>,
        pub duration: Option<i32>,
        pub cover_art: Option<RadioCoverArt>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct RadioCoverArt {
        pub cloudflare_id: Option<String>,
        pub credit: Option<String>,
    }
}

pub mod statistics {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct CoverDistribution {
        pub total_songs: Option<i32>,
        pub neuro_count: Option<i32>,
        pub evil_count: Option<i32>,
        pub duet_count: Option<i32>,
        pub other_count: Option<i32>,
    }
}

pub mod explore {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct TrendingSong {
        pub title: Option<String>,
        pub original_artists: Option<Vec<String>>,
        pub cover_artists: Option<Vec<String>>,
        pub absolute_path: Option<String>,
        pub duration: Option<i32>,
        pub cover_art: Option<TrendingCoverArt>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct TrendingCoverArt {
        pub cloudflare_id: Option<String>,
        pub absolute_path: Option<String>,
        pub credit: Option<String>,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub data: Option<T>,
    pub message: Option<String>,
    pub success: Option<bool>,
}

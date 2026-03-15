use crate::api::models::{
    ApiResponse, artist::Artist, explore::TrendingSong, playlist::Playlist,
    radio::RadioState, song::{Lyric, Song, SongPoll, SongSearchRequest, SongSearchResponse},
    statistics::CoverDistribution,
};
use reqwest::Client as HttpClient;
use std::time::Duration;
use thiserror::Error;

const API_BASE_URL: &str = "https://api.neurokaraoke.com";
const IDK_BASE_URL: &str = "https://idk.neurokaraoke.com";
const RADIO_SOCKET_URL: &str = "https://socket.neurokaraoke.com";
const RADIO_STREAM_URL: &str = "https://radio.twinskaraoke.com";

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("请求失败: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("JSON 解析错误: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("API 返回错误: {0}")]
    ApiError(String),
    #[error("未知错误")]
    UnknownError,
}

pub type Result<T> = std::result::Result<T, ApiError>;

pub struct ApiClient {
    client: HttpClient,
}

impl ApiClient {
    pub fn new() -> Self {
        let client = HttpClient::builder()
            .timeout(Duration::from_secs(30))
            .connect_timeout(Duration::from_secs(15))
            .user_agent("NeuroKaraokeDesktop/1.0")
            .build()
            .expect("创建 HTTP 客户端失败");

        ApiClient { client }
    }

    async fn get<T>(&self, url: &str) -> Result<T>
    where
        T: serde::de::DeserializeOwned,
    {
        log::info!("发送 GET 请求: {}", url);
        let response = self.client.get(url).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "无法读取错误信息".to_string());
            log::error!("API 请求失败: {} - {}", status, error_text);
            return Err(ApiError::ApiError(format!("HTTP {}: {}", status, error_text)));
        }

        let text = response.text().await?;
        let api_response: ApiResponse<T> = serde_json::from_str(&text)?;

        if let Some(data) = api_response.data {
            Ok(data)
        } else {
            let message = api_response.message.unwrap_or_else(|| "未知错误".to_string());
            log::error!("API 返回错误: {}", message);
            Err(ApiError::ApiError(message))
        }
    }

    async fn post<T>(&self, url: &str, body: &impl serde::Serialize) -> Result<T>
    where
        T: serde::de::DeserializeOwned,
    {
        log::info!("发送 POST 请求: {}", url);
        let response = self.client.post(url).json(body).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "无法读取错误信息".to_string());
            log::error!("API 请求失败: {} - {}", status, error_text);
            return Err(ApiError::ApiError(format!("HTTP {}: {}", status, error_text)));
        }

        let text = response.text().await?;
        let api_response: ApiResponse<T> = serde_json::from_str(&text)?;

        if let Some(data) = api_response.data {
            Ok(data)
        } else {
            let message = api_response.message.unwrap_or_else(|| "未知错误".to_string());
            log::error!("API 返回错误: {}", message);
            Err(ApiError::ApiError(message))
        }
    }

    pub async fn get_playlist(&self, id: &str) -> Result<Playlist> {
        let url = format!("{}/api/playlists/{}", API_BASE_URL, id);
        self.get(&url).await
    }

    pub async fn get_official_playlists(
        &self,
        start_index: i32,
        page_size: i32,
        year: i32,
    ) -> Result<Vec<Playlist>> {
        let url = format!(
            "{}/api/playlists/official?startIndex={}&pageSize={}&year={}",
            API_BASE_URL, start_index, page_size, year
        );
        self.get(&url).await
    }

    pub async fn get_public_playlists(&self) -> Result<Vec<Playlist>> {
        let url = format!("{}/api/playlists/public", API_BASE_URL);
        self.get(&url).await
    }

    pub async fn get_song_lyrics(&self, song_id: &str) -> Result<Vec<Lyric>> {
        let url = format!("{}/api/songs/{}/lyrics", API_BASE_URL, song_id);
        self.get(&url).await
    }

    pub async fn search_songs(&self, request: &SongSearchRequest) -> Result<SongSearchResponse> {
        let url = format!("{}/api/songs/search", API_BASE_URL);
        self.post(&url, request).await
    }

    pub async fn get_song_details(&self, song_id: &str) -> Result<Song> {
        let url = format!("{}/api/songs/{}", API_BASE_URL, song_id);
        self.get(&url).await
    }

    pub async fn get_song_poll(&self, song_id: &str) -> Result<Vec<SongPoll>> {
        let url = format!("{}/api/songs/{}/poll", API_BASE_URL, song_id);
        self.get(&url).await
    }

    pub async fn get_all_artists(&self) -> Result<Vec<Artist>> {
        let url = format!("{}/api/artists", API_BASE_URL);
        self.get(&url).await
    }

    pub async fn get_trending_songs(&self, days: i32) -> Result<Vec<TrendingSong>> {
        let url = format!("{}/api/explore/trending?days={}", API_BASE_URL, days);
        self.get(&url).await
    }

    pub async fn get_radio_current_state(&self) -> Result<RadioState> {
        let url = format!("{}/api/radio/state", RADIO_SOCKET_URL);
        self.get(&url).await
    }

    pub fn get_radio_stream_url(&self) -> &'static str {
        RADIO_STREAM_URL
    }

    pub async fn get_cover_distribution(&self) -> Result<CoverDistribution> {
        let url = format!("{}/api/statistics/cover-distribution", API_BASE_URL);
        self.get(&url).await
    }
}

impl Default for ApiClient {
    fn default() -> Self {
        Self::new()
    }
}

use tauri::Window;

mod api;
#[cfg(test)]
mod api_tests;

use api::{ApiClient, models::*};

#[tauri::command]
fn minimize_window(window: Window) -> Result<(), String> {
    window
        .minimize()
        .map_err(|e| format!("最小化窗口失败: {}", e))
}

#[tauri::command]
fn maximize_window(window: Window) -> Result<(), String> {
    let is_maximized = window
        .is_maximized()
        .map_err(|e| format!("获取窗口状态失败: {}", e))?;

    if is_maximized {
        window
            .unmaximize()
            .map_err(|e| format!("还原窗口失败: {}", e))
    } else {
        window
            .maximize()
            .map_err(|e| format!("最大化窗口失败: {}", e))
    }
}

#[tauri::command]
fn close_window(window: Window) -> Result<(), String> {
    window
        .close()
        .map_err(|e| format!("关闭窗口失败: {}", e))
}

#[tauri::command]
fn start_dragging(window: Window) -> Result<(), String> {
    window
        .start_dragging()
        .map_err(|e| format!("开始拖拽失败: {}", e))
}

#[tauri::command]
async fn get_playlist(id: String) -> Result<playlist::Playlist, String> {
    log::info!("获取播放列表: {}", id);
    let client = ApiClient::new();
    client
        .get_playlist(&id)
        .await
        .map_err(|e| format!("获取播放列表失败: {}", e))
}

#[tauri::command]
async fn get_official_playlists(
    start_index: i32,
    page_size: i32,
    year: i32,
) -> Result<Vec<playlist::Playlist>, String> {
    log::info!("获取官方播放列表: start_index={}, page_size={}, year={}", start_index, page_size, year);
    let client = ApiClient::new();
    client
        .get_official_playlists(start_index, page_size, year)
        .await
        .map_err(|e| format!("获取官方播放列表失败: {}", e))
}

#[tauri::command]
async fn get_public_playlists() -> Result<Vec<playlist::Playlist>, String> {
    log::info!("获取公开播放列表");
    let client = ApiClient::new();
    client
        .get_public_playlists()
        .await
        .map_err(|e| format!("获取公开播放列表失败: {}", e))
}

#[tauri::command]
async fn get_song_lyrics(song_id: String) -> Result<Vec<song::Lyric>, String> {
    log::info!("获取歌曲歌词: {}", song_id);
    let client = ApiClient::new();
    client
        .get_song_lyrics(&song_id)
        .await
        .map_err(|e| format!("获取歌曲歌词失败: {}", e))
}

#[tauri::command]
async fn search_songs(request: song::SongSearchRequest) -> Result<song::SongSearchResponse, String> {
    log::info!("搜索歌曲: {:?}", request.search);
    let client = ApiClient::new();
    client
        .search_songs(&request)
        .await
        .map_err(|e| format!("搜索歌曲失败: {}", e))
}

#[tauri::command]
async fn get_song_details(song_id: String) -> Result<song::Song, String> {
    log::info!("获取歌曲详情: {}", song_id);
    let client = ApiClient::new();
    client
        .get_song_details(&song_id)
        .await
        .map_err(|e| format!("获取歌曲详情失败: {}", e))
}

#[tauri::command]
async fn get_song_poll(song_id: String) -> Result<Vec<song::SongPoll>, String> {
    log::info!("获取歌曲投票: {}", song_id);
    let client = ApiClient::new();
    client
        .get_song_poll(&song_id)
        .await
        .map_err(|e| format!("获取歌曲投票失败: {}", e))
}

#[tauri::command]
async fn get_all_artists() -> Result<Vec<artist::Artist>, String> {
    log::info!("获取所有艺术家");
    let client = ApiClient::new();
    client
        .get_all_artists()
        .await
        .map_err(|e| format!("获取艺术家列表失败: {}", e))
}

#[tauri::command]
async fn get_trending_songs(days: i32) -> Result<Vec<explore::TrendingSong>, String> {
    log::info!("获取热门歌曲: days={}", days);
    let client = ApiClient::new();
    client
        .get_trending_songs(days)
        .await
        .map_err(|e| format!("获取热门歌曲失败: {}", e))
}

#[tauri::command]
async fn get_radio_current_state() -> Result<radio::RadioState, String> {
    log::info!("获取电台当前状态");
    let client = ApiClient::new();
    client
        .get_radio_current_state()
        .await
        .map_err(|e| format!("获取电台状态失败: {}", e))
}

#[tauri::command]
fn get_radio_stream_url() -> String {
    log::info!("获取电台流 URL");
    let client = ApiClient::new();
    client.get_radio_stream_url().to_string()
}

#[tauri::command]
async fn get_cover_distribution() -> Result<statistics::CoverDistribution, String> {
    log::info!("获取封面分布统计");
    let client = ApiClient::new();
    client
        .get_cover_distribution()
        .await
        .map_err(|e| format!("获取封面分布失败: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            minimize_window,
            maximize_window,
            close_window,
            start_dragging,
            get_playlist,
            get_official_playlists,
            get_public_playlists,
            get_song_lyrics,
            search_songs,
            get_song_details,
            get_song_poll,
            get_all_artists,
            get_trending_songs,
            get_radio_current_state,
            get_radio_stream_url,
            get_cover_distribution
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

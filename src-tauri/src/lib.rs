use tauri::Window;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            minimize_window,
            maximize_window,
            close_window,
            start_dragging
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

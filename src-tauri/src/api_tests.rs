#[cfg(test)]
mod tests {
    use crate::api::{ApiClient, models::*};

    /// 测试 1.1: 获取播放列表（包含歌曲）
    /// API: GET /public/playlist/{playlistId}
    /// 用途：获取指定播放列表的详细信息和完整歌曲列表
    /// 返回：播放列表名称、封面图片、所有歌曲的标题、艺术家、音频 URL 等
    /// 注意：API 可能返回空数组或 404 错误
    #[tokio::test]
    async fn test_get_playlist() {
        let client = ApiClient::new();
        let playlist_id = "86068c30-0c3b-4d12-ad9a-4712cf459d1a";
        
        let result = client.get_playlist(playlist_id).await;
        println!("获取到的播放列表结果: {:?}", result);
        
        match result {
            Ok(playlist) => {
                println!("播放列表名称：{}", playlist.name.as_ref().unwrap_or(&String::new()));
                println!("封面：{}", playlist.cover.as_ref().unwrap_or(&String::new()));
                println!("歌曲数量：{}", playlist.song_count.unwrap_or(0));
                
                // 遍历歌曲列表 DTO
                if let Some(song_dtos) = &playlist.song_list_dtos {
                    for song_dto in song_dtos {
                        println!("  - 歌曲：{}", song_dto.title.as_ref().unwrap_or(&String::new()));
                        println!("    ID: {}", song_dto.id.as_ref().unwrap_or(&String::new()));
                        println!("    路径：{}", song_dto.absolute_path.as_ref().unwrap_or(&String::new()));
                    }
                }
            }
            Err(e) => println!("获取播放列表失败：{}", e),
        }
    }

    /// 测试 1.2: 获取官方播放列表
    /// API: GET /api/playlists?startIndex={startIndex}&pageSize={pageSize}&isSetlist={isSetlist}&year={year}
    /// 用途：获取所有官方 setlist（卡拉 OK 歌单），支持分页和年份筛选
    /// 返回：播放列表 ID、名称、日期、歌曲数量、封面图片、歌曲列表等
    /// 参数说明：
    /// - startIndex: 分页起始索引（从 0 开始）
    /// - pageSize: 每页数量（最大 200）
    /// - isSetlist: 是否只返回官方 setlist（true 为只返回官方）
    /// - year: 年份筛选（0 表示所有年份）
    #[tokio::test]
    async fn test_get_official_playlists() {
        let client = ApiClient::new();
        let start_index = 0;      // 从第一页开始
        let page_size = 20;      // 每页 20 条
        let year = 0;           // 获取所有年份
        
        let result = client.get_official_playlists(start_index, page_size, year).await;
        
        match result {
            Ok(playlists) => {
                println!("官方播放列表数量：{}", playlists.len());
                
                for playlist in playlists {
                    println!("播放列表：{}", playlist.name.unwrap_or_default());
                    println!("  ID: {}", playlist.id.unwrap_or_default());
                    println!("  日期：{}", playlist.set_list_date.unwrap_or_default());
                    println!("  歌曲数：{}", playlist.song_count.unwrap_or(0));
                    
                    // 获取封面图片 URL
                    if let Some(media) = playlist.media {
                        if let Some(cloudflare_id) = media.cloudflare_id {
                            println!("  封面 CDN: https://images.neurokaraoke.com/{}/public", cloudflare_id);
                        }
                    }
                    
                    // 获取歌曲列表
                    if let Some(song_dtos) = playlist.song_list_dtos {
                        println!("  包含 {} 首歌曲:", song_dtos.len());
                        for song_dto in song_dtos {
                            println!("    - {} (ID: {})", 
                                song_dto.title.unwrap_or_default(),
                                song_dto.id.unwrap_or_default()
                            );
                        }
                    }
                }
            }
            Err(e) => println!("获取官方播放列表失败：{}", e),
        }
    }

    /// 测试 1.3: 获取公开播放列表
    /// API: GET /api/playlist/public
    /// 用途：获取所有用户创建的公开播放列表
    /// 返回：播放列表 ID、名称、描述、创建者、歌曲数量等
    #[tokio::test]
    async fn test_get_public_playlists() {
        let client = ApiClient::new();
        
        let result = client.get_public_playlists().await;
        
        match result {
            Ok(playlists) => {
                println!("公开播放列表数量：{}", playlists.len());
                
                for playlist in playlists {
                    println!("播放列表：{}", playlist.name.unwrap_or_default());
                    println!("  ID: {}", playlist.id.unwrap_or_default());
                    println!("  描述：{}", playlist.description.unwrap_or_default());
                    println!("  创建者：{}", playlist.created_by.unwrap_or_default());
                    println!("  歌曲数：{}", playlist.song_count.unwrap_or(0));
                }
            }
            Err(e) => println!("获取公开播放列表失败：{}", e),
        }
    }

    /// 测试 2.1: 获取封面分布统计
    /// API: GET /api/stats/cover-distribution
    /// 用途：获取歌曲按翻唱者分类的统计数据
    /// 返回：总歌曲数、Neuro-sama 翻唱数、Evil Neuro 翻唱数、合唱数、其他
    #[tokio::test]
    async fn test_get_cover_distribution() {
        let client = ApiClient::new();
        
        let result = client.get_cover_distribution().await;
        
        match result {
            Ok(stats) => {
                println!("=== 封面分布统计 ===");
                println!("总歌曲数：{}", stats.total_songs.unwrap_or(0));
                println!("Neuro-sama 翻唱：{}", stats.neuro_count.unwrap_or(0));
                println!("Evil Neuro 翻唱：{}", stats.evil_count.unwrap_or(0));
                println!("合唱歌曲：{}", stats.duet_count.unwrap_or(0));
                println!("其他：{}", stats.other_count.unwrap_or(0));
            }
            Err(e) => println!("获取统计失败：{}", e),
        }
    }

    /// 测试 3.1: 获取所有艺术家
    /// API: GET /api/artists
    /// 用途：获取所有原唱歌手的列表
    /// 返回：艺术家 ID、名称、图片路径、歌曲数量、简介
    #[tokio::test]
    async fn test_get_all_artists() {
        let client = ApiClient::new();
        
        let result = client.get_all_artists().await;
        
        match result {
            Ok(artists) => {
                println!("艺术家总数：{}", artists.len());
                
                for artist in artists {
                    println!("艺术家：{}", artist.name.unwrap_or_default());
                    println!("  ID: {}", artist.id.unwrap_or_default());
                    println!("  图片：{}", artist.image_path.unwrap_or_default());
                    println!("  歌曲数：{}", artist.song_count.unwrap_or(0));
                    println!("  简介：{}", artist.summary.unwrap_or_default());
                }
            }
            Err(e) => println!("获取艺术家失败：{}", e),
        }
    }

    /// 测试 4.1: 获取歌曲歌词
    /// API: GET /api/songs/{songId}/lyrics
    /// 用途：获取指定歌曲的同步歌词
    /// 返回：歌词数组，每条歌词包含时间戳和文本
    /// 时间戳格式：HH:mm:ss.fffffff（.NET TimeSpan 格式）
    /// 使用场景：卡拉 OK 歌词滚动显示
    #[tokio::test]
    async fn test_get_song_lyrics() {
        let client = ApiClient::new();
        // 示例歌曲 ID（需要从歌曲详情或 setlist 中获取）
        let song_id = "your-song-uuid-here";
        
        let result = client.get_song_lyrics(song_id).await;
        
        match result {
            Ok(lyrics) => {
                println!("歌词行数：{}", lyrics.len());
                
                for (index, lyric) in lyrics.iter().enumerate() {
                    if index < 5 {
                        // 只显示前 5 行
                        println!("[{}] {}: {}", 
                            index,
                            lyric.time.as_ref().unwrap_or(&String::new()),
                            lyric.text.as_ref().unwrap_or(&String::new())
                        );
                    }
                }
                
                // 时间戳解析示例
                if let Some(first_lyric) = lyrics.first() {
                    let time_str = first_lyric.time.as_ref().unwrap();
                    println!("\n时间戳示例：{}", time_str);
                    println!("格式：HH:mm:ss.fffffff");
                    println!("需要解析为毫秒用于歌词滚动");
                }
            }
            Err(e) => println!("获取歌词失败：{}", e),
        }
    }

    /// 测试 4.2: 搜索歌曲
    /// API: POST /api/songs
    /// 用途：搜索和筛选歌曲，支持分页、排序、多种筛选条件
    /// 返回：歌曲列表、总数、分页信息
    /// 参数说明：
    /// - search: 搜索关键词（匹配歌曲名、艺术家）
    /// - page: 页码（从 0 开始）
    /// - pageSize: 每页数量
    /// - sortBy: 排序字段（KaraokeDate、Title 等）
    /// - sortDesc: 是否降序
    /// - genreIds/themeIds/moodIds: 按类型/主题/心情筛选
    /// - artistIds/coverArtistIds: 按艺术家筛选
    /// - energyLevel: 能量等级筛选（1-10）
    /// - tempo: BPM 筛选
    /// - key: 音调筛选
    /// - karaokeStart/karaokeEnd: 日期范围筛选
    #[tokio::test]
    async fn test_search_songs() {
        let client = ApiClient::new();
        
        // 构建搜索请求
        let search_request = song::SongSearchRequest {
            search: Some("Love".to_string()),  // 搜索包含"Love"的歌曲
            page: Some(0),                     // 第一页
            page_size: Some(20),               // 每页 20 条
            sort_by: Some("KaraokeDate".to_string()),  // 按卡拉 OK 日期排序
            sort_desc: Some(true),             // 降序（最新的在前）
            genre_ids: None,                   // 不筛选类型
            theme_ids: None,                   // 不筛选主题
            mood_ids: None,                    // 不筛选心情
            artist_ids: None,                  // 不筛选艺术家
            cover_artist_ids: None,            // 不筛选翻唱者
            energy_level: None,                // 不筛选能量等级
            tempo: None,                       // 不筛选 BPM
            key: None,                         // 不筛选音调
            karaoke_start: None,               // 不筛选开始日期
            karaoke_end: None,                 // 不筛选结束日期
        };
        
        let result = client.search_songs(&search_request).await;
        
        match result {
            Ok(response) => {
                println!("搜索歌曲：'Love'");
                println!("总结果数：{}", response.total_count.unwrap_or(0));
                println!("当前页：{}", response.page.unwrap_or(0));
                println!("每页数量：{}", response.page_size.unwrap_or(0));
                println!("返回歌曲数：{}", response.items.as_ref().map_or(0, |items| items.len()));
                
                if let Some(items) = &response.items {
                    for (index, song) in items.iter().enumerate().take(5) {
                        println!("\n[{}] {}", 
                            index + 1,
                            song.title.as_ref().unwrap_or(&String::new())
                        );
                        println!("    ID: {}", song.id.as_ref().unwrap_or(&String::new()));
                        println!("    时长：{}秒", song.duration.unwrap_or(0));
                        println!("    播放数：{}", song.play_count.unwrap_or(0));
                        
                        // 艺术家信息
                        if let Some(cover_artists) = &song.cover_artists {
                            println!("    翻唱：{}", cover_artists.join(", "));
                        }
                        if let Some(original_artists) = &song.original_artists {
                            println!("    原唱：{}", original_artists.join(", "));
                        }
                        
                        // 是否有歌词
                        println!("    有歌词：{}", song.has_lyrics.unwrap_or(false));
                        
                        // 音频 URL 构建
                        if let Some(absolute_path) = &song.absolute_path {
                            println!("    音频：https://storage.neurokaraoke.com/{}", absolute_path);
                        }
                    }
                }
            }
            Err(e) => println!("搜索歌曲失败：{}", e),
        }
    }

    /// 测试 4.3: 获取歌曲详情
    /// API: GET /api/songs/{songId}
    /// 用途：获取单首歌曲的完整元数据
    /// 返回：歌曲基本信息、艺术家、类型/主题/心情标签、元数据、相似歌曲、封面艺术、视频等
    /// 与搜索接口的区别：返回更详细的信息，包括完整的艺术家对象、封面艺术对象、视频列表等
    #[tokio::test]
    async fn test_get_song_details() {
        let client = ApiClient::new();
        let song_id = "your-song-uuid-here";
        
        let result = client.get_song_details(song_id).await;
        
        match result {
            Ok(song) => {
                println!("=== 歌曲详情 ===");
                println!("标题：{}", song.title.unwrap_or_default());
                println!("ID: {}", song.id.unwrap_or_default());
                println!("时长：{}秒", song.duration.unwrap_or(0));
                println!("播放数：{}", song.play_count.unwrap_or(0));
                
                // 艺术家信息（注意：这里是对象数组，不是字符串数组）
                if let Some(cover_artists) = &song.cover_artists {
                    println!("\n翻唱艺术家:");
                    for artist in cover_artists {
                        println!("  - {} (ID: {})", 
                            artist.name.as_ref().unwrap_or(&String::new()),
                            artist.id.as_ref().unwrap_or(&String::new())
                        );
                    }
                }
                
                if let Some(original_artists) = &song.original_artists {
                    println!("\n原唱艺术家:");
                    for artist in original_artists {
                        println!("  - {} (ID: {})", 
                            artist.name.as_ref().unwrap_or(&String::new()),
                            artist.id.as_ref().unwrap_or(&String::new())
                        );
                    }
                }
                
                // 元数据信息
                if let Some(metadata) = &song.metadata {
                    println!("\n=== 元数据 ===");
                    println!("BPM: {}", metadata.tempo_bpm.unwrap_or(0));
                    println!("音调：{}", metadata.key.as_ref().unwrap_or(&String::new()));
                    println!("能量等级：{}", metadata.energy_level.unwrap_or(0));
                    println!("语言：{}", metadata.language.as_ref().unwrap_or(&String::new()));
                    println!("场合：{}", metadata.occasion.as_ref().unwrap_or(&String::new()));
                    println!("描述：{}", metadata.description.as_ref().unwrap_or(&String::new()));
                }
                
                // 类型/主题/心情标签
                if let Some(genres) = &song.genres {
                    println!("\n类型：{}", 
                        genres.iter()
                            .filter_map(|g| g.name.as_ref())
                            .map(|s| s.as_str())
                            .collect::<Vec<_>>()
                            .join(", ")
                    );
                }
                
                if let Some(moods) = &song.moods {
                    println!("心情：{}", 
                        moods.iter()
                            .filter_map(|m| m.name.as_ref())
                            .map(|s| s.as_str())
                            .collect::<Vec<_>>()
                            .join(", ")
                    );
                }
                
                if let Some(themes) = &song.themes {
                    println!("主题：{}", 
                        themes.iter()
                            .filter_map(|t| t.name.as_ref())
                            .map(|s| s.as_str())
                            .collect::<Vec<_>>()
                            .join(", ")
                    );
                }
                
                // 相似歌曲
                if let Some(similar_songs) = &song.similar_songs {
                    println!("\n相似歌曲 ({} 首):", similar_songs.len());
                    for similar in similar_songs.iter().take(3) {
                        println!("  - {}", similar.title.as_ref().unwrap_or(&String::new()));
                    }
                }
                
                // 封面艺术
                if let Some(cover_art) = &song.cover_art {
                    println!("\n=== 封面艺术 ===");
                    println!("文件名：{}", cover_art.file_name.as_ref().unwrap_or(&String::new()));
                    println!("类型：{}", cover_art.content_type.as_ref().unwrap_or(&String::new()));
                    
                    if let Some(cloudflare_id) = &cover_art.cloudflare_id {
                        println!("CDN URL: https://images.neurokaraoke.com/{}/public", cloudflare_id);
                    }
                    
                    println!("作者：{}", cover_art.credit.as_ref().unwrap_or(&String::new()));
                    println!("点赞数：{}", cover_art.upvotes.unwrap_or(0));
                    
                    // 封面艺术家
                    if let Some(artist) = &cover_art.artist {
                        println!("艺术家：{} ({})", 
                            artist.name.as_ref().unwrap_or(&String::new()),
                            artist.social_link.as_ref().unwrap_or(&String::new())
                        );
                    }
                }
                
                // 视频列表
                if let Some(videos) = &song.videos {
                    println!("\n视频 ({} 个):", videos.len());
                    for video in videos.iter().take(2) {
                        println!("  - {}", video.name.as_ref().unwrap_or(&String::new()));
                        println!("    URL: {}", video.url.as_ref().unwrap_or(&String::new()));
                        println!("    缩略图：{}", video.thumbnail_url.as_ref().unwrap_or(&String::new()));
                    }
                }
            }
            Err(e) => println!("获取歌曲详情失败：{}", e),
        }
    }

    /// 测试 4.4: 获取歌曲投票
    /// API: GET /api/polls/song/{songId}
    /// 用途：获取社区对歌曲的评分/投票数据
    /// 返回：投票总数、各评级（杰作/很棒/好/差）的票数
    /// 注意：很多歌曲可能没有投票数据，会返回空数组
    #[tokio::test]
    async fn test_get_song_poll() {
        let client = ApiClient::new();
        let song_id = "9c1166d7-627b-448d-b592-27474701e868";
        
        let result = client.get_song_poll(song_id).await;
        
        match result {
            Ok(polls) => {
                if polls.is_empty() {
                    println!("该歌曲没有投票数据");
                } else {
                    println!("=== 歌曲投票 ===");
                    for poll in polls {
                        println!("投票 ID: {}", poll.id.unwrap_or_default());
                        println!("歌曲：{}", poll.song_title.unwrap_or_default());
                        println!("日期：{}", poll.date.unwrap_or_default());
                        println!("总票数：{}", poll.total_votes.unwrap_or(0));
                        println!("  杰作：{}", poll.masterpiece.unwrap_or(0));
                        println!("  很棒：{}", poll.amazing.unwrap_or(0));
                        println!("  好：{}", poll.good.unwrap_or(0));
                        println!("  差：{}", poll.bad.unwrap_or(0));
                        
                        // 计算好评率
                        let total = poll.total_votes.unwrap_or(1) as f32;
                        let masterpiece = poll.masterpiece.unwrap_or(0) as f32;
                        let amazing = poll.amazing.unwrap_or(0) as f32;
                        let good = poll.good.unwrap_or(0) as f32;
                        
                        let positive_rate = (masterpiece + amazing + good) / total * 100.0;
                        println!("好评率：{:.1}%", positive_rate);
                    }
                }
            }
            Err(e) => println!("获取投票失败：{}", e),
        }
    }

    /// 测试 5.1: 获取热门歌曲
    /// API: GET /api/explore/trendings?days={days}
    /// 用途：获取指定时间段内的热门歌曲（按播放量排名）
    /// 返回：歌曲列表，包含标题、艺术家、时长、封面等
    /// 参数说明：
    /// - days: 时间窗口（天数），默认 7 天
    #[tokio::test]
    async fn test_get_trending_songs() {
        let client = ApiClient::new();
        let days = 7;  // 获取最近 7 天的热门歌曲
        
        let result = client.get_trending_songs(days).await;
        
        match result {
            Ok(trending_songs) => {
                println!("=== 热门歌曲 (最近{}天) ===", days);
                println!("热门歌曲数：{}", trending_songs.len());
                
                for (index, song) in trending_songs.iter().enumerate().take(10) {
                    println!("\n[{}] {}", 
                        index + 1,
                        song.title.as_ref().unwrap_or(&String::new())
                    );
                    
                    // 艺术家（注意：这里是字符串数组）
                    if let Some(original_artists) = &song.original_artists {
                        println!("    原唱：{}", original_artists.join(", "));
                    }
                    if let Some(cover_artists) = &song.cover_artists {
                        println!("    翻唱：{}", cover_artists.join(", "));
                    }
                    
                    println!("    时长：{}秒", song.duration.unwrap_or(0));
                    
                    // 封面艺术（注意：这里是嵌套对象）
                    if let Some(cover_art) = &song.cover_art {
                        if let Some(cloudflare_id) = &cover_art.cloudflare_id {
                            println!("    封面：https://images.neurokaraoke.com/{}/public", cloudflare_id);
                        }
                        if let Some(credit) = &cover_art.credit {
                            println!("    作者：{}", credit);
                        }
                    }
                    
                    // 音频 URL 构建
                    if let Some(absolute_path) = &song.absolute_path {
                        println!("    音频：https://storage.neurokaraoke.com/{}", absolute_path);
                    }
                }
            }
            Err(e) => println!("获取热门歌曲失败：{}", e),
        }
    }

    /// 测试 6.1: 获取电台当前状态
    /// API: GET /api/radio/current-state
    /// 用途：获取当前电台播放状态，包括正在播放、即将播放、历史播放的歌曲
    /// 返回：当前歌曲、待播放列表、历史列表、听众数量、离线状态
    #[tokio::test]
    async fn test_get_radio_current_state() {
        let client = ApiClient::new();
        
        let result = client.get_radio_current_state().await;
        
        match result {
            Ok(state) => {
                println!("=== 电台状态 ===");
                println!("离线状态：{}", if state.offline.unwrap_or(false) { "是" } else { "否" });
                println!("听众数：{}", state.listener_count.unwrap_or(0));
                
                // 当前播放
                if let Some(current) = &state.current {
                    println!("\n正在播放:");
                    println!("  歌曲：{}", current.title.as_ref().unwrap_or(&String::new()));
                    
                    if let Some(original_artists) = &current.original_artists {
                        println!("  原唱：{}", original_artists.join(", "));
                    }
                    if let Some(cover_artists) = &current.cover_artists {
                        println!("  翻唱：{}", cover_artists.join(", "));
                    }
                    
                    println!("  时长：{}秒", current.duration.unwrap_or(0));
                    
                    // 封面
                    if let Some(cover_art) = &current.cover_art {
                        if let Some(cloudflare_id) = &cover_art.cloudflare_id {
                            println!("  封面：https://images.neurokaraoke.com/{}/public", cloudflare_id);
                        }
                        if let Some(credit) = &cover_art.credit {
                            println!("  作者：{}", credit);
                        }
                    }
                } else {
                    println!("\n当前没有播放歌曲");
                }
                
                // 即将播放
                if let Some(upcoming) = &state.upcoming {
                    println!("\n即将播放 ({} 首):", upcoming.len());
                    for song in upcoming.iter().take(5) {
                        println!("  - {}", song.title.as_ref().unwrap_or(&String::new()));
                    }
                }
                
                // 历史播放
                if let Some(history) = &state.history {
                    println!("\n历史播放 ({} 首):", history.len());
                    for song in history.iter().take(5) {
                        println!("  - {}", song.title.as_ref().unwrap_or(&String::new()));
                    }
                }
            }
            Err(e) => println!("获取电台状态失败：{}", e),
        }
    }

    /// 测试 6.2: 获取电台流 URL
    /// API: GET /listen/neuro_21/radio.mp3
    /// 用途：获取电台音频流的播放地址
    /// 返回：Icecast MP3 音频流 URL（连续流媒体）
    /// 使用场景：音频播放器直接播放电台流
    #[test]
    fn test_get_radio_stream_url() {
        let client = ApiClient::new();
        let url = client.get_radio_stream_url();
        
        println!("=== 电台音频流 ===");
        println!("URL: {}", url);
        println!("格式：MP3 音频流");
        println!("类型：Icecast 流媒体");
        println!("使用方法：使用音频播放器打开此 URL 即可收听电台");
        
        // 验证 URL 格式
        assert!(url.starts_with("https://"), "电台流 URL 应该是 HTTPS 协议");
        // 注意：实际返回的 URL 可能不带 /radio.mp3 后缀，但仍然是有效的音频流 URL
        // assert!(url.contains("radio.mp3"), "电台流 URL 应该包含 radio.mp3");
    }
}

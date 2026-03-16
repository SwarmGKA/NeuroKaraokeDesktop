import { useEffect, useRef, useState } from 'react'
import { Flex, Slider, Button, Tooltip } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundOutlined,
  MutedOutlined,
  DownOutlined,
  RetweetOutlined,
  SwapOutlined,
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  MoreOutlined,
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer, PlayMode } from '../../stores/playerStore'
import { useI18n } from '../../i18n'
import { getImageUrl } from '../../stores/homeDataStore'
import { extractDominantColor, generateGradient } from '../../utils/colorExtract'
import type { Song } from '../../types/api'
import './FullScreenPlayer.css'

// 格式化时间
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 获取艺人名称
function getArtists(song: Song | null): string {
  if (!song) return ''
  const coverArtists = song.coverArtists?.map(a => a.name).filter(Boolean)
  const originalArtists = song.originalArtists?.map(a => a.name).filter(Boolean)

  if (coverArtists?.length) return coverArtists.join(', ')
  if (originalArtists?.length) return originalArtists.join(', ')
  return ''
}

// 播放模式图标
const playModeIcons: Record<PlayMode, React.ReactNode> = {
  sequence: <RetweetOutlined />,
  loop: <RetweetOutlined />,
  single: <SwapOutlined rotate={90} />,
  shuffle: <SearchOutlined />,
}

const playModeNextMode: Record<PlayMode, PlayMode> = {
  sequence: 'loop',
  loop: 'single',
  single: 'shuffle',
  shuffle: 'sequence',
}

interface FullScreenPlayerProps {
  accentColor: string
}

export function FullScreenPlayer({ accentColor }: FullScreenPlayerProps) {
  const {
    state,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    next,
    prev,
    setPlayMode,
    setExpanded,
    toggleLyrics,
    loadLyrics,
  } = usePlayer()
  const { t } = useI18n()
  const [coverColor, setCoverColor] = useState('#667eea')
  const [isFavorite, setIsFavorite] = useState(false)
  const coverRef = useRef<HTMLDivElement>(null)

  // 提取封面颜色
  useEffect(() => {
    if (state.currentSong?.coverArt?.cloudflareId) {
      const coverUrl = getImageUrl(state.currentSong.coverArt.cloudflareId)
      if (coverUrl) {
        extractDominantColor(coverUrl).then((color) => {
          setCoverColor(color)
        })
      }
    }
  }, [state.currentSong?.coverArt?.cloudflareId])

  // 加载歌词
  useEffect(() => {
    if (state.currentSong?.id) {
      loadLyrics(state.currentSong.id)
    }
  }, [state.currentSong?.id, loadLyrics])

  // 背景渐变
  const backgroundGradient = generateGradient(coverColor)

  // 封面 URL
  const coverUrl = state.currentSong?.coverArt?.cloudflareId
    ? getImageUrl(state.currentSong.coverArt.cloudflareId)
    : undefined

  // 播放模式切换
  const handlePlayModeChange = () => {
    setPlayMode(playModeNextMode[state.playMode])
  }

  // 关闭全屏
  const handleClose = () => {
    setExpanded(false)
  }

  // 点击封面切换歌词
  const handleCoverClick = () => {
    toggleLyrics()
  }

  // 如果没有展开，不显示
  if (!state.isExpanded || !state.currentSong) {
    return null
  }

  return (
    <motion.div
      className="fullscreen-player"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: backgroundGradient,
      }}
    >
      {/* 背景模糊层 */}
      <div
        className="background-blur"
        style={{
          backgroundImage: `url(${coverUrl})`,
        }}
      />

      {/* 遮罩层 */}
      <div className="overlay" />

      {/* 内容区域 */}
      <div className="content">
        {/* 顶部工具栏 */}
        <Flex justify="space-between" align="center" className="top-bar">
          <Button
            type="text"
            icon={<DownOutlined style={{ color: '#fff' }} />}
            onClick={handleClose}
            className="close-btn"
          />
          <Flex vertical align="center">
            <div className="playing-from">{t('player.playingFrom')}</div>
            <div className="playlist-name">{t('player.currentPlaylist')}</div>
          </Flex>
          <Button
            type="text"
            icon={<MoreOutlined style={{ color: '#fff' }} />}
            className="more-btn"
          />
        </Flex>

        {/* 主内容区 */}
        <Flex
          vertical
          align="center"
          justify="center"
          flex={1}
          className="main-content"
        >
          <AnimatePresence mode="wait">
            {state.showLyrics ? (
              // 歌词视图
              <motion.div
                key="lyrics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lyrics-container"
                onClick={toggleLyrics}
              >
                <LyricsView
                  lyrics={state.lyrics}
                  currentIndex={state.currentLyricIndex}
                />
              </motion.div>
            ) : (
              // 封面视图
              <motion.div
                key="cover"
                ref={coverRef}
                className="cover-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                onClick={handleCoverClick}
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={state.currentSong.title || 'Cover'}
                    className="cover-image"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="cover-placeholder"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)` }}
                  >
                    <span style={{ color: '#fff', fontSize: 80 }}>♪</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 点击查看歌词提示 */}
          {!state.showLyrics && state.lyrics.length > 0 && (
            <motion.div
              className="lyrics-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {t('player.tapForLyrics')}
            </motion.div>
          )}
        </Flex>

        {/* 歌曲信息 */}
        <Flex vertical align="center" gap={8} className="song-info">
          <div className="song-title">{state.currentSong.title || t('song.defaultTitle')}</div>
          <div className="song-artist">{getArtists(state.currentSong)}</div>
        </Flex>

        {/* 进度条 */}
        <div className="progress-section">
          <Slider
            value={state.currentTime}
            max={state.duration || 100}
            onChange={seek}
            tooltip={{ formatter: (v) => formatTime(v || 0) }}
            className="progress-slider"
          />
          <Flex justify="space-between" className="time-labels">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </Flex>
        </div>

        {/* 播放控制 */}
        <Flex align="center" justify="center" gap={24} className="controls">
          {/* 播放模式 */}
          <Tooltip title={t(`player.playMode.${state.playMode}`)} placement="top">
            <Button
              type="text"
              icon={playModeIcons[state.playMode]}
              onClick={handlePlayModeChange}
              className="control-btn"
              style={{ color: state.playMode !== 'sequence' ? accentColor : 'rgba(255,255,255,0.7)' }}
            />
          </Tooltip>

          {/* 上一首 */}
          <Button
            type="text"
            icon={<StepBackwardOutlined />}
            onClick={prev}
            className="control-btn large"
          />

          {/* 播放/暂停 */}
          <motion.button
            className="play-btn"
            onClick={togglePlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ backgroundColor: accentColor }}
          >
            {state.isPlaying ? (
              <PauseCircleOutlined style={{ fontSize: 40, color: '#fff' }} />
            ) : (
              <PlayCircleOutlined style={{ fontSize: 40, color: '#fff' }} />
            )}
          </motion.button>

          {/* 下一首 */}
          <Button
            type="text"
            icon={<StepForwardOutlined />}
            onClick={next}
            className="control-btn large"
          />

          {/* 收藏 */}
          <Button
            type="text"
            icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            onClick={() => setIsFavorite(!isFavorite)}
            className="control-btn"
          />
        </Flex>

        {/* 底部工具栏 */}
        <Flex justify="center" align="center" gap={32} className="bottom-bar">
          {/* 音量 */}
          <Flex align="center" gap={8} className="volume-section">
            <Button
              type="text"
              icon={state.isMuted || state.volume === 0 ? <MutedOutlined /> : <SoundOutlined />}
              onClick={toggleMute}
              className="control-btn small"
            />
            <Slider
              value={state.volume * 100}
              onChange={(v) => setVolume(v / 100)}
              style={{ width: 100 }}
              tooltip={{ formatter: (v) => `${v}%` }}
            />
          </Flex>
        </Flex>
      </div>
    </motion.div>
  )
}

// 歌词视图组件
interface LyricsViewProps {
  lyrics: { time?: string; text?: string }[]
  currentIndex: number
}

function LyricsView({ lyrics, currentIndex }: LyricsViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 自动滚动到当前歌词
  useEffect(() => {
    if (containerRef.current && currentIndex >= 0) {
      const activeElement = containerRef.current.querySelector('.lyric-line.active')
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [currentIndex])

  if (lyrics.length === 0) {
    return (
      <div className="no-lyrics">
        <span>♪</span>
        <p>No lyrics available</p>
      </div>
    )
  }

  return (
    <div className="lyrics-view" ref={containerRef}>
      {lyrics.map((lyric, index) => (
        <motion.div
          key={index}
          className={`lyric-line ${index === currentIndex ? 'active' : ''}`}
          initial={{ opacity: 0.4 }}
          animate={{
            opacity: index === currentIndex ? 1 : 0.4,
            scale: index === currentIndex ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{
            color: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)',
          }}
        >
          {lyric.text}
        </motion.div>
      ))}
    </div>
  )
}

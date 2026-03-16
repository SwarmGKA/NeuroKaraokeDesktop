import { useEffect, useRef, useState } from 'react'
import { Flex, Slider, Button, Tooltip } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundOutlined,
  MutedOutlined,
  UpOutlined,
  RetweetOutlined,
  SwapOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { usePlayer, PlayMode } from '../../stores/playerStore'
import { useI18n } from '../../i18n'
import { getImageUrl } from '../../stores/homeDataStore'
import type { Song } from '../../types/api'
import './MiniPlayer.css'

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

interface MiniPlayerProps {
  baseTheme: 'light' | 'dark'
  accentColor: string
}

export function MiniPlayer({ baseTheme, accentColor }: MiniPlayerProps) {
  const { state, togglePlay, seek, setVolume, toggleMute, next, prev, setPlayMode, toggleExpand, loadLyrics } = usePlayer()
  const { t } = useI18n()
  const isDark = baseTheme === 'dark'
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 加载歌词
  useEffect(() => {
    if (state.currentSong?.id && state.isExpanded) {
      loadLyrics(state.currentSong.id)
    }
  }, [state.currentSong?.id, state.isExpanded, loadLyrics])

  // 点击进度条跳转
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !state.duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seek(percent * state.duration)
  }

  // 拖动进度条
  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressRef.current || !state.duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seek(percent * state.duration)
  }

  // 播放模式切换
  const handlePlayModeChange = () => {
    setPlayMode(playModeNextMode[state.playMode])
  }

  // 进度百分比
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0

  // 封面 URL
  const coverUrl = state.currentSong?.coverArt?.cloudflareId
    ? getImageUrl(state.currentSong.coverArt.cloudflareId)
    : undefined

  // 如果没有歌曲，不显示播放器
  if (!state.currentSong) {
    return null
  }

  return (
    <motion.div
      className="mini-player"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      exit={{ y: 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(250, 250, 250, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      }}
    >
      {/* 进度条 */}
      <div
        ref={progressRef}
        className="progress-bar"
        onClick={handleProgressClick}
        onMouseDown={() => setIsDragging(true)}
        onMouseMove={handleProgressDrag}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          className="progress-fill"
          style={{ width: `${progress}%`, backgroundColor: accentColor }}
        />
      </div>

      <Flex align="center" gap={12} style={{ padding: '8px 16px', height: '100%' }}>
        {/* 封面 */}
        <motion.div
          className="cover-container"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleExpand}
          style={{ cursor: 'pointer' }}
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
              <span style={{ color: '#fff', fontSize: 20 }}>♪</span>
            </div>
          )}
        </motion.div>

        {/* 歌曲信息 */}
        <Flex vertical flex={1} style={{ minWidth: 0, overflow: 'hidden' }}>
          <div
            className="song-title"
            style={{ color: isDark ? '#fff' : '#1a1a1a' }}
            title={state.currentSong.title}
          >
            {state.currentSong.title || t('song.defaultTitle')}
          </div>
          <div
            className="song-artist"
            style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }}
          >
            {getArtists(state.currentSong)}
          </div>
        </Flex>

        {/* 播放控制 */}
        <Flex align="center" gap={4}>
          {/* 上一首 */}
          <Button
            type="text"
            icon={<StepBackwardOutlined />}
            size="large"
            onClick={prev}
            className="control-btn"
            style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}
          />

          {/* 播放/暂停 */}
          <motion.button
            className="play-btn"
            onClick={togglePlay}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ backgroundColor: accentColor }}
          >
            {state.isPlaying ? (
              <PauseCircleOutlined style={{ fontSize: 28, color: '#fff' }} />
            ) : (
              <PlayCircleOutlined style={{ fontSize: 28, color: '#fff' }} />
            )}
          </motion.button>

          {/* 下一首 */}
          <Button
            type="text"
            icon={<StepForwardOutlined />}
            size="large"
            onClick={next}
            className="control-btn"
            style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}
          />
        </Flex>

        {/* 时间显示 */}
        <div className="time-display" style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }}>
          {formatTime(state.currentTime)} / {formatTime(state.duration)}
        </div>

        {/* 播放模式 */}
        <Tooltip title={t(`player.playMode.${state.playMode}`)}>
          <Button
            type="text"
            icon={playModeIcons[state.playMode]}
            onClick={handlePlayModeChange}
            className="control-btn"
            style={{
              color: state.playMode !== 'sequence'
                ? accentColor
                : isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
            }}
          />
        </Tooltip>

        {/* 音量控制 */}
        <Flex align="center" gap={4} className="volume-control">
          <Button
            type="text"
            icon={state.isMuted || state.volume === 0 ? <MutedOutlined /> : <SoundOutlined />}
            onClick={toggleMute}
            className="control-btn"
            style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }}
          />
          <Slider
            value={state.volume * 100}
            onChange={(v) => setVolume(v / 100)}
            style={{ width: 80 }}
            tooltip={{ formatter: (v) => `${v}%` }}
          />
        </Flex>

        {/* 展开按钮 */}
        <Button
          type="text"
          icon={<UpOutlined />}
          onClick={toggleExpand}
          className="control-btn expand-btn"
          style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }}
        />
      </Flex>
    </motion.div>
  )
}

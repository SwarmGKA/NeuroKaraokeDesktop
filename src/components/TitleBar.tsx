import { Flex, Button, Typography } from 'antd'
import { MinusOutlined, BorderOutlined, CloseOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'

const { Text } = Typography

interface TitleBarProps {
  baseTheme: 'light' | 'dark'
}

// 自定义最小化图标
function MinimizeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="9" width="10" height="2" fill="currentColor" />
    </svg>
  )
}

export function TitleBar({ baseTheme }: TitleBarProps) {
  const { t } = useI18n()

  const isDark = baseTheme === 'dark'
  const bgColor = isDark ? '#252525' : '#f5f5f5'
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'

  const handleMinimize = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      window.electronAPI.minimizeWindow()
    } catch (error) {
      console.error('最小化窗口失败:', error)
    }
  }

  const handleMaximize = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      window.electronAPI.maximizeWindow()
    } catch (error) {
      console.error('最大化窗口失败:', error)
    }
  }

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      window.electronAPI.closeWindow()
    } catch (error) {
      console.error('关闭窗口失败:', error)
    }
  }

  const handleMouseDown = async () => {
    try {
      window.electronAPI.startDragging()
    } catch (error) {
      console.error('拖拽窗口失败:', error)
    }
  }

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const buttonStyle = {
    width: 40,
    height: 32,
    border: 'none',
    borderRadius: 0,
    color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        width: '100%',
        height: 32,
        paddingLeft: 16,
        backgroundColor: bgColor,
        borderBottom: `1px solid ${borderColor}`,
        cursor: 'default',
        userSelect: 'none',
        WebkitAppRegion: 'drag' as const,
      }}
      onMouseDown={handleMouseDown}
    >
      <Text style={{ fontSize: 13, fontWeight: 500, color: textColor }}>
        {t('app.title')}
      </Text>

      <Flex style={{ WebkitAppRegion: 'no-drag' as const }}>
        <Button
          type="text"
          style={buttonStyle}
          icon={<MinusOutlined />}
          onClick={handleMinimize}
          onMouseDown={handleButtonMouseDown}
          className="title-bar-button"
        />
        <Button
          type="text"
          style={buttonStyle}
          icon={<BorderOutlined />}
          onClick={handleMaximize}
          onMouseDown={handleButtonMouseDown}
          className="title-bar-button"
        />
        <Button
          type="text"
          style={{
            ...buttonStyle,
            color: '#f90e6a',
          }}
          icon={<CloseOutlined />}
          onClick={handleClose}
          onMouseDown={handleButtonMouseDown}
          className="title-bar-button close-button"
        />
      </Flex>

      <style>{`
        .title-bar-button:hover {
          background-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
        }
        .title-bar-button.close-button:hover {
          background-color: #f90e6a !important;
          color: white !important;
        }
      `}</style>
    </Flex>
  )
}

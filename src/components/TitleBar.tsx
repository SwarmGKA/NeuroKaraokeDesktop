import { Flex, Button, Typography } from 'antd'
import { MinusOutlined, BorderOutlined, CloseOutlined, SoundOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'

const { Text } = Typography

interface TitleBarProps {
  baseTheme: 'light' | 'dark'
  accentColor: string
}

export function TitleBar({ baseTheme, accentColor }: TitleBarProps) {
  const { t } = useI18n()

  const isDark = baseTheme === 'dark'
  const bgColor = isDark ? '#252525' : '#f5f5f5'
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'

  const handleMinimize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      window.electronAPI.minimizeWindow()
    } catch (error) {
      console.error('最小化窗口失败:', error)
    }
  }

  const handleMaximize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      window.electronAPI.maximizeWindow()
    } catch (error) {
      console.error('最大化窗口失败:', error)
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      window.electronAPI.closeWindow()
    } catch (error) {
      console.error('关闭窗口失败:', error)
    }
  }

  const handleMouseDown = () => {
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

  const buttonStyle: React.CSSProperties = {
    width: 46,
    height: 40,
    border: 'none',
    borderRadius: 0,
    color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
  }

  return (
    <>
      <style>{`
        .title-bar-root {
          -webkit-app-region: drag;
        }
        .title-bar-buttons {
          -webkit-app-region: no-drag;
        }
        .title-bar-button:hover {
          background-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
        }
      `}</style>
      <Flex
        align="center"
        justify="space-between"
        className="title-bar-root"
        style={{
          width: '100%',
          height: 40,
          paddingLeft: 12,
          backgroundColor: bgColor,
          borderBottom: `1px solid ${borderColor}`,
          cursor: 'default',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        <Flex align="center" gap={8}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              backgroundColor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SoundOutlined style={{ color: '#000', fontSize: 14 }} />
          </div>
          <Text style={{ fontSize: 13, fontWeight: 500, color: textColor }}>
            {t('app.title')}
          </Text>
        </Flex>

        <Flex className="title-bar-buttons">
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
            style={buttonStyle}
            icon={<CloseOutlined />}
            onClick={handleClose}
            onMouseDown={handleButtonMouseDown}
            className="title-bar-button"
          />
        </Flex>
      </Flex>
    </>
  )
}

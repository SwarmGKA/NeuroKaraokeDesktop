import { Button, Space } from 'antd'
import { FiMinus, FiSquare, FiX } from 'react-icons/fi'
import { minimizeWindow, maximizeWindow, closeWindow, startDragging } from '../utils/windowControl'
import { useI18n } from '../i18n'
import { BaseTheme } from '../theme'

interface TitleBarProps {
  baseTheme: BaseTheme
}

export function TitleBar({ baseTheme }: TitleBarProps) {
  const { t } = useI18n()

  const buttonStyle = {
    width: 46,
    height: 32,
    border: 'none',
    borderRadius: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const closeButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 32,
        paddingLeft: 12,
        backgroundColor: baseTheme === 'dark' ? '#141414' : '#ffffff',
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
        }}
      >
        {t('app.title')}
      </div>

      <Space size={0} style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <Button
          style={buttonStyle}
          onClick={minimizeWindow}
          icon={<FiMinus size={16} />}
          type="text"
        />
        <Button
          style={buttonStyle}
          onClick={maximizeWindow}
          icon={<FiSquare size={14} />}
          type="text"
        />
        <Button
          style={closeButtonStyle}
          onClick={closeWindow}
          icon={<FiX size={18} />}
          type="text"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ff4d4f'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = baseTheme === 'dark' ? '#ffffffd9' : '#000000d9'
          }}
        />
      </Space>
    </div>
  )
}

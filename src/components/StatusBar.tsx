import { useTheme } from '../contexts/ThemeContext'
import { useSettings } from '../contexts/SettingsContext'

interface StatusBarProps {
  isTerminalVisible: boolean
  onToggleTerminal: () => void
}

const StatusBar = ({ isTerminalVisible, onToggleTerminal }: StatusBarProps) => {
  const { isDarkMode, setIsDarkMode } = useTheme()
  const { settings } = useSettings()

  return (
    <div className="flex items-center justify-between bg-editor-activity border-t border-editor-border px-4 py-1 text-xs text-gray-400">
      <div className="flex items-center space-x-4">
        <span>PG Editor v0.1.0</span>
        <span>UTF-8</span>
        <span>Spaces: {settings.tabSize}</span>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleTerminal}
          className="hover:text-white transition-colors"
          title="Toggle Terminal"
        >
          Terminal {isTerminalVisible ? '▼' : '▲'}
        </button>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
        <span>Ready</span>
      </div>
    </div>
  )
}

export default StatusBar
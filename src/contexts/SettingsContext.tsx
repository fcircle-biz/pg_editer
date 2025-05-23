import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { IDESettings } from '../types'

interface SettingsContextType {
  settings: IDESettings
  updateSettings: (newSettings: Partial<IDESettings>) => void
}

const defaultSettings: IDESettings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  formatOnSave: true,
  autoSave: false,
  keyBindings: 'default',
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<IDESettings>(() => {
    const saved = localStorage.getItem('pg-editor-settings')
    return saved ? JSON.parse(saved) : defaultSettings
  })

  useEffect(() => {
    localStorage.setItem('pg-editor-settings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<IDESettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
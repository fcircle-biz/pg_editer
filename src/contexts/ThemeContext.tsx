import { createContext, useContext, ReactNode } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeProvider = ({
  children,
  value,
}: {
  children: ReactNode
  value: ThemeContextType
}) => {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
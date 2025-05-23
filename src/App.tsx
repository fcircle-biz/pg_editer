import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import { Tab } from './types'
import { ThemeProvider } from './contexts/ThemeContext'
import { FileSystemProvider } from './contexts/FileSystemContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { useFileDrop } from './hooks/useFileDrop'
import { useFileSystem } from './contexts/FileSystemContext'

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab | null>(null)
  const [tabs, setTabs] = useState<Tab[]>([])
  const { createFile } = useFileSystem()

  const handleFileDrop = async (files: File[]) => {
    for (const file of files) {
      const content = await file.text()
      const fileEntity = await createFile(file.name, content)
      
      const newTab: Tab = {
        id: Date.now().toString(),
        fileId: fileEntity.id,
        name: fileEntity.name,
        path: fileEntity.path,
        isDirty: false,
      }
      
      setTabs((prev) => [...prev, newTab])
      setActiveTab(newTab)
    }
  }

  const { isDragging } = useFileDrop({
    onFileDrop: handleFileDrop,
    acceptedFileTypes: ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.py']
  })

  return (
    <div className="relative h-screen">
      <Layout
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={setActiveTab}
        onTabsChange={setTabs}
      />
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-editor-bg rounded-lg p-8 shadow-2xl border-2 border-blue-500 border-dashed">
            <p className="text-2xl text-white">Drop files here to open</p>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <ThemeProvider value={{ isDarkMode, setIsDarkMode }}>
      <FileSystemProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </FileSystemProvider>
    </ThemeProvider>
  )
}

export default App
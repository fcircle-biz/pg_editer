import { useState } from 'react'
import FileTree from './FileTree'
import { useFileSystem } from '../contexts/FileSystemContext'
import { Tab } from '../types'

interface SidebarProps {
  tabs: Tab[]
  activeTab?: Tab | null
  onTabsChange: (tabs: Tab[]) => void
  onTabChange: (tab: Tab | null) => void
}

const Sidebar = ({ tabs, activeTab, onTabsChange, onTabChange }: SidebarProps) => {
  const [activePanel, setActivePanel] = useState<'explorer' | 'search' | 'git'>('explorer')
  const { files, createFile, deleteFile } = useFileSystem()

  const handleFileDelete = async (fileId: string) => {
    // Close any tabs associated with the deleted file
    const newTabs = tabs.filter(tab => tab.fileId !== fileId)
    if (newTabs.length !== tabs.length) {
      onTabsChange(newTabs)
      // If the deleted file was the active tab, switch to another tab or null
      if (activeTab && activeTab.fileId === fileId) {
        onTabChange(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
      }
    }
    // Delete the file
    await deleteFile(fileId)
  }

  const handleFileOpen = (fileId: string, fileName: string, filePath: string) => {
    const existingTab = tabs.find((tab) => tab.fileId === fileId)
    if (existingTab) {
      onTabChange(existingTab)
    } else {
      const newTab: Tab = {
        id: Date.now().toString(),
        fileId,
        name: fileName,
        path: filePath,
        isDirty: false,
      }
      onTabsChange([...tabs, newTab])
      onTabChange(newTab)
    }
  }

  const handleNewFile = async () => {
    const fileName = prompt('Enter file name:')
    if (fileName) {
      const file = await createFile(fileName, '')
      handleFileOpen(file.id, file.name, file.path)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-editor-border">
        <button
          className={`flex-1 px-3 py-2 text-xs uppercase tracking-wider ${
            activePanel === 'explorer'
              ? 'bg-editor-bg text-white'
              : 'text-gray-500 hover:text-white'
          }`}
          onClick={() => setActivePanel('explorer')}
        >
          Explorer
        </button>
        <button
          className={`flex-1 px-3 py-2 text-xs uppercase tracking-wider ${
            activePanel === 'search'
              ? 'bg-editor-bg text-white'
              : 'text-gray-500 hover:text-white'
          }`}
          onClick={() => setActivePanel('search')}
        >
          Search
        </button>
        <button
          className={`flex-1 px-3 py-2 text-xs uppercase tracking-wider ${
            activePanel === 'git' ? 'bg-editor-bg text-white' : 'text-gray-500 hover:text-white'
          }`}
          onClick={() => setActivePanel('git')}
        >
          Git
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activePanel === 'explorer' && (
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-wider text-gray-500">Files</h3>
              <button
                onClick={handleNewFile}
                className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-editor-highlight"
              >
                New File
              </button>
            </div>
            <FileTree files={files} onFileSelect={handleFileOpen} onFileDelete={handleFileDelete} />
          </div>
        )}
        {activePanel === 'search' && (
          <div className="p-4 text-center text-gray-500">
            <p>Search functionality coming soon</p>
          </div>
        )}
        {activePanel === 'git' && (
          <div className="p-4 text-center text-gray-500">
            <p>Git integration coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
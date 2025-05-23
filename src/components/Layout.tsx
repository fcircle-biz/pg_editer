import { useState } from 'react'
import Sidebar from './Sidebar'
import EditorTabs from './EditorTabs'
import EditorArea from './EditorArea'
import Terminal from './Terminal'
import StatusBar from './StatusBar'
import { Tab } from '../types'

interface LayoutProps {
  activeTab: Tab | null
  tabs: Tab[]
  onTabChange: (tab: Tab | null) => void
  onTabsChange: (tabs: Tab[]) => void
}

const Layout = ({ activeTab, tabs, onTabChange, onTabsChange }: LayoutProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [isTerminalVisible, setIsTerminalVisible] = useState(true)

  const handleSidebarResize = (newWidth: number) => {
    setSidebarWidth(Math.max(150, Math.min(400, newWidth)))
  }

  const handleTerminalResize = (newHeight: number) => {
    setTerminalHeight(Math.max(100, Math.min(500, newHeight)))
  }

  return (
    <div className="flex flex-col h-screen bg-editor-bg text-editor-text">
      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-shrink-0 bg-editor-sidebar border-r border-editor-border relative resizable-panel"
          style={{ width: sidebarWidth }}
        >
          <Sidebar tabs={tabs} activeTab={activeTab} onTabsChange={onTabsChange} onTabChange={onTabChange} />
          <div
            className="resize-handle"
            onMouseDown={(e) => {
              e.preventDefault()
              const startX = e.clientX
              const startWidth = sidebarWidth

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX
                handleSidebarResize(startWidth + deltaX)
              }

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {tabs.length > 0 && (
            <EditorTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={onTabChange}
              onTabClose={(tabId) => {
                const newTabs = tabs.filter((t) => t.id !== tabId)
                onTabsChange(newTabs)
                if (activeTab?.id === tabId) {
                  onTabChange(newTabs[newTabs.length - 1] || null)
                }
              }}
            />
          )}

          <div className="flex-1 relative">
            {activeTab ? (
              <EditorArea activeTab={activeTab} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <h2 className="text-2xl mb-2">PG Editor</h2>
                  <p>Open a file to start editing</p>
                </div>
              </div>
            )}
          </div>

          {isTerminalVisible && (
            <div
              className="border-t border-editor-border bg-editor-bg relative resizable-panel"
              style={{ height: terminalHeight }}
            >
              <div
                className="resize-handle-horizontal"
                onMouseDown={(e) => {
                  e.preventDefault()
                  const startY = e.clientY
                  const startHeight = terminalHeight

                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaY = startY - e.clientY
                    handleTerminalResize(startHeight + deltaY)
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
              />
              <Terminal 
                onClose={() => setIsTerminalVisible(false)} 
                activeFileId={activeTab?.fileId}
              />
            </div>
          )}
        </div>
      </div>

      <StatusBar
        isTerminalVisible={isTerminalVisible}
        onToggleTerminal={() => setIsTerminalVisible(!isTerminalVisible)}
      />
    </div>
  )
}

export default Layout
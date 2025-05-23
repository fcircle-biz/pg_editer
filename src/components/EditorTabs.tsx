import { Tab } from '../types'

interface EditorTabsProps {
  tabs: Tab[]
  activeTab: Tab | null
  onTabChange: (tab: Tab) => void
  onTabClose: (tabId: string) => void
}

const EditorTabs = ({ tabs, activeTab, onTabChange, onTabClose }: EditorTabsProps) => {
  return (
    <div className="flex bg-editor-sidebar border-b border-editor-border overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center px-3 py-2 border-r border-editor-border cursor-pointer min-w-0 ${
            activeTab?.id === tab.id
              ? 'bg-editor-bg text-white'
              : 'text-gray-400 hover:bg-editor-bg hover:text-white'
          }`}
          onClick={() => onTabChange(tab)}
        >
          <span className="text-sm truncate max-w-[120px]">
            {tab.isDirty && <span className="mr-1">•</span>}
            {tab.name}
          </span>
          <button
            className="ml-2 text-xs hover:bg-editor-highlight rounded p-1"
            onClick={(e) => {
              e.stopPropagation()
              onTabClose(tab.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default EditorTabs
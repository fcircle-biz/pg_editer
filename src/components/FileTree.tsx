import { useState } from 'react'
import { FileEntity } from '../types'

interface FileTreeProps {
  files: FileEntity[]
  onFileSelect: (fileId: string, fileName: string, filePath: string) => void
  onFileDelete?: (fileId: string) => void
}

interface FileTreeNodeProps {
  file: FileEntity
  level: number
  onFileSelect: (fileId: string, fileName: string, filePath: string) => void
  onFileDelete?: (fileId: string) => void
}

const FileTreeNode = ({ file, level, onFileSelect, onFileDelete }: FileTreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClick = () => {
    if (file.isDirectory) {
      setIsExpanded(!isExpanded)
    } else {
      onFileSelect(file.id, file.name, file.path)
    }
  }

  const getFileIcon = () => {
    if (file.isDirectory) {
      return isExpanded ? '📂' : '📁'
    }
    const ext = file.name.split('.').pop()?.toLowerCase()
    const iconMap: Record<string, string> = {
      js: '📜',
      jsx: '⚛️',
      ts: '📘',
      tsx: '⚛️',
      html: '🌐',
      css: '🎨',
      json: '📋',
      md: '📝',
      py: '🐍',
      rs: '🦀',
      go: '🐹',
    }
    return iconMap[ext || ''] || '📄'
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onFileDelete && window.confirm(`Delete ${file.name}?`)) {
      onFileDelete(file.id)
    }
  }

  return (
    <>
      <div
        className="flex items-center py-1 px-2 hover:bg-editor-highlight cursor-pointer rounded relative group"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="mr-2 text-sm">{getFileIcon()}</span>
        <span className="text-sm truncate flex-1">{file.name}</span>
        {!file.isDirectory && onFileDelete && (
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 ml-2"
            onClick={handleDelete}
            title="Delete file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      {file.isDirectory && isExpanded && file.children && (
        <>
          {file.children.map((child) => (
            <FileTreeNode
              key={child.id}
              file={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              onFileDelete={onFileDelete}
            />
          ))}
        </>
      )}
    </>
  )
}

const FileTree = ({ files, onFileSelect, onFileDelete }: FileTreeProps) => {
  const buildTree = (files: FileEntity[]): FileEntity[] => {
    const fileMap = new Map<string, FileEntity>()
    const rootFiles: FileEntity[] = []

    files.forEach((file) => {
      fileMap.set(file.path, { ...file, children: [] })
    })

    files.forEach((file) => {
      const pathParts = file.path.split('/')
      if (pathParts.length === 1) {
        rootFiles.push(fileMap.get(file.path)!)
      } else {
        const parentPath = pathParts.slice(0, -1).join('/')
        const parent = fileMap.get(parentPath)
        if (parent && parent.children) {
          parent.children.push(fileMap.get(file.path)!)
        }
      }
    })

    return rootFiles
  }

  const treeFiles = buildTree(files)

  return (
    <div className="text-editor-text">
      {treeFiles.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">No files yet</p>
          <p className="text-xs mt-1">Click "New File" to get started</p>
        </div>
      ) : (
        treeFiles.map((file) => (
          <FileTreeNode key={file.id} file={file} level={0} onFileSelect={onFileSelect} onFileDelete={onFileDelete} />
        ))
      )}
    </div>
  )
}

export default FileTree
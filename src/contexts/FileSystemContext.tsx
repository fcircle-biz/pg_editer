import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { FileEntity, Workspace } from '../types'
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface FileSystemDB extends DBSchema {
  workspaces: {
    key: string
    value: Workspace
  }
  files: {
    key: string
    value: FileEntity
  }
}

interface FileSystemContextType {
  currentWorkspace: Workspace | null
  files: FileEntity[]
  createFile: (path: string, content: string) => Promise<FileEntity>
  updateFile: (id: string, content: string) => Promise<void>
  deleteFile: (id: string) => Promise<void>
  renameFile: (id: string, newName: string) => Promise<void>
  saveWorkspace: () => Promise<void>
  loadWorkspace: (id: string) => Promise<void>
}

const FileSystemContext = createContext<FileSystemContextType | null>(null)

export const FileSystemProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<IDBPDatabase<FileSystemDB> | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [files, setFiles] = useState<FileEntity[]>([])

  useEffect(() => {
    const initDB = async () => {
      const database = await openDB<FileSystemDB>('pg-editor-db', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('workspaces')) {
            db.createObjectStore('workspaces', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'id' })
          }
        },
      })
      setDb(database)

      const workspaces = await database.getAll('workspaces')
      if (workspaces.length === 0) {
        const defaultWorkspace: Workspace = {
          id: 'default',
          name: 'Default Workspace',
          files: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await database.put('workspaces', defaultWorkspace)
        setCurrentWorkspace(defaultWorkspace)
      } else {
        setCurrentWorkspace(workspaces[0])
        setFiles(workspaces[0].files)
      }
    }

    initDB()
  }, [])

  const createFile = async (path: string, content: string): Promise<FileEntity> => {
    const file: FileEntity = {
      id: Date.now().toString(),
      name: path.split('/').pop() || 'untitled',
      path,
      content,
      isDirty: false,
      isDirectory: false,
      language: detectLanguage(path),
    }

    const newFiles = [...files, file]
    setFiles(newFiles)

    if (currentWorkspace && db) {
      currentWorkspace.files = newFiles
      currentWorkspace.updatedAt = new Date()
      await db.put('workspaces', currentWorkspace)
    }

    return file
  }

  const updateFile = async (id: string, content: string): Promise<void> => {
    const newFiles = files.map((file) =>
      file.id === id ? { ...file, content, isDirty: true } : file
    )
    setFiles(newFiles)

    if (currentWorkspace && db) {
      currentWorkspace.files = newFiles
      currentWorkspace.updatedAt = new Date()
      await db.put('workspaces', currentWorkspace)
    }
  }

  const deleteFile = async (id: string): Promise<void> => {
    const newFiles = files.filter((file) => file.id !== id)
    setFiles(newFiles)

    if (currentWorkspace && db) {
      currentWorkspace.files = newFiles
      currentWorkspace.updatedAt = new Date()
      await db.put('workspaces', currentWorkspace)
    }
  }

  const renameFile = async (id: string, newName: string): Promise<void> => {
    const newFiles = files.map((file) => {
      if (file.id === id) {
        const pathParts = file.path.split('/')
        pathParts[pathParts.length - 1] = newName
        return {
          ...file,
          name: newName,
          path: pathParts.join('/'),
          language: detectLanguage(newName),
        }
      }
      return file
    })
    setFiles(newFiles)

    if (currentWorkspace && db) {
      currentWorkspace.files = newFiles
      currentWorkspace.updatedAt = new Date()
      await db.put('workspaces', currentWorkspace)
    }
  }

  const saveWorkspace = async (): Promise<void> => {
    if (currentWorkspace && db) {
      currentWorkspace.updatedAt = new Date()
      await db.put('workspaces', currentWorkspace)
    }
  }

  const loadWorkspace = async (id: string): Promise<void> => {
    if (db) {
      const workspace = await db.get('workspaces', id)
      if (workspace) {
        setCurrentWorkspace(workspace)
        setFiles(workspace.files)
      }
    }
  }

  const detectLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      md: 'markdown',
      py: 'python',
      rs: 'rust',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      h: 'c',
      hpp: 'cpp',
    }
    return languageMap[ext || ''] || 'plaintext'
  }

  return (
    <FileSystemContext.Provider
      value={{
        currentWorkspace,
        files,
        createFile,
        updateFile,
        deleteFile,
        renameFile,
        saveWorkspace,
        loadWorkspace,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider')
  }
  return context
}
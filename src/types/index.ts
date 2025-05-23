export interface FileEntity {
  id: string
  name: string
  path: string
  content: string
  language?: string
  isDirty: boolean
  isDirectory: boolean
  children?: FileEntity[]
}

export interface Workspace {
  id: string
  name: string
  files: FileEntity[]
  createdAt: Date
  updatedAt: Date
}

export interface Tab {
  id: string
  fileId: string
  name: string
  path: string
  isDirty: boolean
}

export interface EditorTheme {
  name: string
  isDark: boolean
  colors: Record<string, string>
}

export interface IDESettings {
  theme: 'light' | 'dark'
  fontSize: number
  fontFamily: string
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  formatOnSave: boolean
  autoSave: boolean
  keyBindings: 'default' | 'vim' | 'emacs'
}
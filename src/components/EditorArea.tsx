import { useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { useFileSystem } from '../contexts/FileSystemContext'
import { useSettings } from '../contexts/SettingsContext'
import { useTheme } from '../contexts/ThemeContext'
import { Tab } from '../types'
import { saveFile } from '../lib/fileSystemAccess'

interface EditorAreaProps {
  activeTab: Tab
}

const EditorArea = ({ activeTab }: EditorAreaProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const { files, updateFile } = useFileSystem()
  const { settings } = useSettings()
  const { isDarkMode } = useTheme()

  const file = files.find((f) => f.id === activeTab.fileId)

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position
      console.log(`Cursor at line ${position.lineNumber}, column ${position.column}`)
    })
  }

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined && file) {
        updateFile(file.id, value)
      }
    },
    [file, updateFile]
  )

  const handleSave = useCallback(async () => {
    if (settings.formatOnSave && editorRef.current) {
      await editorRef.current.getAction('editor.action.formatDocument')?.run()
    }
    
    if (file) {
      const useNativeFileSave = window.confirm(
        'Save to your local file system?\n\nOK: Save to local file\nCancel: Save to browser storage only'
      )
      
      if (useNativeFileSave) {
        const saved = await saveFile(file.content, file.name)
        if (saved) {
          console.log('File saved to local filesystem:', file.name)
        }
      } else {
        console.log('File saved to browser storage:', file.name)
      }
    }
  }, [file, settings.formatOnSave])

  useEffect(() => {
    if (editorRef.current && file) {
      const model = editorRef.current.getModel()
      if (model && model.getValue() !== file.content) {
        model.setValue(file.content)
      }
    }
  }, [file])

  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    tabSize: settings.tabSize,
    wordWrap: settings.wordWrap ? 'on' : 'off',
    minimap: {
      enabled: settings.minimap,
    },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    renderWhitespace: 'selection',
    renderLineHighlight: 'all',
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'mouseover',
    matchBrackets: 'always',
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    snippetSuggestions: 'inline',
    formatOnPaste: true,
    formatOnType: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>File not found</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={file.language || 'plaintext'}
        language={file.language || 'plaintext'}
        value={file.content}
        theme={isDarkMode ? 'vs-dark' : 'light'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
        loading={
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading editor...</p>
          </div>
        }
      />
    </div>
  )
}

export default EditorArea
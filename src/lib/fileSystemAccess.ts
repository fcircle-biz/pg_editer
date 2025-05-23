export interface FileSystemAccessSupport {
  showOpenFilePicker: boolean
  showSaveFilePicker: boolean
  showDirectoryPicker: boolean
}

export const checkFileSystemAccessSupport = (): FileSystemAccessSupport => {
  return {
    showOpenFilePicker: 'showOpenFilePicker' in window,
    showSaveFilePicker: 'showSaveFilePicker' in window,
    showDirectoryPicker: 'showDirectoryPicker' in window,
  }
}

export const openFile = async (): Promise<{ name: string; content: string } | null> => {
  if (!('showOpenFilePicker' in window)) {
    console.warn('File System Access API not supported')
    return null
  }

  try {
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'Text files',
          accept: {
            'text/*': ['.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json'],
          },
        },
        {
          description: 'JavaScript files',
          accept: {
            'application/javascript': ['.js', '.jsx', '.mjs'],
          },
        },
        {
          description: 'TypeScript files',
          accept: {
            'application/typescript': ['.ts', '.tsx'],
          },
        },
      ],
      multiple: false,
    })

    const file = await fileHandle.getFile()
    const content = await file.text()

    return {
      name: file.name,
      content,
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Error opening file:', err)
    }
    return null
  }
}

export const saveFile = async (
  content: string,
  suggestedName: string = 'untitled.txt'
): Promise<boolean> => {
  if (!('showSaveFilePicker' in window)) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = suggestedName
    a.click()
    URL.revokeObjectURL(url)
    return true
  }

  try {
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: 'Text files',
          accept: {
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/javascript': ['.js', '.jsx', '.mjs'],
            'application/typescript': ['.ts', '.tsx'],
            'text/html': ['.html'],
            'text/css': ['.css'],
            'application/json': ['.json'],
          },
        },
      ],
    })

    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()

    return true
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Error saving file:', err)
    }
    return false
  }
}

export const openDirectory = async (): Promise<FileSystemDirectoryHandle | null> => {
  if (!('showDirectoryPicker' in window)) {
    console.warn('Directory picker not supported')
    return null
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker()
    return dirHandle
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Error opening directory:', err)
    }
    return null
  }
}
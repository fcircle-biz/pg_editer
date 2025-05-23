import { useCallback, useEffect, useState } from 'react'

interface UseFileDropOptions {
  onFileDrop: (files: File[]) => void
  acceptedFileTypes?: string[]
}

export const useFileDrop = ({ onFileDrop, acceptedFileTypes }: UseFileDropOptions) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.target === e.currentTarget) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer?.files || [])
      
      if (acceptedFileTypes && acceptedFileTypes.length > 0) {
        const filteredFiles = files.filter((file) => {
          const fileExtension = file.name.split('.').pop()?.toLowerCase()
          return acceptedFileTypes.some((type) => {
            if (type.startsWith('.')) {
              return type.slice(1) === fileExtension
            }
            return file.type === type
          })
        })
        onFileDrop(filteredFiles)
      } else {
        onFileDrop(files)
      }
    },
    [onFileDrop, acceptedFileTypes]
  )

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return { isDragging }
}
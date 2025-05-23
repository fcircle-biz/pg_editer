import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFileDrop } from './useFileDrop'

describe('useFileDrop', () => {
  const mockOnFileDrop = vi.fn()

  beforeEach(() => {
    mockOnFileDrop.mockClear()
  })

  it('should initialize with isDragging false', () => {
    const { result } = renderHook(() => useFileDrop({ onFileDrop: mockOnFileDrop }))
    
    expect(result.current.isDragging).toBe(false)
  })

  it('should set isDragging to true on dragenter', () => {
    const { result } = renderHook(() => useFileDrop({ onFileDrop: mockOnFileDrop }))
    
    act(() => {
      const event = new DragEvent('dragenter', {
        dataTransfer: new DataTransfer(),
      })
      window.dispatchEvent(event)
    })
    
    expect(result.current.isDragging).toBe(true)
  })

  it('should set isDragging to false on dragleave', () => {
    const { result } = renderHook(() => useFileDrop({ onFileDrop: mockOnFileDrop }))
    
    act(() => {
      const enterEvent = new DragEvent('dragenter', {
        dataTransfer: new DataTransfer(),
      })
      window.dispatchEvent(enterEvent)
    })
    
    expect(result.current.isDragging).toBe(true)
    
    act(() => {
      const leaveEvent = new DragEvent('dragleave', {
        dataTransfer: new DataTransfer(),
      })
      Object.defineProperty(leaveEvent, 'target', { value: window })
      Object.defineProperty(leaveEvent, 'currentTarget', { value: window })
      window.dispatchEvent(leaveEvent)
    })
    
    expect(result.current.isDragging).toBe(false)
  })

  it('should handle file drop', () => {
    const { result } = renderHook(() => useFileDrop({ onFileDrop: mockOnFileDrop }))
    
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' })
    
    act(() => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file1)
      dataTransfer.items.add(file2)
      
      const event = new DragEvent('drop', {
        dataTransfer,
      })
      window.dispatchEvent(event)
    })
    
    expect(mockOnFileDrop).toHaveBeenCalledWith([file1, file2])
    expect(result.current.isDragging).toBe(false)
  })

  it('should filter files by accepted types', () => {
    renderHook(() =>
      useFileDrop({
        onFileDrop: mockOnFileDrop,
        acceptedFileTypes: ['.txt', '.md'],
      })
    )
    
    const txtFile = new File(['txt content'], 'test.txt', { type: 'text/plain' })
    const mdFile = new File(['md content'], 'test.md', { type: 'text/markdown' })
    const jsFile = new File(['js content'], 'test.js', { type: 'text/javascript' })
    
    act(() => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(txtFile)
      dataTransfer.items.add(mdFile)
      dataTransfer.items.add(jsFile)
      
      const event = new DragEvent('drop', {
        dataTransfer,
      })
      window.dispatchEvent(event)
    })
    
    expect(mockOnFileDrop).toHaveBeenCalledWith([txtFile, mdFile])
  })

  it('should filter files by MIME type', () => {
    renderHook(() =>
      useFileDrop({
        onFileDrop: mockOnFileDrop,
        acceptedFileTypes: ['text/plain', 'text/markdown'],
      })
    )
    
    const txtFile = new File(['txt content'], 'test.txt', { type: 'text/plain' })
    const mdFile = new File(['md content'], 'test.md', { type: 'text/markdown' })
    const jsFile = new File(['js content'], 'test.js', { type: 'text/javascript' })
    
    act(() => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(txtFile)
      dataTransfer.items.add(mdFile)
      dataTransfer.items.add(jsFile)
      
      const event = new DragEvent('drop', {
        dataTransfer,
      })
      window.dispatchEvent(event)
    })
    
    expect(mockOnFileDrop).toHaveBeenCalledWith([txtFile, mdFile])
  })

  it('should prevent default behavior on drag events', () => {
    renderHook(() => useFileDrop({ onFileDrop: mockOnFileDrop }))
    
    const events = ['dragenter', 'dragleave', 'dragover', 'drop']
    
    events.forEach((eventType) => {
      const event = new DragEvent(eventType, {
        dataTransfer: new DataTransfer(),
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
      
      act(() => {
        window.dispatchEvent(event)
      })
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    const { unmount } = renderHook(() => useFileDrop({ onFileDrop: mockOnFileDrop }))
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('dragenter', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('dragleave', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })
})
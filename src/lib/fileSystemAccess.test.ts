import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkFileSystemAccessSupport, openFile, saveFile, openDirectory } from './fileSystemAccess'

describe('fileSystemAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkFileSystemAccessSupport', () => {
    it('should detect File System Access API support', () => {
      // Test with all APIs available
      Object.defineProperty(window, 'showOpenFilePicker', { value: vi.fn(), configurable: true })
      Object.defineProperty(window, 'showSaveFilePicker', { value: vi.fn(), configurable: true })
      Object.defineProperty(window, 'showDirectoryPicker', { value: vi.fn(), configurable: true })
      
      expect(checkFileSystemAccessSupport()).toEqual({
        showOpenFilePicker: true,
        showSaveFilePicker: true,
        showDirectoryPicker: true,
      })
      
      // Test with no APIs available
      delete (window as any).showOpenFilePicker
      delete (window as any).showSaveFilePicker
      delete (window as any).showDirectoryPicker
      
      expect(checkFileSystemAccessSupport()).toEqual({
        showOpenFilePicker: false,
        showSaveFilePicker: false,
        showDirectoryPicker: false,
      })
    })
  })

  describe('openFile', () => {
    it('should open a file when API is available', async () => {
      const mockFile = {
        name: 'test.txt',
        text: vi.fn().mockResolvedValue('test content'),
      }
      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      }
      
      const mockShowOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle])
      Object.defineProperty(window, 'showOpenFilePicker', {
        value: mockShowOpenFilePicker,
        configurable: true,
      })
      
      const result = await openFile()
      
      expect(mockShowOpenFilePicker).toHaveBeenCalledWith({
        types: expect.any(Array),
        multiple: false,
      })
      expect(result).toEqual({
        name: 'test.txt',
        content: 'test content',
      })
      
      delete (window as any).showOpenFilePicker
    })

    it('should return null when API is not available', async () => {
      delete (window as any).showOpenFilePicker
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = await openFile()
      
      expect(consoleSpy).toHaveBeenCalledWith('File System Access API not supported')
      expect(result).toBeNull()
      
      consoleSpy.mockRestore()
    })

    it('should handle user cancellation', async () => {
      const mockShowOpenFilePicker = vi.fn().mockRejectedValue(new DOMException('User cancelled', 'AbortError'))
      Object.defineProperty(window, 'showOpenFilePicker', {
        value: mockShowOpenFilePicker,
        configurable: true,
      })
      
      const result = await openFile()
      
      expect(result).toBeNull()
      
      delete (window as any).showOpenFilePicker
    })

    it('should handle errors', async () => {
      const mockShowOpenFilePicker = vi.fn().mockRejectedValue(new Error('Unknown error'))
      Object.defineProperty(window, 'showOpenFilePicker', {
        value: mockShowOpenFilePicker,
        configurable: true,
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = await openFile()
      
      expect(consoleSpy).toHaveBeenCalledWith('Error opening file:', expect.any(Error))
      expect(result).toBeNull()
      
      consoleSpy.mockRestore()
      delete (window as any).showOpenFilePicker
    })
  })

  describe('saveFile', () => {
    it('should save file using File System Access API when available', async () => {
      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      }
      
      const mockFileHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      }
      
      const mockShowSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle)
      Object.defineProperty(window, 'showSaveFilePicker', {
        value: mockShowSaveFilePicker,
        configurable: true,
      })
      
      const result = await saveFile('test content', 'test.txt')
      
      expect(mockShowSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: 'test.txt',
        types: expect.any(Array),
      })
      expect(mockWritable.write).toHaveBeenCalledWith('test content')
      expect(mockWritable.close).toHaveBeenCalled()
      expect(result).toBe(true)
      
      delete (window as any).showSaveFilePicker
    })

    it('should fallback to download when API is not available', async () => {
      delete (window as any).showSaveFilePicker
      
      const createElementSpy = vi.spyOn(document, 'createElement')
      const clickSpy = vi.fn()
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')
      
      createElementSpy.mockReturnValue({
        href: '',
        download: '',
        click: clickSpy,
      } as any)
      
      const result = await saveFile('test content', 'test.txt')
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()
      expect(result).toBe(true)
      
      createElementSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })

    it('should handle user cancellation', async () => {
      const mockShowSaveFilePicker = vi.fn().mockRejectedValue(new DOMException('User cancelled', 'AbortError'))
      Object.defineProperty(window, 'showSaveFilePicker', {
        value: mockShowSaveFilePicker,
        configurable: true,
      })
      
      const result = await saveFile('test content', 'test.txt')
      
      expect(result).toBe(false)
      
      delete (window as any).showSaveFilePicker
    })

    it('should handle errors', async () => {
      const mockShowSaveFilePicker = vi.fn().mockRejectedValue(new Error('Unknown error'))
      Object.defineProperty(window, 'showSaveFilePicker', {
        value: mockShowSaveFilePicker,
        configurable: true,
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = await saveFile('test content', 'test.txt')
      
      expect(consoleSpy).toHaveBeenCalledWith('Error saving file:', expect.any(Error))
      expect(result).toBe(false)
      
      consoleSpy.mockRestore()
      delete (window as any).showSaveFilePicker
    })
  })

  describe('openDirectory', () => {
    it('should open directory when API is available', async () => {
      const mockDirHandle = { name: 'test-dir' }
      const mockShowDirectoryPicker = vi.fn().mockResolvedValue(mockDirHandle)
      
      Object.defineProperty(window, 'showDirectoryPicker', {
        value: mockShowDirectoryPicker,
        configurable: true,
      })
      
      const result = await openDirectory()
      
      expect(mockShowDirectoryPicker).toHaveBeenCalled()
      expect(result).toBe(mockDirHandle)
      
      delete (window as any).showDirectoryPicker
    })

    it('should return null when API is not available', async () => {
      delete (window as any).showDirectoryPicker
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = await openDirectory()
      
      expect(consoleSpy).toHaveBeenCalledWith('Directory picker not supported')
      expect(result).toBeNull()
      
      consoleSpy.mockRestore()
    })

    it('should handle user cancellation', async () => {
      const mockShowDirectoryPicker = vi.fn().mockRejectedValue(new DOMException('User cancelled', 'AbortError'))
      Object.defineProperty(window, 'showDirectoryPicker', {
        value: mockShowDirectoryPicker,
        configurable: true,
      })
      
      const result = await openDirectory()
      
      expect(result).toBeNull()
      
      delete (window as any).showDirectoryPicker
    })

    it('should handle errors', async () => {
      const mockShowDirectoryPicker = vi.fn().mockRejectedValue(new Error('Unknown error'))
      Object.defineProperty(window, 'showDirectoryPicker', {
        value: mockShowDirectoryPicker,
        configurable: true,
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = await openDirectory()
      
      expect(consoleSpy).toHaveBeenCalledWith('Error opening directory:', expect.any(Error))
      expect(result).toBeNull()
      
      consoleSpy.mockRestore()
      delete (window as any).showDirectoryPicker
    })
  })
})
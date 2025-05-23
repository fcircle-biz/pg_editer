import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock IndexedDB
vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockResolvedValue([]),
    put: vi.fn().mockResolvedValue(undefined),
    objectStoreNames: {
      contains: vi.fn().mockReturnValue(false),
    },
  }),
}))

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ value, onChange }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )),
}))

// Mock xterm
vi.mock('xterm', () => ({
  Terminal: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    writeln: vi.fn(),
    write: vi.fn(),
    onData: vi.fn(),
    dispose: vi.fn(),
    loadAddon: vi.fn(),
    clear: vi.fn(),
  })),
}))

vi.mock('xterm-addon-fit', () => ({
  FitAddon: vi.fn().mockImplementation(() => ({
    fit: vi.fn(),
  })),
}))

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the main layout', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('PG Editor')).toBeInTheDocument()
      expect(screen.getByText('Open a file to start editing')).toBeInTheDocument()
    })
  })

  it('should toggle theme between light and dark', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Should start in dark mode
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    
    // Find and click theme toggle button
    const themeToggle = await screen.findByTitle('Toggle Theme')
    await user.click(themeToggle)
    
    // Should switch to light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    
    // Click again to switch back
    await user.click(themeToggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should show terminal when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Terminal should be visible by default
    const terminal = await screen.findByText('Terminal')
    expect(terminal).toBeInTheDocument()
    
    // Find and click terminal toggle
    const terminalToggle = await screen.findByTitle('Toggle Terminal')
    await user.click(terminalToggle)
    
    // Terminal should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Terminal')).not.toBeInTheDocument()
    })
    
    // Click again to show
    await user.click(terminalToggle)
    await waitFor(() => {
      expect(screen.getByText('Terminal')).toBeInTheDocument()
    })
  })

  it('should create a new file', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Click new file button
    const newFileButton = await screen.findByText('New File')
    
    // Mock window.prompt
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('test.js')
    
    await user.click(newFileButton)
    
    expect(promptSpy).toHaveBeenCalledWith('Enter file name:')
    
    // File should appear in the tree and tab
    await waitFor(() => {
      const testFiles = screen.getAllByText('test.js')
      expect(testFiles.length).toBeGreaterThan(0)
    })
    
    promptSpy.mockRestore()
  })

  it('should handle file drag and drop', async () => {
    render(<App />)
    
    const file = new File(['console.log("hello")'], 'dropped.js', { type: 'text/javascript' })
    
    // Simulate drag enter
    const dragEnterEvent = new DragEvent('dragenter', {
      dataTransfer: new DataTransfer(),
    })
    window.dispatchEvent(dragEnterEvent)
    
    // Should show drop zone
    await waitFor(() => {
      expect(screen.getByText('Drop files here to open')).toBeInTheDocument()
    })
    
    // Simulate drop
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    const dropEvent = new DragEvent('drop', {
      dataTransfer,
    })
    window.dispatchEvent(dropEvent)
    
    // Drop zone should disappear and file should be added
    await waitFor(() => {
      expect(screen.queryByText('Drop files here to open')).not.toBeInTheDocument()
      expect(screen.getByText('dropped.js')).toBeInTheDocument()
    })
  })

  it('should display file explorer panel', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Explorer should be active by default
    expect(screen.getByText('Files')).toBeInTheDocument()
    
    // Click on Search tab
    const searchTab = screen.getByText('Search')
    await user.click(searchTab)
    
    await waitFor(() => {
      expect(screen.getByText('Search functionality coming soon')).toBeInTheDocument()
    })
    
    // Click on Git tab
    const gitTab = screen.getByText('Git')
    await user.click(gitTab)
    
    await waitFor(() => {
      expect(screen.getByText('Git integration coming soon')).toBeInTheDocument()
    })
  })

  it('should show empty state when no files', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('No files yet')).toBeInTheDocument()
      expect(screen.getByText('Click "New File" to get started')).toBeInTheDocument()
    })
  })

  it('should display status bar information', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('PG Editor v0.1.0')).toBeInTheDocument()
      expect(screen.getByText('UTF-8')).toBeInTheDocument()
      expect(screen.getByText(/Spaces: \d+/)).toBeInTheDocument()
      expect(screen.getByText('Ready')).toBeInTheDocument()
    })
  })
})
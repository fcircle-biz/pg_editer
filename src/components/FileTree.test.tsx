import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FileTree from './FileTree'
import { FileEntity } from '../types'

describe('FileTree', () => {
  const mockOnFileSelect = vi.fn()

  const mockFiles: FileEntity[] = [
    {
      id: '1',
      name: 'index.js',
      path: 'index.js',
      content: 'console.log("hello")',
      language: 'javascript',
      isDirty: false,
      isDirectory: false,
    },
    {
      id: '2',
      name: 'src',
      path: 'src',
      content: '',
      isDirty: false,
      isDirectory: true,
    },
    {
      id: '3',
      name: 'app.js',
      path: 'src/app.js',
      content: 'export default App',
      language: 'javascript',
      isDirty: false,
      isDirectory: false,
    },
  ]

  beforeEach(() => {
    mockOnFileSelect.mockClear()
  })

  it('should render empty state when no files', () => {
    render(<FileTree files={[]} onFileSelect={mockOnFileSelect} />)
    
    expect(screen.getByText('No files yet')).toBeInTheDocument()
    expect(screen.getByText('Click "New File" to get started')).toBeInTheDocument()
  })

  it('should render file tree structure', () => {
    render(<FileTree files={mockFiles} onFileSelect={mockOnFileSelect} />)
    
    expect(screen.getByText('index.js')).toBeInTheDocument()
    expect(screen.getByText('src')).toBeInTheDocument()
  })

  it('should call onFileSelect when clicking a file', () => {
    render(<FileTree files={mockFiles} onFileSelect={mockOnFileSelect} />)
    
    const fileNode = screen.getByText('index.js')
    fireEvent.click(fileNode)
    
    expect(mockOnFileSelect).toHaveBeenCalledWith('1', 'index.js', 'index.js')
  })

  it('should expand/collapse directories', () => {
    render(<FileTree files={mockFiles} onFileSelect={mockOnFileSelect} />)
    
    const dirNode = screen.getByText('src')
    
    // Initially collapsed
    expect(screen.queryByText('app.js')).not.toBeInTheDocument()
    
    // Click to expand
    fireEvent.click(dirNode)
    expect(screen.getByText('app.js')).toBeInTheDocument()
    
    // Click to collapse
    fireEvent.click(dirNode)
    expect(screen.queryByText('app.js')).not.toBeInTheDocument()
  })

  it('should display correct file icons', () => {
    const filesWithDifferentTypes: FileEntity[] = [
      {
        id: '1',
        name: 'index.tsx',
        path: 'index.tsx',
        content: '',
        language: 'typescript',
        isDirty: false,
        isDirectory: false,
      },
      {
        id: '2',
        name: 'styles.css',
        path: 'styles.css',
        content: '',
        language: 'css',
        isDirty: false,
        isDirectory: false,
      },
      {
        id: '3',
        name: 'README.md',
        path: 'README.md',
        content: '',
        language: 'markdown',
        isDirty: false,
        isDirectory: false,
      },
    ]
    
    render(<FileTree files={filesWithDifferentTypes} onFileSelect={mockOnFileSelect} />)
    
    // Check for specific emoji icons
    expect(screen.getByText('⚛️')).toBeInTheDocument() // TSX
    expect(screen.getByText('🎨')).toBeInTheDocument() // CSS
    expect(screen.getByText('📝')).toBeInTheDocument() // Markdown
  })

  it('should handle nested directory structures', () => {
    const nestedFiles: FileEntity[] = [
      {
        id: '1',
        name: 'src',
        path: 'src',
        content: '',
        isDirty: false,
        isDirectory: true,
      },
      {
        id: '2',
        name: 'components',
        path: 'src/components',
        content: '',
        isDirty: false,
        isDirectory: true,
      },
      {
        id: '3',
        name: 'Button.tsx',
        path: 'src/components/Button.tsx',
        content: '',
        language: 'typescript',
        isDirty: false,
        isDirectory: false,
      },
    ]
    
    render(<FileTree files={nestedFiles} onFileSelect={mockOnFileSelect} />)
    
    // Expand first level
    fireEvent.click(screen.getByText('src'))
    expect(screen.getByText('components')).toBeInTheDocument()
    
    // Expand second level
    fireEvent.click(screen.getByText('components'))
    expect(screen.getByText('Button.tsx')).toBeInTheDocument()
    
    // Click the file
    fireEvent.click(screen.getByText('Button.tsx'))
    expect(mockOnFileSelect).toHaveBeenCalledWith('3', 'Button.tsx', 'src/components/Button.tsx')
  })
})
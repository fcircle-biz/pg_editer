import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EditorTabs from './EditorTabs'
import { Tab } from '../types'

describe('EditorTabs', () => {
  const mockOnTabChange = vi.fn()
  const mockOnTabClose = vi.fn()

  const mockTabs: Tab[] = [
    {
      id: '1',
      fileId: 'file1',
      name: 'index.js',
      path: 'index.js',
      isDirty: false,
    },
    {
      id: '2',
      fileId: 'file2',
      name: 'app.js',
      path: 'app.js',
      isDirty: true,
    },
    {
      id: '3',
      fileId: 'file3',
      name: 'styles.css',
      path: 'styles.css',
      isDirty: false,
    },
  ]

  beforeEach(() => {
    mockOnTabChange.mockClear()
    mockOnTabClose.mockClear()
  })

  it('should render all tabs', () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTab={mockTabs[0]}
        onTabChange={mockOnTabChange}
        onTabClose={mockOnTabClose}
      />
    )
    
    expect(screen.getByText('index.js')).toBeInTheDocument()
    expect(screen.getByText('app.js')).toBeInTheDocument()
    expect(screen.getByText('styles.css')).toBeInTheDocument()
  })

  it('should highlight active tab', () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTab={mockTabs[1]}
        onTabChange={mockOnTabChange}
        onTabClose={mockOnTabClose}
      />
    )
    
    const activeTab = screen.getByText('app.js').closest('div')
    expect(activeTab).toHaveClass('bg-editor-bg', 'text-white')
  })

  it('should show dirty indicator for modified files', () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTab={mockTabs[0]}
        onTabChange={mockOnTabChange}
        onTabClose={mockOnTabClose}
      />
    )
    
    // The dirty indicator and filename are in separate spans
    const dirtyIndicator = screen.getByText('•')
    const dirtyTabName = screen.getByText('app.js')
    
    // Check they're both present and the indicator is before the filename
    expect(dirtyIndicator).toBeInTheDocument()
    expect(dirtyTabName).toBeInTheDocument()
    
    // Verify the parent span contains both elements
    const parentSpan = dirtyIndicator.parentElement
    expect(parentSpan).toContainElement(dirtyTabName)
  })

  it('should call onTabChange when clicking a tab', () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTab={mockTabs[0]}
        onTabChange={mockOnTabChange}
        onTabClose={mockOnTabClose}
      />
    )
    
    const tab = screen.getByText('styles.css').closest('div')
    fireEvent.click(tab!)
    
    expect(mockOnTabChange).toHaveBeenCalledWith(mockTabs[2])
  })

  it('should call onTabClose when clicking close button', () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTab={mockTabs[0]}
        onTabChange={mockOnTabChange}
        onTabClose={mockOnTabClose}
      />
    )
    
    const closeButtons = screen.getAllByText('×')
    fireEvent.click(closeButtons[1])
    
    expect(mockOnTabClose).toHaveBeenCalledWith('2')
    expect(mockOnTabChange).not.toHaveBeenCalled()
  })

  it('should stop propagation when clicking close button', () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTab={mockTabs[0]}
        onTabChange={mockOnTabChange}
        onTabClose={mockOnTabClose}
      />
    )
    
    const closeButton = screen.getAllByText('×')[0]
    const tabDiv = closeButton.closest('div')
    
    const tabClickHandler = vi.fn()
    tabDiv?.addEventListener('click', tabClickHandler)
    
    fireEvent.click(closeButton)
    
    expect(mockOnTabClose).toHaveBeenCalledWith('1')
    expect(mockOnTabChange).not.toHaveBeenCalled()
  })

  it('should handle empty tabs array', () => {
    const { container } = render(
      <EditorTabs
        tabs={[]}
        activeTab={null}
        onTabChange={mockOnTabChange}
        onTabClose={mockOnTabClose}
      />
    )
    
    const tabsContainer = container.querySelector('.flex.bg-editor-sidebar')
    expect(tabsContainer).toBeInTheDocument()
    expect(tabsContainer?.children.length).toBe(0)
  })

  it('should truncate long file names', () => {
    const longNameTab: Tab = {
      id: '4',
      fileId: 'file4',
      name: 'this-is-a-very-long-filename-that-should-be-truncated.js',
      path: 'this-is-a-very-long-filename-that-should-be-truncated.js',
      isDirty: false,
    }
    
    render(
      <EditorTabs
        tabs={[longNameTab]}
        activeTab={longNameTab}
        onTabChange={mockOnTabChange}
        onTabClose={mockOnTabClose}
      />
    )
    
    const tabText = screen.getByText('this-is-a-very-long-filename-that-should-be-truncated.js')
    expect(tabText).toHaveClass('truncate', 'max-w-[120px]')
  })
})
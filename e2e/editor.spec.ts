import { test, expect } from '@playwright/test'

test.describe('PG Editor E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should load the editor interface', async ({ page }) => {
    await expect(page.locator('text=PG Editor')).toBeVisible()
    await expect(page.locator('text=Open a file to start editing')).toBeVisible()
  })

  test('should create and edit a new file', async ({ page }) => {
    // Click new file button
    await page.click('text=New File')
    
    // Handle the prompt dialog
    page.on('dialog', async dialog => {
      await dialog.accept('test.js')
    })
    
    // Wait for file to appear in tree
    await expect(page.locator('text=test.js')).toBeVisible()
    
    // Click on the file to open it
    await page.click('text=test.js')
    
    // Wait for editor to be visible
    await page.waitForSelector('.monaco-editor', { state: 'visible' })
    
    // Type in the editor
    await page.keyboard.type('console.log("Hello, World!");')
    
    // Save the file (Ctrl+S)
    await page.keyboard.press('Control+s')
    
    // Handle save dialog
    page.on('dialog', async dialog => {
      await dialog.dismiss() // Cancel to save only to browser storage
    })
  })

  test('should toggle between light and dark themes', async ({ page }) => {
    // Check initial dark theme
    await expect(page.locator('html')).toHaveClass(/dark/)
    
    // Click theme toggle button
    await page.click('[title="Toggle Theme"]')
    
    // Check light theme
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    
    // Toggle back to dark
    await page.click('[title="Toggle Theme"]')
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('should toggle terminal visibility', async ({ page }) => {
    // Terminal should be visible initially
    await expect(page.locator('text=Terminal')).toBeVisible()
    
    // Click toggle button
    await page.click('[title="Toggle Terminal"]')
    
    // Terminal should be hidden
    await expect(page.locator('text=Terminal')).not.toBeVisible()
    
    // Toggle back
    await page.click('[title="Toggle Terminal"]')
    await expect(page.locator('text=Terminal')).toBeVisible()
  })

  test('should switch between sidebar panels', async ({ page }) => {
    // Explorer should be active by default
    await expect(page.locator('text=Files')).toBeVisible()
    
    // Switch to Search
    await page.click('text=Search')
    await expect(page.locator('text=Search functionality coming soon')).toBeVisible()
    
    // Switch to Git
    await page.click('text=Git')
    await expect(page.locator('text=Git integration coming soon')).toBeVisible()
    
    // Switch back to Explorer
    await page.click('text=Explorer')
    await expect(page.locator('text=Files')).toBeVisible()
  })

  test('should handle file drag and drop', async ({ page }) => {
    // Create a test file
    const buffer = Buffer.from('const test = "drag and drop test";')
    
    // Create file chooser
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await page.evaluateHandle(
      ([dt, buffer]) => {
        const file = new File([buffer], 'dropped.js', { type: 'text/javascript' })
        dt.items.add(file)
      },
      [dataTransfer, buffer]
    )
    
    // Dispatch drag events
    await page.dispatchEvent('body', 'dragenter', { dataTransfer })
    
    // Check drop zone appears
    await expect(page.locator('text=Drop files here to open')).toBeVisible()
    
    await page.dispatchEvent('body', 'drop', { dataTransfer })
    
    // Check file appears in tree
    await expect(page.locator('text=dropped.js')).toBeVisible()
  })

  test('should execute JavaScript code', async ({ page }) => {
    // Create a new file
    await page.click('text=New File')
    
    page.on('dialog', async dialog => {
      if (dialog.message().includes('Enter file name:')) {
        await dialog.accept('test.js')
      }
    })
    
    // Wait for file and click it
    await page.waitForSelector('text=test.js')
    await page.click('text=test.js')
    
    // Wait for editor
    await page.waitForSelector('.monaco-editor', { state: 'visible' })
    
    // Type code
    await page.keyboard.type('console.log("Test execution");')
    
    // Click in terminal area
    const terminal = page.locator('.xterm')
    await terminal.click()
    
    // Type run command
    await page.keyboard.type('run')
    await page.keyboard.press('Enter')
    
    // Check for execution output
    await expect(page.locator('text=Running test.js')).toBeVisible()
  })

  test('should handle multiple tabs', async ({ page }) => {
    // Create first file
    await page.click('text=New File')
    page.on('dialog', async dialog => {
      if (dialog.message().includes('Enter file name:')) {
        await dialog.accept('file1.js')
      }
    })
    await page.waitForSelector('text=file1.js')
    
    // Create second file
    await page.click('text=New File')
    page.on('dialog', async dialog => {
      if (dialog.message().includes('Enter file name:')) {
        await dialog.accept('file2.js')
      }
    })
    await page.waitForSelector('text=file2.js')
    
    // Both tabs should be visible
    await expect(page.locator('.border-r').filter({ hasText: 'file1.js' })).toBeVisible()
    await expect(page.locator('.border-r').filter({ hasText: 'file2.js' })).toBeVisible()
    
    // Switch between tabs
    await page.click('text=file1.js')
    await expect(page.locator('.bg-editor-bg').filter({ hasText: 'file1.js' })).toBeVisible()
    
    // Close a tab
    await page.click('.border-r:has-text("file2.js") button:has-text("×")')
    await expect(page.locator('text=file2.js')).not.toBeVisible()
  })

  test('should resize panels', async ({ page }) => {
    // Get initial sidebar width
    const sidebar = page.locator('.bg-editor-sidebar').first()
    const initialBox = await sidebar.boundingBox()
    const initialWidth = initialBox?.width || 0
    
    // Find and drag the resize handle
    const resizeHandle = page.locator('.resize-handle').first()
    await resizeHandle.hover()
    await page.mouse.down()
    await page.mouse.move(100, 0) // Move 100px to the right
    await page.mouse.up()
    
    // Check sidebar width increased
    const newBox = await sidebar.boundingBox()
    const newWidth = newBox?.width || 0
    expect(newWidth).toBeGreaterThan(initialWidth)
  })

  test('should persist files after reload', async ({ page }) => {
    // Create a file
    await page.click('text=New File')
    page.on('dialog', async dialog => {
      await dialog.accept('persistent.js')
    })
    
    await page.waitForSelector('text=persistent.js')
    await page.click('text=persistent.js')
    
    // Type content
    await page.waitForSelector('.monaco-editor', { state: 'visible' })
    await page.keyboard.type('// This should persist')
    
    // Wait for auto-save
    await page.waitForTimeout(1000)
    
    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check file still exists
    await expect(page.locator('text=persistent.js')).toBeVisible()
    
    // Open file and check content
    await page.click('text=persistent.js')
    await page.waitForSelector('.monaco-editor', { state: 'visible' })
    
    // Content should be preserved (Monaco editor will show it)
    const editorContent = await page.locator('.monaco-editor').textContent()
    expect(editorContent).toContain('This should persist')
  })
})
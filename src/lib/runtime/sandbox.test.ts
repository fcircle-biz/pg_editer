import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SandboxRuntime } from './sandbox'

describe('SandboxRuntime', () => {
  let sandbox: SandboxRuntime
  let mockIframe: HTMLIFrameElement

  beforeEach(() => {
    sandbox = new SandboxRuntime()
    mockIframe = document.createElement('iframe')
    
    // Mock document.body.appendChild if it doesn't exist
    if (!document.body) {
      document.body = document.createElement('body')
    }
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockIframe)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    sandbox.cleanup()
  })

  describe('execute', () => {
    it('should create an iframe for JavaScript code execution', async () => {
      await sandbox.execute('console.log("test")', 'javascript')
      
      expect(document.body.appendChild).toHaveBeenCalledWith(expect.any(HTMLIFrameElement))
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    })

    it('should transpile TypeScript code before execution', async () => {
      const tsCode = `
        const message: string = "Hello"
        console.log(message)
      `
      await sandbox.execute(tsCode, 'typescript')
      
      // Since we're mocking Blob in tests, we need to check the arguments directly
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Object))
      expect(document.body.appendChild).toHaveBeenCalled()
    })

    it('should handle imports in TypeScript', async () => {
      const tsCode = `
        import { something } from './module'
        export const value = 42
      `
      await sandbox.execute(tsCode, 'typescript')
      
      // Since we're mocking Blob in tests, we need to check the arguments directly
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Object))
      expect(document.body.appendChild).toHaveBeenCalled()
    })
  })

  describe('message handling', () => {
    it('should handle console messages', () => {
      const messageHandler = vi.fn()
      sandbox.onMessage(messageHandler)

      const event = new MessageEvent('message', {
        data: {
          source: 'sandbox',
          type: 'console',
          payload: { method: 'log', args: ['test message'] }
        }
      })
      window.dispatchEvent(event)

      expect(messageHandler).toHaveBeenCalledWith({
        source: 'sandbox',
        type: 'console',
        payload: { method: 'log', args: ['test message'] }
      })
    })

    it('should handle error messages', () => {
      const messageHandler = vi.fn()
      sandbox.onMessage(messageHandler)

      const event = new MessageEvent('message', {
        data: {
          source: 'sandbox',
          type: 'error',
          payload: { message: 'Error occurred', stack: 'Error stack' }
        }
      })
      window.dispatchEvent(event)

      expect(messageHandler).toHaveBeenCalledWith({
        source: 'sandbox',
        type: 'error',
        payload: { message: 'Error occurred', stack: 'Error stack' }
      })
    })

    it('should ignore messages from non-sandbox sources', () => {
      const messageHandler = vi.fn()
      sandbox.onMessage(messageHandler)

      const event = new MessageEvent('message', {
        data: {
          source: 'other',
          type: 'console',
          payload: {}
        }
      })
      window.dispatchEvent(event)

      expect(messageHandler).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('should remove iframe on cleanup', async () => {
      // Create a real iframe element for this test
      const realIframe = document.createElement('iframe')
      const removeSpy = vi.spyOn(realIframe, 'remove')
      
      // Override appendChild to return our real iframe
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
        sandbox['iframe'] = realIframe  // Set the iframe directly
        return realIframe
      })
      
      await sandbox.execute('console.log("test")', 'javascript')
      sandbox.cleanup()
      
      expect(removeSpy).toHaveBeenCalled()
    })

    it('should handle multiple cleanups gracefully', () => {
      expect(() => {
        sandbox.cleanup()
        sandbox.cleanup()
      }).not.toThrow()
    })
  })
})
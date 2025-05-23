import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRuntime } from './useRuntime'

vi.mock('../lib/runtime/sandbox', () => ({
  SandboxRuntime: vi.fn().mockImplementation(() => ({
    onMessage: vi.fn(),
    execute: vi.fn(),
    cleanup: vi.fn(),
  })),
}))

describe('useRuntime', () => {
  it('should initialize with empty outputs and not running', () => {
    const { result } = renderHook(() => useRuntime())
    
    expect(result.current.outputs).toEqual([])
    expect(result.current.isRunning).toBe(false)
  })

  it('should run code and update running state', async () => {
    const { result } = renderHook(() => useRuntime())
    
    await act(async () => {
      await result.current.runCode('console.log("test")', 'javascript')
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.outputs).toHaveLength(1)
    expect(result.current.outputs[0]).toMatchObject({
      type: 'info',
      content: 'Running javascript code...',
    })
  })

  it('should clear outputs', async () => {
    const { result } = renderHook(() => useRuntime())
    
    await act(async () => {
      await result.current.runCode('console.log("test")', 'javascript')
    })
    
    expect(result.current.outputs).toHaveLength(1)
    
    act(() => {
      result.current.clearOutput()
    })
    
    expect(result.current.outputs).toEqual([])
  })

  it('should not run code if already running', async () => {
    const { result } = renderHook(() => useRuntime())
    
    await act(async () => {
      await result.current.runCode('console.log("test1")', 'javascript')
    })
    
    const outputCount = result.current.outputs.length
    
    await act(async () => {
      await result.current.runCode('console.log("test2")', 'javascript')
    })
    
    expect(result.current.outputs.length).toBe(outputCount)
  })
})
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock HTMLIFrameElement.sandbox
Object.defineProperty(HTMLIFrameElement.prototype, 'sandbox', {
  get() {
    return {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn(),
    }
  },
  configurable: true,
})

// Mock File API text() method
globalThis.File = class extends File {
  constructor(chunks: any[], name: string, options?: FilePropertyBag) {
    super(chunks, name, options)
  }
  
  async text() {
    return new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsText(this)
    })
  }
}

// Mock URL.createObjectURL and URL.revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
globalThis.URL.revokeObjectURL = vi.fn()

// Mock DragEvent
globalThis.DragEvent = class DragEvent extends Event {
  dataTransfer: any
  constructor(type: string, eventInit?: any) {
    super(type, eventInit)
    this.dataTransfer = eventInit?.dataTransfer || null
  }
} as any

// Mock DataTransfer
globalThis.DataTransfer = class DataTransfer {
  items: any
  files: FileList
  types: string[] = []
  
  constructor() {
    const filesArray: File[] = []
    const fileList = {
      length: 0,
      item: (index: number) => filesArray[index] || null,
      [Symbol.iterator]: function* () {
        for (const file of filesArray) {
          yield file
        }
      }
    }
    
    // Add numeric indices
    this.files = new Proxy(fileList, {
      get(target, prop) {
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          return filesArray[Number(prop)]
        }
        if (prop === 'length') {
          return filesArray.length
        }
        return target[prop as keyof typeof target]
      }
    }) as FileList
    
    this.items = {
      add: (file: File) => {
        filesArray.push(file)
      },
      get length() {
        return filesArray.length
      }
    }
  }
} as any
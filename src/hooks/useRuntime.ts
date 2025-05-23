import { useEffect, useRef, useState } from 'react'
import { SandboxRuntime, RuntimeMessage } from '../lib/runtime/sandbox'

interface RuntimeOutput {
  type: 'log' | 'error' | 'warn' | 'info' | 'debug' | 'result'
  content: string
  timestamp: number
}

export const useRuntime = () => {
  const [outputs, setOutputs] = useState<RuntimeOutput[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const sandboxRef = useRef<SandboxRuntime | null>(null)

  useEffect(() => {
    const sandbox = new SandboxRuntime()
    sandboxRef.current = sandbox

    sandbox.onMessage((message: RuntimeMessage) => {
      if (message.type === 'console') {
        const { method, args } = message.payload
        setOutputs((prev) => [
          ...prev,
          {
            type: method,
            content: args.map((arg: any) => JSON.stringify(arg, null, 2)).join(' '),
            timestamp: Date.now(),
          },
        ])
      } else if (message.type === 'error') {
        setOutputs((prev) => [
          ...prev,
          {
            type: 'error',
            content: `${message.payload.message}\n${message.payload.stack || ''}`,
            timestamp: Date.now(),
          },
        ])
      } else if (message.type === 'result') {
        setIsRunning(false)
        if (message.payload.success) {
          setOutputs((prev) => [
            ...prev,
            {
              type: 'result',
              content: 'Execution completed successfully',
              timestamp: Date.now(),
            },
          ])
        }
      }
    })

    return () => {
      sandbox.cleanup()
    }
  }, [])

  const runCode = async (code: string, language: string = 'javascript') => {
    if (!sandboxRef.current || isRunning) return

    setIsRunning(true)
    setOutputs([
      {
        type: 'info',
        content: `Running ${language} code...`,
        timestamp: Date.now(),
      },
    ])

    await sandboxRef.current.execute(code, language)
  }

  const clearOutput = () => {
    setOutputs([])
  }

  return {
    outputs,
    isRunning,
    runCode,
    clearOutput,
  }
}
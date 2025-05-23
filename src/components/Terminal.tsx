import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { useTheme } from '../contexts/ThemeContext'
import { useRuntime } from '../hooks/useRuntime'
import { useFileSystem } from '../contexts/FileSystemContext'

interface TerminalProps {
  onClose: () => void
  activeFileId?: string
}

const Terminal = ({ onClose, activeFileId }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const { isDarkMode } = useTheme()
  const { outputs, runCode } = useRuntime()
  const { files } = useFileSystem()
  const lastOutputIndexRef = useRef<number>(0)

  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new XTerm({
      theme: {
        background: isDarkMode ? '#1e1e1e' : '#ffffff',
        foreground: isDarkMode ? '#cccccc' : '#333333',
        cursor: isDarkMode ? '#ffffff' : '#333333',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)

    terminal.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    terminal.writeln('Welcome to PG Editor Terminal!')
    terminal.writeln('Type "help" for available commands.')
    terminal.write('\r\n$ ')

    let currentLine = ''

    const handleData = (data: string) => {
      if (data === '\r') {
        terminal.write('\r\n')
        processCommand(currentLine)
        currentLine = ''
        terminal.write('$ ')
      } else if (data === '\u007F') {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          terminal.write('\b \b')
        }
      } else if (data >= ' ') {
        currentLine += data
        terminal.write(data)
      }
    }

    const processCommand = (command: string) => {
      const trimmedCommand = command.trim()
      
      if (trimmedCommand === 'help') {
        terminal.writeln('Available commands:')
        terminal.writeln('  help     - Show this help message')
        terminal.writeln('  clear    - Clear the terminal')
        terminal.writeln('  run      - Run the current file')
        terminal.writeln('  echo     - Echo back the input')
        terminal.writeln('  date     - Show current date and time')
      } else if (trimmedCommand === 'clear') {
        terminal.clear()
      } else if (trimmedCommand.startsWith('echo ')) {
        terminal.writeln(trimmedCommand.substring(5))
      } else if (trimmedCommand === 'date') {
        terminal.writeln(new Date().toString())
      } else if (trimmedCommand === 'run') {
        if (activeFileId) {
          const file = files.find(f => f.id === activeFileId)
          if (file) {
            terminal.writeln(`Running ${file.name}...`)
            runCode(file.content, file.language)
          } else {
            terminal.writeln('No active file to run')
          }
        } else {
          terminal.writeln('No active file to run')
        }
      } else if (trimmedCommand !== '') {
        terminal.writeln(`Command not found: ${trimmedCommand}`)
      }
    }

    terminal.onData(handleData)

    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
    }
  }, [isDarkMode, activeFileId, files, runCode])

  useEffect(() => {
    if (!xtermRef.current) return

    // Get the last processed timestamp to avoid duplicates
    const lastTimestamp = lastOutputIndexRef.current

    // Filter outputs that are newer than the last processed timestamp
    const newOutputs = outputs.filter(output => output.timestamp > lastTimestamp)
    
    newOutputs.forEach((output) => {
      const terminal = xtermRef.current!
      const timestamp = new Date(output.timestamp).toLocaleTimeString()
      
      switch (output.type) {
        case 'error':
          terminal.writeln(`\x1b[31m[${timestamp}] ERROR: ${output.content}\x1b[0m`)
          break
        case 'warn':
          terminal.writeln(`\x1b[33m[${timestamp}] WARN: ${output.content}\x1b[0m`)
          break
        case 'info':
          terminal.writeln(`\x1b[36m[${timestamp}] INFO: ${output.content}\x1b[0m`)
          break
        case 'log':
          terminal.writeln(`[${timestamp}] ${output.content}`)
          break
        case 'result':
          terminal.writeln(`\x1b[32m[${timestamp}] ${output.content}\x1b[0m`)
          terminal.write('\r\n$ ')
          break
        default:
          terminal.writeln(`[${timestamp}] ${output.content}`)
      }
    })
    
    // Update the last processed timestamp
    if (newOutputs.length > 0) {
      lastOutputIndexRef.current = Math.max(...newOutputs.map(o => o.timestamp))
    }
  }, [outputs])

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      <div className="flex items-center justify-between px-4 py-2 bg-editor-sidebar border-b border-editor-border">
        <span className="text-sm font-medium">Terminal</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          title="Close Terminal"
        >
          ×
        </button>
      </div>
      <div ref={terminalRef} className="flex-1 p-2" />
    </div>
  )
}

export default Terminal
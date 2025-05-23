export interface RuntimeMessage {
  type: 'execute' | 'result' | 'error' | 'console'
  payload: any
}

export class SandboxRuntime {
  private iframe: HTMLIFrameElement | null = null
  private messageHandler: ((message: RuntimeMessage) => void) | null = null

  constructor() {
    this.setupMessageListener()
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.source === 'sandbox') {
        if (this.messageHandler) {
          this.messageHandler(event.data)
        }
      }
    })
  }

  public onMessage(handler: (message: RuntimeMessage) => void) {
    this.messageHandler = handler
  }

  public async execute(code: string, language: string = 'javascript') {
    this.cleanup()
    
    this.iframe = document.createElement('iframe')
    this.iframe.style.display = 'none'
    this.iframe.sandbox.add('allow-scripts')
    
    const html = this.generateSandboxHTML(code, language)
    const blob = new Blob([html], { type: 'text/html' })
    this.iframe.src = URL.createObjectURL(blob)
    
    document.body.appendChild(this.iframe)
  }

  private generateSandboxHTML(code: string, language: string): string {
    if (language === 'typescript') {
      code = this.transpileTypeScript(code)
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <script>
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug
          };

          const sendMessage = (type, payload) => {
            parent.postMessage({ source: 'sandbox', type, payload }, '*');
          };

          ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
            console[method] = (...args) => {
              originalConsole[method](...args);
              sendMessage('console', { method, args: args.map(arg => {
                try {
                  return JSON.parse(JSON.stringify(arg));
                } catch {
                  return String(arg);
                }
              })});
            };
          });

          window.addEventListener('error', (event) => {
            sendMessage('error', {
              message: event.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
              stack: event.error?.stack
            });
          });

          window.addEventListener('unhandledrejection', (event) => {
            sendMessage('error', {
              message: 'Unhandled Promise Rejection: ' + event.reason,
              stack: event.reason?.stack
            });
          });
        </script>
      </head>
      <body>
        <script type="module">
          try {
            ${code}
            sendMessage('result', { success: true });
          } catch (error) {
            sendMessage('error', {
              message: error.message,
              stack: error.stack
            });
          }
        </script>
      </body>
      </html>
    `
  }

  private transpileTypeScript(code: string): string {
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)/g
    
    code = code.replace(importRegex, (match, module) => {
      if (module.startsWith('.') || module.startsWith('/')) {
        return `// ${match} // Local imports not supported in sandbox`
      }
      return match
    })

    code = code.replace(exportRegex, (match) => {
      return match.replace('export ', '')
    })

    code = code.replace(/:\s*\w+(\[\])?/g, '')
    code = code.replace(/as\s+\w+/g, '')
    code = code.replace(/interface\s+\w+\s*{[^}]*}/g, '')
    code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '')

    return code
  }

  public cleanup() {
    if (this.iframe) {
      this.iframe.remove()
      this.iframe = null
    }
  }
}
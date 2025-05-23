# PG Editor - Browser-based IDE

A lightweight, browser-based IDE with offline support, built according to the specifications provided.

## Features

### Core Features (Implemented)
- **Monaco Editor Integration** - Full-featured code editor with syntax highlighting for JavaScript, TypeScript, HTML, CSS, Python, and more
- **File Management** - Virtual file system with IndexedDB persistence
- **Code Execution** - Sandboxed JavaScript/TypeScript execution
- **Terminal Integration** - Built-in terminal using xterm.js
- **Theme Support** - Light/Dark mode switching
- **PWA Support** - Works offline with Service Worker caching
- **Drag & Drop** - Drop files to open them in the editor
- **File System Access API** - Save files directly to your local file system

### UI/UX
- **Split Layout** - Resizable sidebar, editor area, and terminal
- **Tabbed Interface** - Multiple files open simultaneously
- **Status Bar** - Shows current editor status and quick actions
- **Responsive Design** - Works on screens 768px and wider

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Editor**: Monaco Editor 0.50+
- **Terminal**: xterm.js 5.x
- **Build Tool**: Vite with esbuild
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (via idb library)
- **PWA**: vite-plugin-pwa with Workbox

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
pg_editor/
├── src/
│   ├── components/       # React components
│   ├── contexts/        # React contexts (Theme, FileSystem, Settings)
│   ├── hooks/           # Custom React hooks
│   ├── lib/            # Utility libraries (runtime, file access)
│   ├── types/          # TypeScript type definitions
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── docs/              # Documentation
```

## Usage

1. **Creating Files**: Click "New File" in the sidebar or drag & drop files
2. **Editing**: Click on a file in the file tree to open it
3. **Running Code**: Type `run` in the terminal to execute the current file
4. **Saving Files**: Press `Ctrl/Cmd + S` to save (choose between browser storage or local file system)
5. **Theme Toggle**: Click the sun/moon icon in the status bar

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Security

- Code execution happens in sandboxed iframes
- No server-side execution
- All data stored locally in the browser

## License

MIT License

## Future Enhancements

- [ ] ESLint and Prettier WebWorker integration
- [ ] Python execution via Pyodide
- [ ] Git integration
- [ ] Plugin system
- [ ] Collaborative editing
- [ ] AI-powered code completion
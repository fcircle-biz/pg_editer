# PG Editor - Browser-based IDE

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
</p>

PG Editor is a lightweight IDE that runs in your browser without any installation. It features offline support, file management, and a code execution environment, enabling you to code anywhere.

## 🚀 Features

### Key Features
- **🖊️ Advanced Editor** - Powered by Monaco Editor (the same editor as VS Code)
- **📁 File Management** - Virtual file system for managing files and folders
- **▶️ Code Execution** - Run JavaScript/TypeScript in a sandboxed environment
- **💻 Integrated Terminal** - Built-in terminal using xterm.js
- **🎨 Theme Switching** - Dark/Light mode support
- **📱 PWA Support** - Works offline
- **📤 Drag & Drop** - Open files by dragging and dropping
- **💾 Local Save** - Save to local file system with File System Access API

### Supported Languages
- JavaScript / TypeScript
- HTML / CSS / SCSS
- JSON
- Markdown
- Python (display only)
- Syntax highlighting for many other languages

## 📦 Installation

### Prerequisites
- Node.js 18.0+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone git@github.com:fcircle-biz/pg_editer.git
cd pg_editer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## 🎯 Usage

### Basic Operations

#### Creating Files
1. Click the "New File" button in the sidebar
2. Enter a filename (e.g., `index.js`)

#### Running Code
1. Open a JavaScript or TypeScript file
2. Write your code
3. Run the `run` command in the terminal

#### Saving Files
- Press **Ctrl/Cmd + S** to save
- Save to local file system or browser storage

### Terminal Commands
```bash
help    # Show help
clear   # Clear terminal
run     # Run current file
echo    # Echo text
date    # Show current date/time
```

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Ctrl/Cmd + S | Save file |
| Ctrl/Cmd + P | Search files (in development) |
| Ctrl/Cmd + Shift + P | Command palette (in development) |

## 🏗️ Architecture

```
┌───────────────┐
│  UI Layer     │  React + TypeScript + Tailwind CSS
├───────────────┤
│  IDE Core     │  Monaco Editor
│               │  xterm.js (Terminal)
├───────────────┤
│  Runtime Hub  │  Web Workers / Sandboxed IFrame
├───────────────┤
│  Storage      │  IndexedDB / File System Access API
└───────────────┘
```

### Tech Stack
- **Frontend**: React 18, TypeScript 5
- **Editor**: Monaco Editor 0.50+
- **Terminal**: xterm.js 5.x
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Testing**: Vitest, Playwright
- **Storage**: IndexedDB (idb)

## 🧪 Development

### Scripts

```bash
# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Lint
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Project Structure

```
pg_editor/
├── src/
│   ├── components/      # UI components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities
│   ├── types/           # TypeScript type definitions
│   └── test/            # Test-related files
├── public/              # Static files
├── e2e/                 # E2E tests
└── docs/                # Documentation
```

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Coding Standards
- Follow ESLint and Prettier configurations
- Use TypeScript strict mode
- Write tests (target coverage: 80%+)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🚧 Roadmap

- [ ] Git integration
- [ ] Split view for multiple files
- [ ] Plugin system
- [ ] Python execution (Pyodide)
- [ ] Real-time collaboration
- [ ] AI-powered completion
- [ ] Support for more languages

## 🐛 Known Issues

- Performance degrades with large files (>5MB)
- File System Access API not available in Safari
- Limited mobile editing experience

## 📞 Support

For issues or questions, please use [Issues](https://github.com/fcircle-biz/pg_editer/issues).

## 🙏 Acknowledgments

This project uses the following open-source projects:

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [xterm.js](https://xtermjs.org/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

<p align="center">
  Made with ❤️ by the PG Editor Team
</p>
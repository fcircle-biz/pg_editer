# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PG Editor is a browser-based IDE built with React, TypeScript, and Monaco Editor. It features offline support via PWA, file management with IndexedDB, and JavaScript/TypeScript execution in sandboxed environments.

## Essential Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test         # Run all tests
npm run test -- src/components/FileTree.test.tsx  # Run specific test file
npm run test:coverage  # Run tests with coverage report
npm run test:e2e     # Run Playwright E2E tests

# Code Quality
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint checking
npm run format       # Prettier formatting
```

## Architecture Overview

### Core Components Structure

1. **Editor System**
   - `src/components/EditorArea.tsx` - Monaco Editor wrapper with file loading/saving
   - `src/components/EditorTabs.tsx` - Tab management for multiple files
   - Files communicate through shared state in `Layout.tsx`

2. **File System**
   - `src/contexts/FileSystemContext.tsx` - Virtual file system with IndexedDB persistence
   - `src/components/FileTree.tsx` - File tree UI with delete functionality
   - File entities have unique IDs, not paths, allowing for rename operations

3. **Code Execution**
   - `src/lib/runtime/sandbox.ts` - Sandboxed iframe execution for JS/TS
   - `src/hooks/useRuntime.ts` - Runtime management hook
   - TypeScript is transpiled client-side before execution
   - Console outputs are captured and forwarded to the terminal

4. **Terminal System**
   - `src/components/Terminal.tsx` - xterm.js integration
   - Tracks output timestamps to prevent duplicate display
   - Commands: `run`, `clear`, `help`, `echo`, `date`

### State Management

- **Theme**: `ThemeContext` - Dark/light mode toggle
- **Settings**: `SettingsContext` - Editor preferences (font size, tab size, etc.)
- **FileSystem**: `FileSystemContext` - File management and persistence
- No external state management library; uses React Context API

### Critical Implementation Details

1. **Console Output Deduplication**: Terminal uses timestamp tracking (`lastOutputIndexRef`) to prevent duplicate output display when runtime messages arrive.

2. **File Deletion**: When a file is deleted, associated tabs are automatically closed in `Sidebar.tsx`.

3. **Resizable Panels**: Custom resize handles in `Layout.tsx` for sidebar width and terminal height adjustment.

4. **File Drag & Drop**: Implemented in `App.tsx` using `useFileDrop` hook with visual feedback.

5. **PWA Configuration**: `vite.config.ts` sets `maximumFileSizeToCacheInBytes: 5MB` to handle large Monaco Editor chunks.

## Common Issues & Solutions

1. **TypeScript Errors with node modules**: Add `@types/node` to devDependencies and include `"types": ["node"]` in tsconfig.json.

2. **Console output duplication**: Check `Terminal.tsx` timestamp tracking logic if outputs appear multiple times.

3. **Large bundle warnings**: Monaco Editor creates >3MB chunks; this is expected and handled by PWA config.

## Testing Strategy

- Unit tests use Vitest with React Testing Library
- Monaco Editor is mocked in tests (`src/test/mocks/monaco-editor.ts`)
- E2E tests use Playwright for full user flow testing
- Current coverage: 73.65%

## Deployment

The app is designed for static hosting:
- Build outputs to `dist/`
- Includes Service Worker for offline functionality
- No server-side requirements
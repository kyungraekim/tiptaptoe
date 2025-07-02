# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Frontend Development:**
```bash
npm run dev          # Start Vite dev server (port 1420)
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview built application
```

**Tauri Development:**
```bash
npm run tauri dev    # Start Tauri development mode
npm run tauri build  # Build Tauri application
```

**TypeScript:**
- Uses strict mode with full linting enabled
- Configuration in `tsconfig.json` with ES2020 target
- No explicit lint/typecheck commands found - verify these before committing changes

## Architecture Overview

**TipTapToe** is a Tauri-based desktop application combining a React frontend with a Rust backend, featuring:

### Frontend Architecture (React + TypeScript + Vite)
- **Rich Text Editor**: Built with TipTap.js, offering comprehensive formatting options
- **AI Integration**: Two AI features:
  - PDF summarization via `GenerateButton`
  - Interactive chat assistant via text selection + chat bubble
- **Settings System**: Configurable AI provider settings stored locally
- **Modular Component Libraries**:
  - `@tiptaptoe/ui-components`: Reusable UI primitives and icons
  - `@tiptaptoe/tiptap-toolbar`: Complete TipTap toolbar component library
  - `@tiptaptoe/tiptap-editor`: Configurable TipTap editor with plugin system
- **Component Structure**:
  - `SimpleEditor`: Main TipTap editor with toolbar
  - `ChatBubble` + `ChatDialog`: AI chat interface
  - `GenerateButton`: PDF upload and AI summarization
  - `SettingsModal`: AI configuration interface

### Backend Architecture (Rust + Tauri)
- **AI Client** (`ai_client.rs`): OpenAI-compatible API client with error handling
- **PDF Processing** (`pdf_processor.rs`): PDF text extraction
- **Commands** (`commands.rs`): Tauri command handlers for frontend-backend communication
- **File Operations**: Document save/load functionality

### Key Integration Points
- Tauri commands bridge React frontend and Rust backend
- AI features support configurable providers (OpenAI-compatible APIs)
- Editor state synchronization between React and TipTap
- Settings persistence via Tauri's file system APIs

### Dependencies
- **Frontend**: TipTap extensions, React 18, marked (Markdown parsing)
- **Internal Libraries**: `@tiptaptoe/ui-components`, `@tiptaptoe/tiptap-toolbar`
- **Backend**: reqwest (HTTP), serde (JSON), Tauri plugins (dialog, opener)

## Important Implementation Details

### AI Features
- Both PDF summarization and chat use the same `OpenAIClient` with configurable base URLs
- Chat responses can be applied as "replace" or "append" actions in the editor
- AI settings are stored and migrated through `settingsStorage.ts`

### Editor Integration
- Editor ref is exposed for external content manipulation (AI responses)
- Content synchronization prevents infinite loops during external updates
- Chat bubble appears when text is selected in the editor

### Error Handling
- Comprehensive AI error handling with user-friendly messages
- Tauri command error propagation to frontend
- Connection testing capability for AI configuration validation

## Extracted Libraries

### @tiptaptoe/ui-components
Reusable UI primitives and utilities:
- **Components**: Button, Toolbar, Dropdown, Portal, Spacer
- **Icons**: 20+ SVG icons for editor functionality
- **Hooks**: useMobile, useWindowSize
- **Styling**: Complete CSS with dark mode support

### @tiptaptoe/tiptap-toolbar  
Complete TipTap toolbar component library:
- **Text Formatting**: MarkButton, ColorHighlightPopover
- **Block Elements**: HeadingDropdownMenu, BlockquoteButton, CodeBlockButton
- **Lists**: ListDropdownMenu (bullet, numbered, task lists)
- **Content**: ImageUploadButton, LinkPopover
- **Layout**: TextAlignButton
- **Actions**: UndoRedoButton
- **UI**: ThemeToggle
- **Hooks**: useCursorVisibility

Both libraries are built with TypeScript, include full type definitions, and maintain compatibility with the main Tauri application.
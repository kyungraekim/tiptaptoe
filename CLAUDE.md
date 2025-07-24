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

**Testing:**
```bash
npm test             # Run tests with vitest
npm run test:ui      # Run tests with UI interface
npm run test:coverage # Run tests with coverage report
```

**TypeScript:**
- Uses strict mode with full linting enabled
- Configuration in `tsconfig.json` with ES2020 target
- Uses vitest + @testing-library/react for component testing

## Architecture Overview

**TipTapToe** is a Tauri-based desktop application combining a React frontend with a Rust backend, featuring:

### Frontend Architecture (React + TypeScript + Vite)
- **Rich Text Editor**: Built with TipTap.js, offering comprehensive formatting options
- **AI Integration**: Three AI features:
  - PDF summarization via `GenerateButton`
  - Interactive chat assistant via text selection + chat bubble
  - Comment system with AI-powered analysis and threading
- **Settings System**: Configurable AI provider settings stored locally
- **Modular Component Libraries**:
  - `@tiptaptoe/ai-core`: Core AI functionality and LLM clients
  - `@tiptaptoe/ai-react`: React AI components and hooks
  - `@tiptaptoe/ui-components`: Reusable UI primitives and icons
  - `@tiptaptoe/tiptap-toolbar`: Complete TipTap toolbar component library
  - `@tiptaptoe/tiptap-editor`: Configurable TipTap editor with plugin system
  - `@tiptaptoe/extension-comments`: Transaction-based commenting system with threading
- **Component Structure**:
  - `AppEditor`: Main TipTap editor with toolbar integration
  - `ChatBubble` + `ChatDialog`: AI chat interface (from @tiptaptoe/ai-react)
  - `GenerateButton`: PDF upload and AI summarization (from @tiptaptoe/ai-react)
  - `SettingsModal`: AI configuration interface (from @tiptaptoe/ai-react)
  - `TransactionCommentManager`: Comment system with undo/redo support

### Backend Architecture (Rust + Tauri)
- **AI Commands** (`ai_commands.rs`): Tauri command handlers for AI operations
- **PDF Commands** (`pdf_commands.rs`): PDF processing command handlers
- **LLM Clients**: OpenAI and Claude client implementations in `llm/` directory
  - `llm/openai/`: OpenAI API client with models and services
  - `llm/claude/`: Claude API client with models and services
  - `llm/factory.rs`: Unified client factory for different AI providers
- **PDF Processing**: Text extraction and validation in `pdf/` directory
- **File Operations**: Document save/load functionality

### Key Integration Points
- Tauri commands bridge React frontend and Rust backend
- AI features support configurable providers (OpenAI-compatible APIs)
- Editor state synchronization between React and TipTap
- Settings persistence via Tauri's file system APIs

### Dependencies
- **Frontend**: TipTap extensions, React 18, marked (Markdown parsing)
- **Internal Libraries**: 
  - `@tiptaptoe/ai-core`: Core AI functionality and LLM clients
  - `@tiptaptoe/ai-react`: React AI components and hooks
  - `@tiptaptoe/ui-components`: Base UI components and icons
  - `@tiptaptoe/tiptap-toolbar`: TipTap toolbar components
  - `@tiptaptoe/tiptap-editor`: Configurable editor component
  - `@tiptaptoe/extension-comments`: Comment system extension
- **Backend**: reqwest (HTTP), serde (JSON), Tauri plugins (dialog, opener)

## Important Implementation Details

### AI Features
- AI functionality is centralized in `@tiptaptoe/ai-core` and `@tiptaptoe/ai-react` packages
- Support for multiple AI providers (OpenAI, Claude) through unified client interface
- PDF summarization and chat use configurable AI clients with provider-specific implementations
- Chat responses can be applied as "replace" or "append" actions in the editor
- AI settings are managed through `@tiptaptoe/ai-core` settings storage utilities
- Comment system integrates with AI workflows for document analysis and revision

### Comment System
- **Transaction-based Architecture**: Comments are stored in TipTap's transaction metadata for proper undo/redo support
- **Thread Management**: Comments are organized into threaded conversations with visual highlighting
- **Persistence Strategy**: LocalStorage backup ensures comment recovery after undo/redo operations
- **AI Integration**: Comments can be included in AI workflows via `getDocumentWithComments()` and `applyAIRevision()`
- **Visual Feedback**: Comment marks create visual indicators in the editor with thread-based highlighting
- **Synchronization**: Provider-based system keeps comments in sync across different UI components

### Editor Integration
- Editor ref is exposed for external content manipulation (AI responses)
- Content synchronization prevents infinite loops during external updates
- Chat bubble appears when text is selected in the editor

### Error Handling
- Comprehensive AI error handling with user-friendly messages
- Tauri command error propagation to frontend
- Connection testing capability for AI configuration validation

## Extracted Libraries

### @tiptaptoe/ai-core
Core AI functionality and LLM client implementations:
- **LLM Clients**: Unified OpenAI and Claude API clients with error handling
- **PDF Processing**: Text extraction and document analysis capabilities
- **Settings Management**: AI provider configuration and storage utilities
- **Client Factory**: Factory pattern for creating different AI provider clients
- **Type Definitions**: Comprehensive TypeScript types for AI operations

### @tiptaptoe/ai-react
React components and hooks for AI integration:
- **Chat Components**: ChatDialog, ChatBubble, ChatMessage, ChatMessages
- **Settings Components**: SettingsModal, BasicSettings, AdvancedSettings, ConnectionStatus
- **File Context**: FileContextProvider and PDF upload management
- **AI Hooks**: useAISettings, useChat for AI state management
- **Generate Button**: PDF summarization and AI content generation component
- **UI Components**: Alert, Button, Input, LoadingSpinner, Modal, Select, Textarea

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

### @tiptaptoe/tiptap-editor
Configurable TipTap editor with plugin system:
- **Editor Component**: TiptapEditor with customizable configuration
- **Toolbar Integration**: ConfigurableToolbar component
- **Configuration Hooks**: useEditorConfig for editor setup and management
- **Type Definitions**: Editor configuration and extension types

### @tiptaptoe/extension-comments
Transaction-based commenting system with comprehensive features:
- **Comment Management**: Create, update, delete, and resolve comments
- **Threading**: Group related comments into threaded conversations
- **Transaction Integration**: Comments are stored in TipTap's transaction system for undo/redo support
- **Visual Highlighting**: Comment marks with thread-based visual indicators
- **Persistence**: LocalStorage backup for comment recovery after undo/redo operations
- **AI Integration**: Comments can be analyzed and processed by AI workflows
- **Synchronization**: Provider-based system for real-time comment updates
- **Navigation**: Jump to comment positions, filter by status (active/resolved)
- **Classes**: `TransactionCommentManager` for all comment operations

All libraries are built with TypeScript, include full type definitions, and maintain compatibility with the main Tauri application.

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
gemini command:

### Examples:

**Single file analysis:**
```bash
gemini -p "@src/main.py Explain this file's purpose and structure"
```
Multiple files:
```bash
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"
```
Entire directory:
```bash
gemini -p "@src/ Summarize the architecture of this codebase"
```
Multiple directories:
```bash
gemini -p "@src/ @tests/ Analyze test coverage for the source code"
```
Current directory and subdirectories:
```bash
gemini -p "@./ Give me an overview of this entire project"
```
Or use --all_files flag:
```bash
gemini --all_files -p "Analyze the project structure and dependencies"
```
Implementation Verification Examples

Check if a feature is implemented:
```bash
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"
```
Verify authentication implementation:
```bash
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"
```
Check for specific patterns:
```bash
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"
```
Verify error handling:
```bash
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"
```
Check for rate limiting:
```bash
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"
```
Verify caching strategy:
```bash
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"
```
Check for specific security measures:
```bash
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"
```
Verify test coverage for features:
```bash
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"
```
When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results # Using Gemini CLI for Large Codebase Analysis

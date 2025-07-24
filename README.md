# TipTapToe

A modern desktop rich text editor built with Tauri, React, and TypeScript, featuring comprehensive AI integration and collaborative commenting capabilities.

## Features

- **Rich Text Editor**: Powered by TipTap.js with full formatting support
- **AI Integration**: PDF summarization, interactive chat, and AI-powered comment analysis
- **Comment System**: Transaction-based commenting with threading and visual highlighting
- **Cross-Platform**: Desktop application for Windows, macOS, and Linux
- **Modular Architecture**: Six specialized component libraries for maximum reusability

## Architecture

### Frontend (React + TypeScript + Vite)
- **Editor Core**: TipTap.js-based rich text editor with custom extensions
- **AI Features**: OpenAI-compatible API integration for multiple AI providers
- **Comment System**: Transaction-based commenting with undo/redo support
- **Settings Management**: Configurable AI provider settings with persistence
- **Theme Support**: Dark/light mode with CSS-in-JS styling

### Backend (Rust + Tauri)
- **AI Client**: HTTP client for OpenAI-compatible APIs with error handling
- **PDF Processing**: Text extraction and analysis capabilities
- **File Operations**: Document save/load functionality
- **Tauri Commands**: Bridge between frontend and backend operations

## Project Structure

```
tiptaptoe/
├── src/                          # Frontend React application
│   ├── components/               # Main UI components
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions and managers
│   └── styles/                  # CSS styles and themes
├── src-tauri/                   # Rust backend
│   ├── src/commands/            # Tauri command handlers
│   ├── src/llm/                 # AI client implementations (OpenAI, Claude)
│   └── src/pdf/                 # PDF processing modules
└── packages/                    # Modular component libraries
    └── @tiptaptoe/
        ├── ai-core/             # Core AI functionality and LLM clients
        ├── ai-react/            # React AI components and hooks
        ├── ui-components/       # Base UI components and icons
        ├── tiptap-toolbar/      # TipTap toolbar components
        ├── tiptap-editor/       # Configurable editor component
        └── extension-comments/  # Comment system extension
```

## Component Libraries

### @tiptaptoe/ai-core
Core AI functionality and LLM client implementations:
- **LLM Clients**: OpenAI and Claude API clients with unified interface
- **PDF Processing**: Text extraction and document analysis
- **Settings Management**: AI provider configuration and storage
- **Error Handling**: Comprehensive error management for AI operations
- **Factory Pattern**: Unified client creation for different AI providers

### @tiptaptoe/ai-react
React components and hooks for AI integration:
- **Chat Components**: ChatDialog, ChatBubble, ChatMessage components
- **Settings UI**: AI configuration modal and connection testing
- **File Context**: PDF upload and document context management
- **Hooks**: useAISettings, useChat for AI state management
- **Generate Button**: PDF summarization and AI content generation

### @tiptaptoe/ui-components
Base UI primitives and utilities:
- **Components**: Button, Toolbar, Dropdown, Portal, Spacer
- **Icons**: 20+ SVG icons for editor functionality
- **Hooks**: useMobile, useWindowSize
- **Styling**: Complete CSS with dark mode support

### @tiptaptoe/tiptap-toolbar
Complete TipTap toolbar component library:
- **Text Formatting**: Bold, italic, underline, color highlighting
- **Block Elements**: Headings, blockquotes, code blocks
- **Lists**: Bullet, numbered, and task lists
- **Content**: Image upload, link management
- **Layout**: Text alignment controls
- **Actions**: Undo/redo functionality

### @tiptaptoe/tiptap-editor
Configurable TipTap editor with plugin system:
- **Editor Core**: Customizable TipTap editor instance
- **Configuration**: Flexible editor setup with extension management
- **Hooks**: Editor configuration and state management

### @tiptaptoe/extension-comments
Transaction-based commenting system:
- **Comment Management**: Create, update, delete, and resolve comments
- **Threading**: Grouped comment conversations
- **Transaction Integration**: Undo/redo support via TipTap transactions
- **Visual Highlighting**: Comment marks with thread indicators
- **AI Integration**: Comments included in AI workflows
- **Persistence**: LocalStorage backup for comment recovery

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- Rust (latest stable)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tiptaptoe
```

2. Install root dependencies:
```bash
npm install
```

3. Install package dependencies:
```bash
# Install dependencies for all packages
cd packages/@tiptaptoe/ai-core && npm install && cd ../../../
cd packages/@tiptaptoe/ai-react && npm install && cd ../../../
cd packages/@tiptaptoe/ui-components && npm install && cd ../../../
cd packages/@tiptaptoe/tiptap-toolbar && npm install && cd ../../../
cd packages/@tiptaptoe/tiptap-editor && npm install && cd ../../../
cd packages/@tiptaptoe/extension-comments && npm install && cd ../../../
```

4. Build packages (required before running the main application):
```bash
# Build all packages in dependency order
cd packages/@tiptaptoe/ui-components && npm run build && cd ../../../
cd packages/@tiptaptoe/tiptap-toolbar && npm run build && cd ../../../
cd packages/@tiptaptoe/tiptap-editor && npm run build && cd ../../../
cd packages/@tiptaptoe/extension-comments && npm run build && cd ../../../
cd packages/@tiptaptoe/ai-core && npm run build && cd ../../../
cd packages/@tiptaptoe/ai-react && npm run build && cd ../../../
```

5. Install Tauri CLI (if not already installed):
```bash
npm install --save-dev @tauri-apps/cli
```

### Development Commands

**Package Development:**
```bash
# Watch mode for package development (run in package directory)
npm run dev          # Build package in watch mode

# Build packages (run in package directory)
npm run build        # Build package for distribution
```

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

## Testing

The project uses a comprehensive testing setup:

- **Framework**: Vitest + @testing-library/react
- **Environment**: jsdom for DOM simulation
- **Coverage**: Built-in coverage reporting
- **Integration Tests**: Comment system integration tests
- **Unit Tests**: Individual component and utility tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```
src/
├── components/__tests__/        # Component tests
├── utils/__tests__/            # Utility function tests
└── test-setup.ts              # Test configuration

packages/@tiptaptoe/extension-comments/
└── src/__tests__/             # Extension-specific tests
```

## AI Integration

The application supports multiple AI providers through a unified OpenAI-compatible interface:

### Supported Features
- **PDF Summarization**: Upload and analyze PDF documents
- **Interactive Chat**: Context-aware conversations
- **Comment Analysis**: AI-powered comment processing

### Configuration
AI settings are managed through the Settings modal with support for:
- Custom API endpoints
- API key management
- Provider-specific configurations
- Connection testing

## Comment System

The comment system provides collaborative editing capabilities:

### Key Features
- **Transaction-based**: Comments integrate with TipTap's undo/redo system
- **Visual Highlighting**: Selected text is highlighted with comment indicators
- **Threading**: Comments can be grouped into conversation threads
- **Persistence**: Comments survive undo/redo operations via LocalStorage backup
- **AI Integration**: Comments can be included in AI analysis workflows

### Usage
1. Select text in the editor
2. Click the comment button that appears
3. Add your comment content
4. Comments appear as highlights with thread indicators
5. Click highlights to view/edit comment threads

## Building for Production

### Frontend Build
```bash
npm run build
```

### Tauri Application Build
```bash
npm run tauri build
```

The built application will be available in `src-tauri/target/release/bundle/`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Technical Details

### TypeScript Configuration
- Strict mode enabled
- ES2020 target
- Full type checking with comprehensive linting

### Build System
- Vite for frontend bundling
- Tauri for cross-platform desktop packaging
- TypeScript compilation with full type checking

### Dependencies
- **Frontend**: React 18, TipTap extensions, marked (Markdown), @tiptaptoe packages
- **Backend**: reqwest (HTTP), serde (JSON), Tauri plugins (dialog, opener)
- **AI Integration**: OpenAI/Claude APIs via @tiptaptoe/ai-core and @tiptaptoe/ai-react
- **Development**: Vitest, @testing-library/react, TypeScript, Vite

For more detailed technical information, see [CLAUDE.md](./CLAUDE.md).
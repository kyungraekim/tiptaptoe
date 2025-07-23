# @tiptaptoe/ai-core

Core AI functionality and LLM client for TipTapToe applications.

## Features

- **Multi-Provider LLM Client**: Support for OpenAI, Claude, Together AI, DeepSeek, and local LLMs
- **PDF Processing**: PDF analysis, text extraction, and AI summarization
- **Settings Management**: Configuration storage, validation, and migration
- **Connection Testing**: Validate AI provider connections
- **TypeScript Support**: Full type safety and IntelliSense

## Installation

```bash
npm install @tiptaptoe/ai-core
```

## Usage

### LLM Client

```typescript
import { createLLMClient, LLMClientOptions } from '@tiptaptoe/ai-core';

const options: LLMClientOptions = {
  apiKey: 'your-api-key',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  maxTokens: 500,
  temperature: 0.7,
  timeout: 120
};

const client = createLLMClient(options);

// Test connection
const testResult = await client.testConnection();

// Chat with AI
const response = await client.chat('Hello, how are you?');

// Summarize PDF
const summary = await client.summarizePdf('/path/to/file.pdf', 'Summarize this document');
```

### PDF Processing

```typescript
import { PDFClient } from '@tiptaptoe/ai-core';

const pdfClient = new PDFClient();

// Analyze PDF
const analysis = await pdfClient.analyzePdf('/path/to/file.pdf');

// Extract text
const textResult = await pdfClient.extractText('/path/to/file.pdf');
```

### Settings Management

```typescript
import { 
  loadAISettings, 
  saveAISettings, 
  validateAISettings,
  testAIConnection,
  DEFAULT_AI_SETTINGS 
} from '@tiptaptoe/ai-core';

// Load settings
const settings = loadAISettings();

// Validate settings
const validation = validateAISettings(settings);

// Test connection
const connectionTest = await testAIConnection(settings);

// Save settings
saveAISettings(settings);
```

## Supported AI Providers

- **OpenAI**: `https://api.openai.com/v1`
- **Anthropic Claude**: `https://api.anthropic.com/v1`
- **Together AI**: `https://api.together.xyz/v1`
- **DeepSeek**: `https://api.deepseek.com/v1`
- **Local LM Studio**: `http://localhost:1234/v1`
- **Local Ollama**: `http://localhost:11434/v1`

## Requirements

- Tauri application environment
- `@tauri-apps/api` peer dependency

## License

MIT
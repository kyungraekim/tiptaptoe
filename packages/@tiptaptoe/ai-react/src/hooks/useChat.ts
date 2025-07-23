import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { marked } from 'marked';
import { 
  loadAISettings, 
  validateAISettings,
  ChatMessage, 
  FileContext 
} from '@tiptaptoe/ai-core';

export interface UseChatProps {
  selectedText: string;
  onApplyResponse?: (response: string, action: 'append' | 'replace') => void;
  initialFiles?: FileContext[];
}

export const useChat = ({ selectedText, onApplyResponse, initialFiles = [] }: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<FileContext[]>(initialFiles);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set(
    // Auto-select PDF files that have summaries (from Generate button)
    initialFiles.filter(f => f.type === 'pdf' && f.summary).map(f => f.id)
  ));
  const [usedFiles, setUsedFiles] = useState<Set<string>>(new Set());

  // Update available files and auto-select new PDF files when initialFiles changes
  useEffect(() => {
    setAvailableFiles(initialFiles);
    
    // Auto-select new PDF files that have summaries
    const newPdfFiles = initialFiles.filter(f => f.type === 'pdf' && f.summary);
    if (newPdfFiles.length > 0) {
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newPdfFiles.forEach(file => {
          if (!usedFiles.has(file.id)) {
            newSet.add(file.id);
          }
        });
        return newSet;
      });
    }
  }, [initialFiles, usedFiles]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedText) {
      setMessages([
        {
          id: Date.now().toString(),
          role: 'user',
          content: `I selected this text: "${selectedText}"\n\nHow can you help me with it?`,
          timestamp: new Date()
        }
      ]);
      setError(null);
    }
  }, [selectedText]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (message?: string) => {
    const messageToSend = message || inputValue;
    if (!messageToSend.trim() || isLoading) return;

    const settings = loadAISettings();
    const validation = validateAISettings(settings);

    if (!validation.isValid) {
      setError(`Please configure AI settings first:\n${validation.errors.join('\n')}`);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Build file context string
      const selectedFileContexts = availableFiles.filter(f => selectedFiles.has(f.id));
      const fileContextString = selectedFileContexts.length > 0 
        ? `\n\nFile Context:\n${selectedFileContexts.map(f => 
            `File: ${f.name} (${f.type})\n${f.extractedContent || f.summary || 'No content available'}`
          ).join('\n\n')}`
        : '';

      const conversationContext = `
Selected text: "${selectedText}"${fileContextString}

Previous conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userMessage.content}

Please respond helpfully about the selected text and any provided file context. Keep responses focused and actionable.`;

      // Mark selected files as used
      if (selectedFileContexts.length > 0) {
        setUsedFiles(prev => new Set([...prev, ...selectedFileContexts.map(f => f.id)]));
        setSelectedFiles(new Set()); // Clear selection after use
      }

      const response = await invoke<any>('process_ai_chat', {
        chatRequest: {
          prompt: conversationContext,
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl,
          model: settings.model,
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
          timeout: settings.timeout
        }
      });

      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: typeof response.response === 'object' && response.response !== null
            ? response.response.output
            : response.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const applyResponse = async (message: ChatMessage, action: 'append' | 'replace') => {
    if (!onApplyResponse) return;
    
    // Parse Markdown to HTML before applying
    const parsedContent = await marked.parse(message.content);
    onApplyResponse(parsedContent, action);
  };

  const clearChat = () => {
    setMessages([]);
    setInputValue('');
    setError(null);
    setUsedFiles(new Set());
    setSelectedFiles(new Set());
  };

  const handleFileToggle = (fileId: string, isSelected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  };

  return {
    messages,
    inputValue,
    isLoading,
    error,
    messagesEndRef,
    availableFiles,
    selectedFiles,
    usedFiles,
    setInputValue,
    sendMessage,
    applyResponse,
    clearChat,
    setAvailableFiles,
    handleFileToggle,
  };
};
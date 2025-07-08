// src/hooks/useChat.ts
import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { marked } from 'marked';
import { loadAISettings, validateAISettings } from '../utils/settingsStorage';
import { ChatMessage } from '../types/ai';

export interface UseChatProps {
  selectedText: string;
  onApplyResponse?: (response: string, action: 'append' | 'replace') => void;
}

export const useChat = ({ selectedText, onApplyResponse }: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const conversationContext = `
Selected text: "${selectedText}"

Previous conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userMessage.content}

Please respond helpfully about the selected text. Keep responses focused and actionable.`;

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
  };

  return {
    messages,
    inputValue,
    isLoading,
    error,
    messagesEndRef,
    setInputValue,
    sendMessage,
    applyResponse,
    clearChat,
  };
};
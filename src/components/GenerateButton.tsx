// src/components/GenerateButton.tsx
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { PdfSummarizationResponse, ProcessingStatus } from '../types/ai';
import { loadAISettings, validateAISettings } from '../utils/settingsStorage';

interface GenerateButtonProps {
  onSummaryGenerated: (summary: string) => void;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ onSummaryGenerated }) => {
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    message: ''
  });

  const handleGenerate = async () => {
    console.log("Generate button clicked");
    
    try {
      // Step 1: Load and validate AI settings
      const settings = loadAISettings();
      const validation = validateAISettings(settings);
      
      if (!validation.isValid) {
        const errorMsg = `Please configure AI settings first:\n${validation.errors.join('\n')}`;
        alert(errorMsg);
        return;
      }

      // Step 2: Select PDF file
      console.log("Opening file dialog...");
      const selectedFile = await open({
        multiple: false,
        filters: [{
          name: 'PDF Files',
          extensions: ['pdf']
        }]
      });

      if (!selectedFile) {
        console.log("User cancelled file selection");
        return; // User cancelled
      }

      console.log("File selected:", selectedFile);

      setStatus({
        isProcessing: true,
        progress: 25,
        message: 'Processing PDF file...'
      });

      console.log("Using AI settings:", {
        baseUrl: settings.baseUrl,
        model: settings.model,
        hasApiKey: !!settings.apiKey,
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
        timeout: settings.timeout
      });

      setStatus({
        isProcessing: true,
        progress: 50,
        message: 'Generating summary'
      });

      // Step 3: Call Tauri command with configured settings
      console.log("Calling Tauri command with configured settings");

      const response = await invoke<PdfSummarizationResponse>('process_pdf_summarization', {
        filePath: selectedFile,
        prompt: settings.prompt,
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        model: settings.model,
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
        timeout: settings.timeout
      });

      console.log("Received response from Tauri:", response);

      setStatus({
        isProcessing: true,
        progress: 100,
        message: 'Summary generated successfully!'
      });

      if (response.success) {
        console.log("Summary generated successfully:", response.summary);
        console.log("Calling onSummaryGenerated callback...");
        onSummaryGenerated(response.summary);
        console.log("Callback completed");
      } else {
        console.error("Summary generation failed:", response.error);
        throw new Error(response.error || 'Failed to generate summary');
      }

    } catch (error) {
      console.error('PDF summarization failed:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      setStatus({
        isProcessing: false,
        progress: 0,
        message: 'Failed to generate summary'
      });
      
      // Better error messages for users
      let userMessage = 'Failed to generate summary';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          userMessage = 'Invalid API key. Please check your AI settings.';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          userMessage = 'Network error. Please check your internet connection and AI service URL.';
        } else if (error.message.includes('model')) {
          userMessage = 'Invalid model selected. Please check your AI settings.';
        } else {
          userMessage = `Error: ${error.message}`;
        }
      }
      
      alert(userMessage);
    } finally {
      // Reset status after a short delay
      setTimeout(() => {
        console.log("Resetting status");
        setStatus({
          isProcessing: false,
          progress: 0,
          message: ''
        });
      }, 2000);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={handleGenerate}
        disabled={status.isProcessing}
        style={{
          padding: "8px 16px",
          backgroundColor: status.isProcessing ? "#94a3b8" : "#10b981",
          color: "white",
          border: "1px solid transparent",
          borderRadius: "6px",
          cursor: status.isProcessing ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "500",
          minWidth: "80px"
        }}
      >
        {status.isProcessing ? 'Processing...' : 'Generate'}
      </button>
      
      {/* Progress indicator */}
      {status.isProcessing && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          marginTop: '4px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          {status.message} ({status.progress}%)
        </div>
      )}
    </div>
  );
};

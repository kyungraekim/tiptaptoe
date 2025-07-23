import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { 
  PdfSummarizationResponse, 
  ProcessingStatus, 
  FileContext,
  loadAISettings,
  validateAISettings 
} from '@tiptaptoe/ai-core';
import { useFileContext } from '../contexts/FileContextProvider';
import { Button } from '../ui';

interface GenerateButtonProps {
  onSummaryGenerated: (summary: string) => void;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ onSummaryGenerated }) => {
  const { addFile } = useFileContext();
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
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
        message: 'Summary generated successfully!'
      });

      if (response.success) {
        console.log("Summary generated successfully:", response.summary);
        console.log("Calling onSummaryGenerated callback...");
        onSummaryGenerated(response.summary);
        console.log("Callback completed");

        // Add the PDF file to the global context for chat use
        const fileName = typeof selectedFile === 'string' 
          ? selectedFile.split('/').pop() || selectedFile
          : 'Unknown PDF';
        
        // Try to extract full text for better context
        let extractedContent = '';
        try {
          const textResponse = await invoke<{ success: boolean; content?: string; error?: string }>('extract_pdf_text', {
            filePath: selectedFile
          });
          
          if (textResponse.success && textResponse.content) {
            extractedContent = textResponse.content;
          }
        } catch (error) {
          console.error('Failed to extract PDF text for context:', error);
        }
        
        const fileContext: FileContext = {
          id: Date.now().toString(),
          name: fileName,
          path: typeof selectedFile === 'string' ? selectedFile : '',
          type: 'pdf',
          summary: response.summary,
          extractedContent: extractedContent || response.summary, // Fallback to summary if text extraction fails
          addedAt: new Date()
        };

        addFile(fileContext);
        console.log("PDF file added to global context for chat use");
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
          message: ''
        });
      }, 2000);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Button
        variant="success"
        onClick={handleGenerate}
        disabled={status.isProcessing}
        isLoading={status.isProcessing}
        style={{ minWidth: '80px' }}
      >
        {status.isProcessing ? 'Processing...' : 'Generate'}
      </Button>
      
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
          {status.message}
        </div>
      )}
    </div>
  );
};
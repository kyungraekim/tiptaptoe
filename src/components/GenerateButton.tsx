import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { PdfSummarizationResponse, ProcessingStatus } from '../types/ai';

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
    try {
      // Step 1: Select PDF file
      const selectedFile = await open({
        multiple: false,
        filters: [{
          name: 'PDF Files',
          extensions: ['pdf']
        }]
      });

      if (!selectedFile) {
        return; // User cancelled
      }

      setStatus({
        isProcessing: true,
        progress: 25,
        message: 'Processing PDF file...'
      });

      // Step 2: Get API configuration (for now, using hardcoded values)
      const apiKey = localStorage.getItem('openai_api_key') || 'your-api-key-here';
      const prompt = "Please provide a concise summary of this PDF document, highlighting the main points and key insights.";

      setStatus({
        isProcessing: true,
        progress: 50,
        message: 'Generating summary with AI...'
      });

      // Step 3: Call Tauri command
      const response = await invoke<PdfSummarizationResponse>('process_pdf_summarization', {
        filePath: selectedFile,
        prompt,
        apiKey,
        baseUrl: 'https://api.openai.com/v1'
      });

      setStatus({
        isProcessing: true,
        progress: 100,
        message: 'Summary generated successfully!'
      });

      if (response.success) {
        onSummaryGenerated(response.summary);
      } else {
        throw new Error(response.error || 'Failed to generate summary');
      }

    } catch (error) {
      console.error('PDF summarization failed:', error);
      alert(`Failed to generate summary: ${error}`);
    } finally {
      // Reset status after a short delay
      setTimeout(() => {
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
        {status.isProcessing ? "Processing..." : "Generate"}
      </button>
      
      {status.isProcessing && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <div style={{ marginBottom: '4px' }}>{status.message}</div>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${status.progress}%`,
              height: '100%',
              backgroundColor: '#10b981',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}
    </div>
  );
};
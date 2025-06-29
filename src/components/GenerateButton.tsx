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
    console.log("Generate button clicked");
    
    try {
      // Step 1: Select PDF file
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

      // Step 2: Get API configuration (for now, using hardcoded values)
      const apiKey = localStorage.getItem('openai_api_key') || 'your-api-key-here';
      const prompt = "Please provide a concise summary of this PDF document, highlighting the main points and key insights.";

      console.log("API Key exists:", !!apiKey && apiKey !== 'your-api-key-here');
      console.log("Using prompt:", prompt);

      setStatus({
        isProcessing: true,
        progress: 50,
        message: 'Generating summary with AI...'
      });

      // Step 3: Call Tauri command
      console.log("Calling Tauri command with params:", {
        filePath: selectedFile,
        prompt: prompt.substring(0, 50) + "...",
        baseUrl: 'https://api.openai.com/v1'
      });

      const response = await invoke<PdfSummarizationResponse>('process_pdf_summarization', {
        filePath: selectedFile,
        prompt,
        apiKey,
        baseUrl: 'https://api.openai.com/v1'
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
      
      alert(`Failed to generate summary: ${error}`);
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
        {status.isProcessing ? "Processing..." : "Generate"}
      </button>
      
      {status.isProcessing && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: "8px",
          padding: "8px",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#374151",
          zIndex: 1000,
          minWidth: "200px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ marginBottom: "6px", fontWeight: "500" }}>
            {status.message}
          </div>
          <div style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e5e7eb",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${status.progress}%`,
              height: "100%",
              backgroundColor: "#10b981",
              borderRadius: "4px",
              transition: "width 0.3s ease"
            }}></div>
          </div>
          <div style={{ 
            marginTop: "4px", 
            fontSize: "11px", 
            color: "#6b7280",
            textAlign: "right"
          }}>
            {status.progress}%
          </div>
        </div>
      )}
    </div>
  );
};
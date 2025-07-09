import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@tiptaptoe/ui-components';
import { Comment } from '../types/comments';
import { loadAISettings, validateAISettings } from '../utils/settingsStorage';

interface MagicWandButtonProps {
  documentContent: string;
  comments: Comment[];
  onRevisionGenerated: (revisedContent: string) => void;
}

interface ProcessingStatus {
  isProcessing: boolean;
  message: string;
}

export const MagicWandButton: React.FC<MagicWandButtonProps> = ({
  documentContent,
  comments,
  onRevisionGenerated,
}) => {
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    message: ''
  });

  const activeComments = comments.filter(c => !c.resolved);

  const handleRevision = async () => {
    if (activeComments.length === 0) {
      alert('No active comments to incorporate. Add some comments first!');
      return;
    }

    console.log('Magic wand clicked - starting AI revision');
    
    try {
      // Step 1: Load and validate AI settings
      const settings = loadAISettings();
      const validation = validateAISettings(settings);
      
      if (!validation.isValid) {
        const errorMsg = `Please configure AI settings first:\n${validation.errors.join('\n')}`;
        alert(errorMsg);
        return;
      }

      setStatus({
        isProcessing: true,
        message: 'Analyzing document and comments...'
      });

      // Step 2: Prepare the revision request
      const commentSummary = activeComments.map(comment => 
        `Comment on "${comment.selectedText}": ${comment.content}`
      ).join('\n');

      const revisionPrompt = `Please revise the following document by incorporating the feedback from the comments. 
      
Maintain the original structure and style while addressing each comment appropriately. 
Return only the revised HTML content without any additional explanation.

DOCUMENT:
${documentContent}

COMMENTS TO INCORPORATE:
${commentSummary}

REVISED DOCUMENT:`;

      setStatus({
        isProcessing: true,
        message: 'Generating AI revision...'
      });

      console.log('Calling AI revision with prompt:', revisionPrompt.substring(0, 200) + '...');

      // Step 3: Call AI service through Tauri
      const response = await invoke<any>('process_ai_chat', {
        chatRequest: {
          prompt: revisionPrompt,
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl,
          model: settings.model,
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
          timeout: settings.timeout
        }
      });

      console.log('Received AI revision response:', response);

      if (response.success) {
        const revisedContent = typeof response.response === 'object' && response.response !== null
          ? response.response.output
          : response.response;
        
        setStatus({
          isProcessing: true,
          message: 'Revision generated successfully!'
        });

        console.log('AI revision successful, applying to document');
        onRevisionGenerated(revisedContent);
      } else {
        throw new Error(response.error || 'Failed to generate revision');
      }

    } catch (error) {
      console.error('AI revision failed:', error);
      
      setStatus({
        isProcessing: false,
        message: 'Failed to generate revision'
      });
      
      // Better error messages for users
      let userMessage = 'Failed to generate AI revision';
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
        data-style="default"
        onClick={handleRevision}
        disabled={status.isProcessing || activeComments.length === 0}
        style={{ 
          minWidth: '120px',
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span style={{ fontSize: '16px' }}>✨</span>
        {status.isProcessing ? 'Processing...' : 'AI Revision'}
      </Button>
      
      {/* Status indicator */}
      {status.message && (
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
      
      {/* Comment count indicator */}
      {activeComments.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#ef4444',
          color: 'white',
          fontSize: '10px',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {activeComments.length}
        </div>
      )}
    </div>
  );
};
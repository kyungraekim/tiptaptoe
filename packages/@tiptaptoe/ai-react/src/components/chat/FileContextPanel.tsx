import React, { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { FileContext } from '@tiptaptoe/ai-core';
import { Button } from '../../ui';

interface FileContextPanelProps {
  availableFiles: FileContext[];
  usedFiles: Set<string>;
  onFilesChange: (files: FileContext[]) => void;
  onFileToggle: (fileId: string, isSelected: boolean) => void;
  selectedFiles: Set<string>;
}

export const FileContextPanel: React.FC<FileContextPanelProps> = ({
  availableFiles,
  usedFiles,
  onFilesChange,
  onFileToggle,
  selectedFiles
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddFile = async () => {
    setIsProcessing(true);
    try {
      const selectedFile = await open({
        multiple: false,
        filters: [
          {
            name: 'Supported Files',
            extensions: ['pdf', 'txt', 'md']
          }
        ]
      });

      if (selectedFile) {
        const extension = selectedFile.split('.').pop()?.toLowerCase();
        const fileName = selectedFile.split('/').pop() || selectedFile;
        
        let fileContext: FileContext = {
          id: Date.now().toString(),
          name: fileName,
          path: selectedFile,
          type: extension === 'pdf' ? 'pdf' : extension === 'md' ? 'markdown' : 'text',
          addedAt: new Date()
        };

        // If it's a PDF, extract text content
        if (extension === 'pdf') {
          try {
            const response = await invoke<{ success: boolean; content?: string; error?: string }>('extract_pdf_text', {
              filePath: selectedFile
            });
            
            if (response.success && response.content) {
              fileContext.extractedContent = response.content;
            }
          } catch (error) {
            console.error('Failed to extract PDF text:', error);
          }
        }

        onFilesChange([...availableFiles, fileContext]);
      }
    } catch (error) {
      console.error('Failed to add file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    onFilesChange(availableFiles.filter(f => f.id !== fileId));
  };


  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'markdown':
        return '📝';
      case 'text':
        return '📄';
      default:
        return '📄';
    }
  };

  if (availableFiles.length === 0) {
    return (
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Button
          data-style="default"
          data-size="sm"
          onClick={handleAddFile}
          disabled={isProcessing}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: '1px solid #3b82f6'
          }}
        >
          {isProcessing ? 'Adding...' : '+ Add File Context'}
        </Button>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          Add files to provide additional context for your conversation
        </span>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            File Context ({availableFiles.length})
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: selectedFiles.size > 0 ? '#10b981' : '#6b7280',
            fontWeight: selectedFiles.size > 0 ? '500' : 'normal'
          }}>
            {selectedFiles.size > 0 ? `${selectedFiles.size} selected` : 'None selected'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            data-style="default"
            data-size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddFile();
            }}
            disabled={isProcessing}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: '1px solid #3b82f6'
            }}
          >
            {isProcessing ? 'Adding...' : '+ Add'}
          </Button>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          paddingBottom: '8px'
        }}>
          {availableFiles.map(file => {
            const isUsed = usedFiles.has(file.id);
            const isSelected = selectedFiles.has(file.id);
            
            return (
              <div
                key={file.id}
                style={{
                  padding: '8px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                  borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onFileToggle(file.id, e.target.checked)}
                  disabled={isUsed}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: isUsed ? 'not-allowed' : 'pointer'
                  }}
                />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isUsed ? '#9ca3af' : '#111827'
                  }}>
                    <span>{getFileIcon(file.type)}</span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {file.name}
                    </span>
                    {isUsed && (
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: 'normal'
                      }}>
                        (already used)
                      </span>
                    )}
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '2px'
                  }}>
                    {file.type.toUpperCase()}
                    {file.size && ` • ${file.size}`}
                    {file.summary && ` • ${file.summary.substring(0, 60)}...`}
                    {file.type === 'pdf' && file.summary && isSelected && (
                      <span style={{ 
                        color: '#10b981', 
                        fontWeight: '500',
                        marginLeft: '8px'
                      }}>
                        • Auto-selected
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFile(file.id)}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '12px'
                  }}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
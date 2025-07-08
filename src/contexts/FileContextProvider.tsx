import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileContext } from '../types/ai';

interface FileContextProviderState {
  availableFiles: FileContext[];
  addFile: (file: FileContext) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  getFileById: (fileId: string) => FileContext | undefined;
}

const FileContextContext = createContext<FileContextProviderState | undefined>(undefined);

export const useFileContext = () => {
  const context = useContext(FileContextContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileContextProvider');
  }
  return context;
};

interface FileContextProviderProps {
  children: React.ReactNode;
}

export const FileContextProvider: React.FC<FileContextProviderProps> = ({ children }) => {
  const [availableFiles, setAvailableFiles] = useState<FileContext[]>([]);

  const addFile = useCallback((file: FileContext) => {
    setAvailableFiles(prev => {
      // Check if file already exists (by path)
      const existingFile = prev.find(f => f.path === file.path);
      if (existingFile) {
        // Update existing file
        return prev.map(f => f.path === file.path ? { ...f, ...file } : f);
      }
      // Add new file
      return [...prev, file];
    });
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setAvailableFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setAvailableFiles([]);
  }, []);

  const getFileById = useCallback((fileId: string) => {
    return availableFiles.find(f => f.id === fileId);
  }, [availableFiles]);

  const value: FileContextProviderState = {
    availableFiles,
    addFile,
    removeFile,
    clearFiles,
    getFileById
  };

  return (
    <FileContextContext.Provider value={value}>
      {children}
    </FileContextContext.Provider>
  );
};
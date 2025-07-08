// src/hooks/useDocument.ts
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export const useDocument = (
  setContent: (content: string) => void,
  getContent: () => string
) => {
  const [savedMessage, setSavedMessage] = useState("");

  const saveDocument = async () => {
    try {
      const content = getContent();
      console.log("Saving content:", content);
      const result = await invoke("save_document", { content });
      setSavedMessage(typeof result === 'string' ? result : "Document saved successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save document:", error);
      setSavedMessage("Failed to save document");
    }
  };

  const loadDocument = async () => {
    try {
      const loadedContent = await invoke<string>("load_document");
      console.log("Loaded content:", loadedContent);
      setContent(loadedContent);
      setSavedMessage("Document loaded successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Failed to load document:", error);
      setSavedMessage("Failed to load document");
    }
  };

  const newDocument = () => {
    setContent("");
    setSavedMessage("New document created!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  return {
    savedMessage,
    saveDocument,
    loadDocument,
    newDocument,
  };
};

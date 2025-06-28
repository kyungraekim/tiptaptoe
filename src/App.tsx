import { useState } from "react";
import { SimpleEditor } from "./components/SimpleEditor";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [content, setContent] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Clear save message when content changes
    if (savedMessage) {
      setSavedMessage("");
    }
  };

  const saveDocument = async () => {
    try {
      // You can implement file saving here using Tauri's file system API
      // For now, we'll just demonstrate with a success message
      setSavedMessage("Document saved successfully!");
      console.log("Document content:", content);
      
      // Example of calling a Rust function to save file
      // await invoke("save_document", { content });
      
      // Auto-clear message after 3 seconds
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save document:", error);
      setSavedMessage("Failed to save document");
    }
  };

  const loadDocument = async () => {
    try {
      // Example of calling a Rust function to load file
      // const loadedContent = await invoke("load_document");
      // setContent(loadedContent);
      
      // For demo purposes, we'll just show a message
      setSavedMessage("Load functionality would be implemented here");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Failed to load document:", error);
      setSavedMessage("Failed to load document");
    }
  };

  const newDocument = () => {
    setContent("");
    setSavedMessage("New document created");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <header style={{ 
        marginBottom: "20px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div>
          <h1 style={{ margin: "0 0 5px 0", fontSize: "1.875rem", fontWeight: "700" }}>
            Tiptap Rich Text Editor
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>
            A powerful rich text editor built with Tiptap and Tauri
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button 
            onClick={newDocument}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            New
          </button>
          <button 
            onClick={loadDocument}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            Load
          </button>
          <button 
            onClick={saveDocument}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "1px solid #3b82f6",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            Save
          </button>
        </div>
      </header>

      {savedMessage && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "6px",
          marginBottom: "20px",
          color: "#0369a1",
          fontSize: "14px"
        }}>
          {savedMessage}
        </div>
      )}

      <SimpleEditor 
        content={content} 
        onChange={handleContentChange}
      />
      
      <footer style={{ 
        marginTop: "20px", 
        paddingTop: "20px", 
        borderTop: "1px solid #e5e7eb",
        fontSize: "12px", 
        color: "#6b7280" 
      }}>
        <details>
          <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
            View Raw HTML Output
          </summary>
          <pre style={{ 
            background: "#f9fafb", 
            padding: "12px", 
            borderRadius: "6px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "11px",
            border: "1px solid #e5e7eb",
            maxHeight: "200px",
            overflow: "auto"
          }}>
            {content || "No content yet..."}
          </pre>
        </details>
      </footer>
    </div>
  );
}

export default App;
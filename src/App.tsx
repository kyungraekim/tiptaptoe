import { useState } from "react";
import { SimpleEditor } from "./components/SimpleEditor";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [content, setContent] = useState("<p>Start writing your document...</p>");
  const [savedContent, setSavedContent] = useState("");

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const saveDocument = async () => {
    try {
      // You can use Tauri commands to save to file system
      // For now, we'll just show it was saved
      setSavedContent(content);
      console.log("Document saved:", content);
      
      // Example of calling a Rust function to save file
      // await invoke("save_document", { content });
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  };

  const loadDocument = async () => {
    try {
      // Example of calling a Rust function to load file
      // const loadedContent = await invoke("load_document");
      // setContent(loadedContent);
      
      // For demo purposes, load the last saved content
      if (savedContent) {
        setContent(savedContent);
      }
    } catch (error) {
      console.error("Failed to load document:", error);
    }
  };

  return (
    <main className="container">
      <h1>Tiptap Rich Text Editor</h1>
      <p>A powerful rich text editor built with Tiptap and Tauri</p>
      
      <div style={{ marginBottom: "20px" }}>
        <button onClick={saveDocument} style={{ marginRight: "10px" }}>
          Save Document
        </button>
        <button onClick={loadDocument}>
          Load Document
        </button>
      </div>

      <SimpleEditor 
        content={content} 
        onChange={handleContentChange}
      />
      
      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <details>
          <summary>Raw HTML Output</summary>
          <pre style={{ 
            background: "#f5f5f5", 
            padding: "10px", 
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
            {content}
          </pre>
        </details>
      </div>
    </main>
  );
}

export default App;
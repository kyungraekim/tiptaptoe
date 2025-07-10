// src/App.tsx - Updated to mention the new chat feature
import { useState, useRef, useEffect } from "react";
import { AppEditor } from "./components/AppEditor";
import { GenerateButton } from "./components/GenerateButton";
import { SettingsIcon } from "./components/SettingsIcon";
import { CommentsPanel } from "./components/CommentsPanel";
import { FileContextProvider } from "./contexts/FileContextProvider";
import { invoke } from "@tauri-apps/api/core";
import { migrateOldSettings } from "./utils/settingsStorage";
import { marked } from "marked";
import { Button } from "./components/ui";
import { Comment } from "./types/comments";
import { commentStorage } from "./utils/commentStorage";
import "./utils/debugComments"; // Import debug utilities
import "./App.css";
import "./styles/comments.css";

function App() {
  const [content, setContent] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const editorRef = useRef<any>(null);

  // Migrate old settings on app start
  useEffect(() => {
    migrateOldSettings();
    // Load comments
    const loadedComments = commentStorage.getComments();
    setComments(loadedComments);
  }, []);

  const handleContentChange = (newContent: string) => {
    console.log("Content changed from editor:", newContent.substring(0, 100) + "...");
    setContent(newContent);
    if (savedMessage) {
      setSavedMessage("");
    }
  };

  const handleSummaryGenerated = (summary: string) => {
    console.log("Summary received:", summary);
    console.log("Current content before update:", content);

    // Convert Markdown to HTML
    const summaryHtml = marked.parse(summary);

    if (editorRef.current) {
      const editor = editorRef.current;

      // Move cursor to the end
      editor.commands.focus('end');

      // Add some spacing if there's existing content
      if (content.trim()) {
        editor.commands.insertContent('<br/><br/>');
      }

      editor.commands.insertContent(summaryHtml);

      console.log("Summary appended using editor commands");
    } else {
      // Fallback to state update if editor ref is not available
      console.log("Editor ref not available, using state update");
      const summaryHtml = `
        <div style="border-left: 4px solid #10b981; padding-left: 16px; margin: 16px 0;">
          <h3 style="color: #10b981; margin: 0 0 8px 0;">AI Generated Summary</h3>
          <p style="margin: 0; line-height: 1.6;">${summary}</p>
        </div>
      `;
      const newContent = content ? content + summaryHtml : summaryHtml;
      setContent(newContent);
    }

    setSavedMessage("Summary generated and added to document!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const saveDocument = async () => {
    try {
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

  const handleCommentUpdate = (commentId: string, content: string) => {
    commentStorage.updateComment(commentId, content);
    setComments(commentStorage.getComments());
  };

  const handleCommentDelete = (commentId: string) => {
    // Remove from storage
    commentStorage.deleteComment(commentId);
    
    // Remove comment mark from editor (Reactive Synchronization)
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.chain()
        .focus()
        .removeCommentMark(commentId)
        .run();
    }
    
    // Update UI
    setComments(commentStorage.getComments());
  };

  const handleCommentResolve = (commentId: string) => {
    commentStorage.resolveComment(commentId);
    setComments(commentStorage.getComments());
  };

  const handleCommentJump = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment && editorRef.current) {
      const editor = editorRef.current;
      editor.chain()
        .focus()
        .setTextSelection(comment.position)
        .run();
    }
  };

  const handleCommentsChange = (newComments: Comment[]) => {
    setComments(newComments);
  };

  // Refresh comments from storage (for synchronization updates)
  const refreshComments = () => {
    const updatedComments = commentStorage.getComments();
    setComments(updatedComments);
  };

  return (
    <FileContextProvider>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        padding: "16px 0",
        borderBottom: "1px solid #e5e7eb"
      }}>
        <div>
          <h1 style={{ margin: "0 0 5px 0", fontSize: "1.875rem", fontWeight: "700" }}>
            Tiptap Rich Text Editor
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>
            A powerful rich text editor with AI-powered PDF summarization
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button variant="secondary" onClick={newDocument}>
            New
          </Button>
          <Button variant="secondary" onClick={loadDocument}>
            Load
          </Button>
          <Button variant="primary" onClick={saveDocument}>
            Save
          </Button>
          <GenerateButton onSummaryGenerated={handleSummaryGenerated} />
          <SettingsIcon />
        </div>
      </header>

      {savedMessage && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #0ea5e9",
          borderRadius: "6px",
          color: "#0c4a6e",
          fontSize: "14px",
          marginBottom: "16px"
        }}>
          {savedMessage}
        </div>
      )}

      <div style={{
        border: "2px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "white",
        overflow: "hidden",
        display: "flex",
        minHeight: "600px",
        maxHeight: "80vh"
      }}>
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          minWidth: "0"
        }}>
          <AppEditor
            ref={editorRef}
            content={content}
            onChange={handleContentChange}
            onCommentsChange={handleCommentsChange}
            onCommentSync={refreshComments}
          />
        </div>
        <CommentsPanel
          comments={comments}
          onCommentUpdate={handleCommentUpdate}
          onCommentDelete={handleCommentDelete}
          onCommentResolve={handleCommentResolve}
          onCommentJump={handleCommentJump}
        />
      </div>

      <footer style={{
        marginTop: "20px",
        padding: "16px",
        backgroundColor: "#f9fafb",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#6b7280",
        textAlign: "center"
      }}>
        <p style={{ margin: 0 }}>
          <strong>PDF Summarization:</strong> Click the <strong>Generate</strong> button to upload a PDF and generate an AI summary.
          <br />
          <strong>AI Chat Assistant:</strong> Select any text in the editor and click the chat icon to get AI help with your content.
          <br />
          Use the <strong>⚙️ Settings</strong> icon to configure your AI provider and preferences.
        </p>
      </footer>
      </div>
    </FileContextProvider>
  );
}

export default App;
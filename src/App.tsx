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
import { CommentHistory } from "./utils/commentHistory";
import "./utils/debugComments"; // Import debug utilities
import "./utils/testCommentSystem"; // Import test utilities
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
    // Comments will be loaded when the editor is ready through the ChatPlugin
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
    const editor = editorRef.current;
    if (!editor?.storage?.commentsKit?.provider) return;
    
    const commentHistory = new CommentHistory(editor);
    const comment = comments.find(c => c.id === commentId);
    
    if (comment && comment.threadId) {
      commentHistory.updateComment(comment.threadId, commentId, content);
      
      // Refresh the display
      refreshCommentsFromProvider();
    }
  };

  const handleCommentDelete = (commentId: string) => {
    const editor = editorRef.current;
    if (!editor?.storage?.commentsKit?.provider) return;
    
    const commentHistory = new CommentHistory(editor);
    const comment = comments.find(c => c.id === commentId);
    
    if (comment && comment.threadId) {
      const provider = editor.storage.commentsKit.provider;
      const thread = provider.getThread(comment.threadId);
      
      if (thread) {
        // If this is the only comment in the thread, remove the entire thread
        const activeComments = thread.comments.filter((c: any) => !c.deletedAt);
        if (activeComments.length === 1) {
          commentHistory.deleteThread(comment.threadId);
        } else {
          // Otherwise just delete the comment
          commentHistory.deleteComment(comment.threadId, commentId);
        }
        
        // Refresh the display
        refreshCommentsFromProvider();
      }
    }
  };

  const handleCommentResolve = (commentId: string) => {
    const editor = editorRef.current;
    if (!editor?.storage?.commentsKit?.provider) return;
    
    const commentHistory = new CommentHistory(editor);
    const comment = comments.find(c => c.id === commentId);
    
    if (comment && comment.threadId) {
      commentHistory.resolveThread(comment.threadId);
      
      // Refresh the display
      refreshCommentsFromProvider();
    }
  };

  const handleCommentJump = (commentId: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.position) {
      // Move cursor to the start of the comment's position (no selection)
      editor.commands.setTextSelection(comment.position.from);
      
      // Highlight the thread if available
      if (comment.threadId && editor.storage?.commentsKit?.provider) {
        editor.commands.selectThread({ id: comment.threadId });
      }
      
      // Focus the editor and scroll the cursor into view
      editor.commands.focus();
      editor.commands.scrollIntoView();
    }
  };

  const handleCommentsChange = (newComments: Comment[]) => {
    setComments(newComments);
  };

  // Refresh comments from the extension provider
  const refreshCommentsFromProvider = () => {
    const editor = editorRef.current;
    if (!editor?.storage?.commentsKit?.provider) return;
    
    const provider = editor.storage.commentsKit.provider;
    const threads = provider.getThreads();
    
    const convertedComments: Comment[] = threads.flatMap((thread: any) => 
      thread.comments
        .filter((comment: any) => !comment.deletedAt) // Filter out deleted comments
        .map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          selectedText: comment.data?.selectedText || '',
          position: comment.data?.position || { from: 0, to: 0 },
          timestamp: comment.createdAt,
          author: comment.data?.author || 'User',
          resolved: !!thread.resolvedAt,
          threadId: thread.id
        }))
    );

    setComments(convertedComments);
  };

  // Refresh comments from storage (for synchronization updates)
  const refreshComments = () => {
    refreshCommentsFromProvider();
  };

  return (
    <FileContextProvider>
      <div className="app-container" style={{
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        {/* Header section */}
        <header className="app-header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
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

        {/* Content section */}
        <div className="app-content">
          {savedMessage && (
            <div style={{
              padding: "12px 16px",
              backgroundColor: "#f0f9ff",
              border: "1px solid #0ea5e9",
              borderRadius: "6px",
              color: "#0c4a6e",
              fontSize: "14px",
              margin: "16px 20px 0 20px"
            }}>
              {savedMessage}
            </div>
          )}
          
          {/* Editor section */}
          <div className="editor-container" style={{
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            backgroundColor: "white",
            overflow: "hidden",
            display: "flex",
            margin: "16px 20px",
            flex: 1
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
          
          {/* Footer section */}
          <footer style={{
            padding: "16px 20px",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#6b7280",
            textAlign: "center",
            margin: "16px 20px 20px 20px"
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
      </div>
    </FileContextProvider>
  );
}

export default App;
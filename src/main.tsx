import React from "react";
import ReactDOM from "react-dom/client";
import "@tiptaptoe/ui-components/dist/styles.css";
import "@tiptaptoe/tiptap-editor/dist/styles.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

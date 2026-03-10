import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Disable console logs in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// Disable right-click context menu
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  return false;
});

// Disable keyboard shortcuts for developer tools
document.addEventListener("keydown", (e) => {
  // F12
  if (e.key === "F12") {
    e.preventDefault();
    return false;
  }
  // Ctrl+Shift+I (Chrome DevTools)
  if (e.ctrlKey && e.shiftKey && e.key === "I") {
    e.preventDefault();
    return false;
  }
  // Ctrl+Shift+J (Chrome Console)
  if (e.ctrlKey && e.shiftKey && e.key === "J") {
    e.preventDefault();
    return false;
  }
  // Ctrl+Shift+C (Inspect Element)
  if (e.ctrlKey && e.shiftKey && e.key === "C") {
    e.preventDefault();
    return false;
  }
  // Ctrl+U (View Source)
  if (e.ctrlKey && e.key === "u") {
    e.preventDefault();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from "react";

console.log('🚀 Main.tsx is loading...');

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('💥 React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828' }}>
          <h1>💥 Something went wrong with the App</h1>
          <p>Error: {this.state.error?.message}</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('✅ React app should be rendered now');
} catch (error) {
  console.error('💥 Error in main.tsx:', error);
  document.getElementById("root")!.innerHTML = `<div style="padding: 20px; color: red;"><h1>App Failed to Load</h1><p>Error: ${error}</p></div>`;
}



import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import './src/styles/main.css';

// Function to initialize the app
function initApp() {
  const rootElement = document.getElementById('knokspack-root');
  if (!rootElement) {
    console.error("Could not find knokspack-root element. Retrying in 100ms...");
    setTimeout(initApp, 100);
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <UserProvider>
          <App />
        </UserProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Error mounting React application:", error);
  }
}

// Initialize after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
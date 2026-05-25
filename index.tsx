import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AccessGate from './AccessGate';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AccessGate toolSlug="src-exvivo-hemodata">
      <App />
    </AccessGate>
  </React.StrictMode>
);

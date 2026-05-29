import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Forcefully inject favicon to prevent browser caching or routing issues
const updateFavicon = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const oldIcons = document.querySelectorAll("link[rel*='icon']");
  oldIcons.forEach(icon => icon.remove());
  
  const link = document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  // Add timestamp to permanently break any browser cache
  link.href = `https://i.ibb.co/mrtDMPDF/p2.png?v=${Date.now()}`;
  document.head.appendChild(link);
};
updateFavicon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

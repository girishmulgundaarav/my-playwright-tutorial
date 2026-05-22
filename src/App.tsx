import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DocsLayout } from './components/DocsLayout';
import { LandingPage } from './components/LandingPage';

const App: React.FC = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDarkTheme = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    let savedColor = localStorage.getItem('color-theme') || 'blue';
    if (savedColor === 'red') {
      savedColor = 'orange';
      localStorage.setItem('color-theme', 'orange');
    }
    document.documentElement.setAttribute('data-color-theme', savedColor);
  }, []);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs/*" element={<DocsLayout />} />
      </Routes>
    </div>
  );
};

export default App;

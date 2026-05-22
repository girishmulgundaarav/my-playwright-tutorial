import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SemanticSearch } from './SemanticSearch';
import { Menu, Moon, Sun, Github, Book } from 'lucide-react';

export const DocsLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem('color-theme') || 'blue';
    return saved === 'red' ? 'orange' : saved;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    localStorage.setItem('color-theme', colorTheme);
  }, [colorTheme]);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <SemanticSearch />
          </div>
          <div className="header-right">
            <a 
              href="https://github.com/girishmulgundaarav/my-playwright-tutorial" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub Repository"
              className="header-link-icon"
              style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Github size={20} />
            </a>
            <a 
              href="https://playwright.dev/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Official Playwright Documentation"
              className="header-link-icon"
              style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Book size={20} />
            </a>
            <div className="color-switcher" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '4px' }}>
              <button
                onClick={() => setColorTheme('blue')}
                className={`color-dot blue-dot ${colorTheme === 'blue' ? 'active' : ''}`}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#4F46E5',
                  border: colorTheme === 'blue' ? '2px solid var(--bg-secondary)' : 'none',
                  boxShadow: colorTheme === 'blue' ? '0 0 0 2px #4F46E5' : '0 0 0 1px rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease',
                }}
                title="Indigo/Blue Theme"
                aria-label="Switch to Blue Theme"
              />
              <button
                onClick={() => setColorTheme('orange')}
                className={`color-dot orange-dot ${colorTheme === 'orange' ? 'active' : ''}`}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#E65F2B',
                  border: colorTheme === 'orange' ? '2px solid var(--bg-secondary)' : 'none',
                  boxShadow: colorTheme === 'orange' ? '0 0 0 2px #E65F2B' : '0 0 0 1px rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease',
                }}
                title="Orange/Coral Theme"
                aria-label="Switch to Orange Theme"
              />
            </div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="theme-toggle"
              aria-label="Toggle Dark Mode"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
        <div className="content-area">
          <Routes>
            <Route path="*" element={<MarkdownRenderer />} />
          </Routes>
        </div>
      </main>
    </>
  );
};

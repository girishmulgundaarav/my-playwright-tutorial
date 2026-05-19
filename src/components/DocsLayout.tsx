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

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

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
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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

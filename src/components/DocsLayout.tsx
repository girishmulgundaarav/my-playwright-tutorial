import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SemanticSearch } from './SemanticSearch';
import { Menu, Moon, Sun, Github, Book, ChevronLeft, ChevronRight, Home } from 'lucide-react';

export const DocsLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

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

  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollPercent(0);
        return;
      }
      const scrollPos = window.scrollY;
      const percentage = (scrollPos / totalHeight) * 100;
      setScrollPercent(Math.min(percentage, 100));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // run once initially

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="header">
        <div className="header-logo-section">
          <div className="brand">Playwright</div>
          <button 
            type="button"
            className="complete-guide-badge"
            style={{ cursor: 'default', fontFamily: 'inherit' }}
          >
            GUIDE
          </button>
          
          <button
            onClick={toggleSidebarCollapse}
            className="sidebar-collapse-toggle"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        
        <div className="header-main-section">
          <div className="header-left">
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <SemanticSearch />
          </div>
          
          <div className="header-right">
            <Link 
              to="/" 
              aria-label="Home"
              className="header-link-icon"
              style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', transition: 'color 0.2s', marginRight: '0.25rem' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Home size={20} />
            </Link>
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
        </div>

        {/* Scroll reading progress bar */}
        <div className="scroll-progress-bar" style={{ width: `${scrollPercent}%` }}></div>
      </header>
      
      <div className="app-body">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="main-content">
          <div className="content-area">
            <Routes>
              <Route path="*" element={<MarkdownRenderer />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

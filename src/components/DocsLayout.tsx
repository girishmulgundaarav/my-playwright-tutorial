import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SemanticSearch } from './SemanticSearch';
import { Menu, Moon, Sun, Github, Book, ChevronLeft, Home } from 'lucide-react';

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
        <div className="header-logo-section" style={{ padding: 0 }}>
          <button
            onClick={toggleSidebarCollapse}
            className="sidebar-collapse-toggle"
            style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              padding: isSidebarCollapsed ? '0' : '0 1.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '0.5px'
            }}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {!isSidebarCollapsed && <span>Documentation</span>}
            {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} color="var(--text-muted)" />}
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

            <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)', margin: '0 0.5rem' }}></div>
            
            <Link to="/" style={{ display: 'flex', alignItems: 'center', width: 'auto', height: 'auto', background: 'transparent' }}>
              <img src="/img/logo-transparent-png.png?v=2" alt="Playwright Logo" style={{ height: '56px', width: 'auto', display: 'block' }} />
            </Link>
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

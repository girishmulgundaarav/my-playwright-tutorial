import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2, ArrowRight, Command, FileText, Hash, Sparkles } from 'lucide-react';
import OpenAI from 'openai';
import { Link, useNavigate } from 'react-router-dom';

const mdFiles = import.meta.glob('../../docs/**/*.md', { query: '?raw', import: 'default' });

export const SemanticSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ answer: string; docId: string; docTitle: string } | null>(null);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchMode, setSearchMode] = useState<'all' | 'ai'>('all');
  
  const [documents, setDocuments] = useState<{ id: string; title: string; content: string; category: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preload all documents
  useEffect(() => {
    const loadAllDocs = async () => {
      try {
        const docs: { id: string; title: string; content: string; category: string }[] = [];
        for (const path in mdFiles) {
          const content = (await mdFiles[path]()) as string;
          const id = path.replace('../../docs/', '').replace('.md', '');
          const parts = id.split('/');
          const category = parts.length > 1 ? parts[0] : 'General';
          const titleMatch = content.match(/^#\s+(.+)/m);
          const title = titleMatch ? titleMatch[1].trim() : id;
          docs.push({ id, title, content, category });
        }
        setDocuments(docs);
      } catch (err) {
        console.error("Failed to preload documents for search:", err);
      }
    };
    loadAllDocs();
  }, []);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Local Search computation
  const localResults = useMemo(() => {
    if (query.trim().length < 3) return [];
    
    const results: { id: string; title: string; matchedSection?: string; snippet: string; category: string }[] = [];
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    
    documents.forEach(doc => {
      const lowerTitle = doc.title.toLowerCase();
      const lowerContent = doc.content.toLowerCase();
      
      const titleMatch = searchTerms.every(term => lowerTitle.includes(term));
      
      if (titleMatch) {
        const lines = doc.content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        const snippet = lines[0] ? lines[0].substring(0, 100) + '...' : 'Open document to read more.';
        results.push({
          id: doc.id,
          title: doc.title,
          category: doc.category,
          snippet
        });
        return;
      }
      
      const contentMatch = searchTerms.every(term => lowerContent.includes(term));
      if (contentMatch) {
        const firstTerm = searchTerms[0];
        const lines = doc.content.split('\n');
        
        let matchedSection: string | undefined;
        let snippet = '';
        
        for (const line of lines) {
          if (line.startsWith('#') && line.toLowerCase().includes(firstTerm)) {
            matchedSection = line.replace(/^#+\s+/, '').trim();
            break;
          }
        }
        
        for (const line of lines) {
          if (!line.startsWith('#') && line.toLowerCase().includes(firstTerm)) {
            const index = line.toLowerCase().indexOf(firstTerm);
            const start = Math.max(0, index - 40);
            const end = Math.min(line.length, index + 60);
            snippet = (start > 0 ? '...' : '') + line.substring(start, end).trim() + (end < line.length ? '...' : '');
            break;
          }
        }
        
        if (!snippet) {
          snippet = doc.title + ' content match.';
        }
        
        results.push({
          id: doc.id,
          title: doc.title,
          matchedSection,
          category: doc.category,
          snippet
        });
      }
    });
    
    return results;
  }, [query, documents]);

  // Handle keyboard list navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, localResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < localResults.length) {
        const selected = localResults[selectedIndex];
        navigate(`/docs/${selected.id}`);
        setIsOpen(false);
        setSelectedIndex(-1);
      } else if (query.trim()) {
        handleAISearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleAISearch = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setError('Missing VITE_OPENAI_API_KEY in .env file.');
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setError('');
    setAiResult(null);
    setSearchMode('ai');

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const prompt = `
        You are an AI assistant for a documentation site.
        A user is asking: "${query}"
        
        Here are the available documents:
        ${documents.map(d => `--- START DOC: ${d.id} ---\n${d.content}\n--- END DOC ---`).join('\n\n')}
        
        Find the most relevant document that answers the user's question.
        Provide a concise, helpful answer based ONLY on that document.
        Respond in JSON format with three fields:
        {
          "answer": "Your concise answer here",
          "docId": "The ID of the most relevant doc, e.g., Introduction/getting-started",
          "docTitle": "The title of the most relevant doc"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const textResponse = response.choices[0].message.content || "{}";
      const parsed = JSON.parse(textResponse);
      setAiResult(parsed);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [localResults]);

  return (
    <div className="search-container" ref={searchRef}>
      <div style={{ position: 'relative' }}>
        <Search size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search docs or ask AI..."
          value={query}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (searchMode === 'ai') setSearchMode('all');
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="search-shortcut">
          <kbd style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <Command size={10} />
            <span>K</span>
          </kbd>
        </div>
      </div>

      {isOpen && (query || isLoading || aiResult || error) && (
        <div className="search-results-modal" style={{ width: 'min(450px, 90vw)' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <button 
              className={`search-tab-btn ${searchMode === 'all' ? 'active' : ''}`}
              onClick={() => setSearchMode('all')}
              style={{
                background: 'none',
                border: 'none',
                color: searchMode === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderBottom: searchMode === 'all' ? '2px solid var(--accent-primary)' : 'none'
              }}
            >
              Instant Results ({localResults.length})
            </button>
            <button 
              className={`search-tab-btn ${searchMode === 'ai' ? 'active' : ''}`}
              onClick={handleAISearch}
              disabled={!query.trim()}
              style={{
                background: 'none',
                border: 'none',
                color: searchMode === 'ai' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: query.trim() ? 'pointer' : 'not-allowed',
                padding: '0.25rem 0.5rem',
                opacity: query.trim() ? 1 : 0.5,
                borderBottom: searchMode === 'ai' ? '2px solid var(--accent-primary)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Sparkles size={14} style={{ color: '#A78BFA' }} />
              Ask AI Assistant
            </button>
          </div>

          {searchMode === 'all' && (
            <div className="search-results-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {query.length < 3 ? (
                <div style={{ padding: '1.5rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  Type at least 3 characters to search...
                </div>
              ) : localResults.length === 0 ? (
                <div style={{ padding: '1.5rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No matches found. Try <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={handleAISearch}>Asking AI</span> instead.
                </div>
              ) : (
                localResults.map((result, idx) => (
                  <Link
                    key={idx}
                    to={`/docs/${result.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`search-result-item ${selectedIndex === idx ? 'selected' : ''}`}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                      background: selectedIndex === idx ? 'var(--sidebar-item-hover)' : 'transparent',
                      transition: 'background 0.2s',
                      marginBottom: '0.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', minWidth: 0 }}>
                      {result.matchedSection ? <Hash size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} /> : <FileText size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{result.title}</span>
                      {result.category && (
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--border-glass)', color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>
                          {result.category}
                        </span>
                      )}
                    </div>
                    {result.matchedSection && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent-primary)', marginBottom: '0.2rem', paddingLeft: '1.25rem' }}>
                        Section: {result.matchedSection}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {result.snippet}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {searchMode === 'ai' && (
            <div className="ai-search-container">
              {isLoading ? (
                <div className="search-loading" style={{ padding: '1.5rem 0', justifyContent: 'center' }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Analyzing documentation with OpenAI...</span>
                </div>
              ) : error ? (
                <div style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 500, padding: '1rem 0', textAlign: 'center' }}>{error}</div>
              ) : aiResult ? (
                <>
                  <div className="search-result-title" style={{ marginBottom: '0.5rem' }}>
                    <Sparkles size={14} style={{ color: '#A78BFA' }} />
                    AI Answer
                  </div>
                  <div className="search-result-content" style={{ marginBottom: '0.75rem' }}>
                    {aiResult.answer}
                  </div>
                  {aiResult.docId && (
                    <Link 
                      to={`/docs/${aiResult.docId}`} 
                      className="search-result-link"
                      onClick={() => setIsOpen(false)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}
                    >
                      Read full chapter: {aiResult.docTitle}
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </>
              ) : null}
            </div>
          )}

          <div className="search-footer-hints" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <kbd style={{ display: 'inline-block', padding: '1px 3px', border: '1px solid var(--border-glass)', borderRadius: '3px' }}>↓↑</kbd> to navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <kbd style={{ display: 'inline-block', padding: '1px 3px', border: '1px solid var(--border-glass)', borderRadius: '3px' }}>Enter</kbd> to select
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <kbd style={{ display: 'inline-block', padding: '1px 3px', border: '1px solid var(--border-glass)', borderRadius: '3px' }}>Esc</kbd> to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

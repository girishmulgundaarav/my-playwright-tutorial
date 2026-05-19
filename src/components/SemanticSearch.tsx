import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import OpenAI from 'openai';
import { Link } from 'react-router-dom';

const mdFiles = import.meta.glob('../../docs/**/*.md', { query: '?raw', import: 'default' });

export const SemanticSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; docId: string; docTitle: string } | null>(null);
  const [error, setError] = useState('');
  
  const searchRef = useRef<HTMLDivElement>(null);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setError('Missing VITE_OPENAI_API_KEY in .env file.');
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setError('');
    setResult(null);

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required since we are calling it directly from frontend
      });

      // Gather all document contents
      const documents: { id: string, title: string, content: string }[] = [];
      for (const path in mdFiles) {
        const content = (await mdFiles[path]()) as string;
        // extract id from path: ../../docs/Introduction/getting-started.md -> Introduction/getting-started
        const id = path.replace('../../docs/', '').replace('.md', '');
        // extract a title from the first heading, or fallback to id
        const titleMatch = content.match(/^#\s+(.+)/m);
        const title = titleMatch ? titleMatch[1] : id;
        documents.push({ id, title, content });
      }

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
      setResult(parsed);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSearch}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Ask AI anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => query && setIsOpen(true)}
        />
      </form>

      {isOpen && (query || isLoading || result || error) && (
        <div className="search-results-modal">
          {isLoading ? (
            <div className="search-loading">
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing documentation with OpenAI...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm font-medium">{error}</div>
          ) : result ? (
            <>
              <div className="search-result-title">AI Answer</div>
              <div className="search-result-content">
                {result.answer}
              </div>
              {result.docId && (
                <Link 
                  to={`/docs/${result.docId}`} 
                  className="search-result-link"
                  onClick={() => setIsOpen(false)}
                >
                  Read more in {result.docTitle}
                  <ArrowRight size={14} />
                </Link>
              )}
            </>
          ) : (
            <div className="text-sm text-slate-500">Press Enter to search.</div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Check, Copy, Rocket, Palette, Target, MousePointer2, FlaskConical, BookOpen, ChevronRight, ChevronLeft, Lightbulb, AlertTriangle, Info } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import sidebars from '../sidebars';

function remarkAdmonitions() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective') {
        const data = node.data || (node.data = {});
        data.hName = 'div';
        data.hProperties = { className: ['admonition', `admonition-${node.name}`] };
      }
    });
  };
}

// Import all markdown files in the docs directory as raw text
const mdFiles = import.meta.glob('../../docs/**/*.md', { query: '?raw', import: 'default' });

const finalBookTheme: any = {
  'code[class*="language-"]': {
    color: '#A5F3FC',
    background: 'none',
    fontFamily: '"Courier New", Courier, monospace',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.75',
    tabSize: '4',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#A5F3FC',
    background: '#1E1B4B',
    fontFamily: '"Courier New", Courier, monospace',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.75',
    tabSize: '4',
    hyphens: 'none',
    margin: '0',
    overflow: 'auto',
  },
  comment: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  prolog: {
    color: '#6B7280',
  },
  doctype: {
    color: '#6B7280',
  },
  cdata: {
    color: '#6B7280',
  },
  punctuation: {
    color: '#A5F3FC',
  },
  property: {
    color: '#34D399',
  },
  tag: {
    color: '#F472B6',
  },
  boolean: {
    color: '#FB923C',
  },
  number: {
    color: '#FB923C',
  },
  constant: {
    color: '#FB923C',
  },
  symbol: {
    color: '#FCD34D',
  },
  deleted: {
    color: '#F472B6',
  },
  selector: {
    color: '#34D399',
  },
  'attr-name': {
    color: '#34D399',
  },
  string: {
    color: '#FCD34D',
  },
  char: {
    color: '#FCD34D',
  },
  builtin: {
    color: '#34D399',
  },
  inserted: {
    color: '#34D399',
  },
  operator: {
    color: '#A5F3FC',
  },
  entity: {
    color: '#34D399',
    cursor: 'help',
  },
  url: {
    color: '#34D399',
  },
  variable: {
    color: '#A5F3FC',
  },
  atrule: {
    color: '#FCD34D',
  },
  'attr-value': {
    color: '#FCD34D',
  },
  keyword: {
    color: '#F472B6',
  },
  function: {
    color: '#34D399',
  },
  regex: {
    color: '#FCD34D',
  },
  important: {
    color: '#F472B6',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
};

const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <div className="window-controls">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <span className="language-label">{language}</span>
          <button className="copy-button" onClick={copyToClipboard} aria-label="Copy code">
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          {...props}
          PreTag="pre"
          children={codeString}
          language={language}
          style={finalBookTheme}
          customStyle={{
            margin: '0',
            borderRadius: '0 0 8px 8px',
            fontSize: '0.95rem',
            padding: '1.25rem',
            background: '#1E1B4B'
          }}
        />
      </div>
    );
  }

  return (
    <code {...props} className={className}>
      {children}
    </code>
  );
};

const flattenSidebar = (items: any[]): any[] => {
  let flat: any[] = [];
  items.forEach(item => {
    if (item.type === 'doc') flat.push(item);
    if (item.type === 'category' && item.items) flat = flat.concat(flattenSidebar(item.items));
  });
  return flat;
};

const flatSidebar = flattenSidebar(sidebars.tutorialSidebar);

const Heading1 = ({ node, children, ...props }: any) => {
  const { '*': path } = useParams();
  const docId = path || 'Introduction/getting-started';
  const activeIndex = flatSidebar.findIndex(item => item.id === docId);
  const chapterNumber = activeIndex !== -1 ? activeIndex + 1 : 1;
  const paddedChapterNumber = String(chapterNumber).padStart(2, '0');
  
  const text = String(children);
  let Icon = BookOpen;
  
  if (text.includes('Getting Started') || text.includes('Kick Start') || text.includes('Setup')) {
    Icon = Rocket;
  } else if (text.includes('CSS')) {
    Icon = Palette;
  } else if (text.includes('Locator') || text.includes('XPath')) {
    Icon = Target;
  } else if (text.includes('Actions') || text.includes('Dropdown')) {
    Icon = MousePointer2;
  } else if (text.includes('Lab') || text.includes('Assignment')) {
    Icon = FlaskConical;
  }

  return (
    <div className="chapter-header" data-num={paddedChapterNumber}>
      <div className="chapter-num">Chapter {paddedChapterNumber}</div>
      <h1 {...props} className="chapter-title">
        <Icon size={36} style={{ color: '#A5B4FC' }} />
        {children}
      </h1>
    </div>
  );
};

const extractToC = (md: string) => {
  const headings = [...md.matchAll(/^(##|###)\s+(.+)$/gm)];
  return headings.map((match) => {
    const level = match[1].length;
    const text = match[2].replace(/\[|\]|\(.*\)/g, '').trim(); // strip markdown links
    const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
    return { id, level, text };
  });
};

const Heading2 = ({ node, children, ...props }: any) => {
  const text = String(children);
  const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  return <h2 id={id} {...props}>{children}</h2>;
};

const Heading3 = ({ node, children, ...props }: any) => {
  const text = String(children);
  const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  return <h3 id={id} {...props}>{children}</h3>;
};

const AdmonitionIcon = ({ type }: { type: string }) => {
  if (type === 'tip') return <Lightbulb size={18} />;
  if (type === 'warning') return <AlertTriangle size={18} />;
  return <Info size={18} />;
};

export const MarkdownRenderer: React.FC = () => {
  const { '*': path } = useParams();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const docId = path || 'Introduction/getting-started';

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const expectedPath = `../../docs/${docId}.md`;
        let fileContent = '';
        if (mdFiles[expectedPath]) {
          fileContent = (await mdFiles[expectedPath]()) as string;
        } else {
          fileContent = '# 404 Not Found\n\nThe requested document could not be found.';
        }
        const cleanedContent = fileContent.replace(/^---\n[\s\S]*?\n---\n/, '');
        setContent(cleanedContent);
      } catch (error) {
        console.error("Error loading markdown:", error);
        setContent('# Error\n\nFailed to load document.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [docId]);

  const toc = useMemo(() => extractToC(content), [content]);

  const currentIndex = flatSidebar.findIndex(item => item.id === docId);
  const prevDoc = currentIndex > 0 ? flatSidebar[currentIndex - 1] : null;
  const nextDoc = currentIndex !== -1 && currentIndex < flatSidebar.length - 1 ? flatSidebar[currentIndex + 1] : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem', color: 'var(--text-muted)' }}>
        <div>Loading content...</div>
      </div>
    );
  }

  return (
    <div key={docId} className="page-transition">
      <Breadcrumbs />
      <div className="docs-layout-container">
        <div className="docs-main-column">
          <div className="markdown-body">
            <Markdown
              remarkPlugins={[remarkGfm, remarkDirective, remarkAdmonitions]}
              components={{ 
                code: CodeBlock, 
                h1: Heading1,
                h2: Heading2,
                h3: Heading3,
                img: (props) => {
                  let src = props.src;
                  if (src && src.startsWith('/')) {
                    src = import.meta.env.BASE_URL + src.substring(1);
                  }
                  return <img {...props} src={src} />;
                },
                div: ({node, className, children, ...props}: any) => {
                  if (className && className.includes('admonition')) {
                    const match = className.match(/admonition-(\w+)/);
                    const type = match ? match[1] : 'note';
                    return (
                      <div className={className} {...props}>
                        <p>
                          <AdmonitionIcon type={type} />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </p>
                        {children}
                      </div>
                    );
                  }
                  return <div className={className} {...props}>{children}</div>;
                },
                table: ({node, className, children, ...props}: any) => (
                  <div className="table-responsive">
                    <table className={className} {...props}>{children}</table>
                  </div>
                )
              }}
            >
              {content}
            </Markdown>
          </div>

          <div className="pagination-container">
            {prevDoc ? (
              <Link to={`/docs/${prevDoc.id}`} className="pagination-card pagination-prev">
                <div className="pagination-card-label">
                  <ChevronLeft size={16} />
                  Previous
                </div>
                <div className="pagination-card-title">{prevDoc.label}</div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
            
            {nextDoc ? (
              <Link to={`/docs/${nextDoc.id}`} className="pagination-card pagination-next">
                <div className="pagination-card-label">
                  Next
                  <ChevronRight size={16} />
                </div>
                <div className="pagination-card-title">{nextDoc.label}</div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
          </div>
        </div>
        
        <div className="docs-toc-column">
          {toc.length > 0 && (
            <div className="toc-container">
              <div className="toc-title">On this page</div>
              <ul className="toc-list">
                {toc.map((item, idx) => (
                  <li key={idx} className={`toc-item ${item.level === 3 ? 'toc-level-3' : ''}`}>
                    <a href={`#${item.id}`} className="toc-link">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <footer className="footer" style={{ borderTop: '1px solid var(--border-glass)', padding: '2.5rem 1.5rem 3.5rem', marginTop: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <a href="https://github.com/girishmulgund/my-playwright-tutorial" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub Repository</a>
          <a href="https://playwright.dev/" target="_blank" rel="noopener noreferrer" className="footer-link">Official Playwright Docs</a>
        </div>
        <p style={{ margin: '0' }}>Playwright Tutorial &copy; 2026. Made with ❤️ for automation engineering.</p>
      </footer>
    </div>
  );
};

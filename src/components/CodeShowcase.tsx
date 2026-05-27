import React from 'react';

export const CodeShowcase: React.FC = () => {
  return (
    <section className="simple-showcase-section">
      <div className="showcase-header-text">
        <h2 className="section-title">Get Started in Seconds</h2>
        <p className="section-subtitle">
          Playwright is straightforward to set up, highly resilient, and runs parallel tests across Chromium, Firefox, and WebKit out of the box.
        </p>
      </div>

      <div className="simple-showcase-grid">
        
        {/* Terminal Window (Left) */}
        <div className="showcase-window terminal-window">
          <div className="window-header">
            <div className="window-controls">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="window-title">bash — playwright init</span>
          </div>
          <div className="window-content terminal-content">
            <div className="terminal-group">
              <div className="terminal-comment"># 1. Initialize a new Playwright project</div>
              <div className="terminal-command">
                <span className="prompt">$</span> npm init playwright@latest
              </div>
            </div>
            
            <div className="terminal-group">
              <div className="terminal-comment"># 2. Execute tests in headless mode (parallel by default)</div>
              <div className="terminal-command">
                <span className="prompt">$</span> npx playwright test
              </div>
            </div>
            
            <div className="terminal-group">
              <div className="terminal-comment"># 3. View the visual, interactive HTML test report</div>
              <div className="terminal-command">
                <span className="prompt">$</span> npx playwright show-report
              </div>
            </div>
            
            <div className="terminal-footer">
              <div className="terminal-success-line">
                <span className="badge-success">Success</span> Playwright successfully initialized!
              </div>
            </div>
          </div>
        </div>

        {/* Code Window (Right) */}
        <div className="showcase-window code-window">
          <div className="window-header">
            <div className="window-controls">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="window-title">tests/login.spec.ts</span>
          </div>
          <div className="window-content code-content">
            <pre className="syntax-code">
              <code>
                <span className="token keyword">import</span> {'{'} test, expect {'}'} <span className="token keyword">from</span> <span className="token string">'@playwright/test'</span>;<br /><br />
                
                <span className="token function">test</span>(<span className="token string">'user login flow'</span>, <span className="token keyword">async</span> ({'{'} page {'}'}) <span className="token operator">=&gt;</span> {'{'}<br />
                &nbsp;&nbsp;<span className="token comment">// Auto-waiting navigation</span><br />
                &nbsp;&nbsp;<span className="token keyword">await</span> page.<span className="token function">goto</span>(<span className="token string">'https://myapp.com/login'</span>);<br /><br />
                
                &nbsp;&nbsp;<span className="token comment">// Web-first resilient locators</span><br />
                &nbsp;&nbsp;<span className="token keyword">await</span> page.<span className="token function">getByPlaceholder</span>(<span className="token string">'Email'</span>).<span className="token function">fill</span>(<span className="token string">'user@demo.com'</span>);<br />
                &nbsp;&nbsp;<span className="token keyword">await</span> page.<span className="token function">getByPlaceholder</span>(<span className="token string">'Password'</span>).<span className="token function">fill</span>(<span className="token string">'secret'</span>);<br /><br />
                
                &nbsp;&nbsp;<span className="token comment">// Automatic actionability checks before clicking</span><br />
                &nbsp;&nbsp;<span className="token keyword">await</span> page.<span className="token function">getByRole</span>(<span className="token string">'button'</span>, {'{'} name: <span className="token string">'Sign in'</span> {'}'}).<span className="token function">click</span>();<br /><br />
                
                &nbsp;&nbsp;<span className="token comment">// Retrying assertions avoid race conditions</span><br />
                &nbsp;&nbsp;<span className="token keyword">await</span> <span className="token function">expect</span>(page.<span className="token function">getByText</span>(<span className="token string">'Welcome back!'</span>)).<span className="token function">toBeVisible</span>();<br />
                {'})'};
              </code>
            </pre>
          </div>
        </div>

      </div>
    </section>
  );
};

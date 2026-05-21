import React, { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Terminal, Globe, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CodeShowcase: React.FC = () => {
  const [browserStep, setBrowserStep] = useState(0);

  return (
    <section className="code-showcase-section">
      <h2 className="section-title">Write Tests That Make Sense</h2>
      <p className="section-subtitle">Playwright's API is designed to be intuitive and powerful.</p>
      
      <div className="showcase-container">
        {/* Editor Pane */}
        <div className="editor-pane">
          <div className="editor-header">
            <div className="window-controls">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="file-name"><Terminal size={14} style={{display: 'inline', marginRight: '5px', verticalAlign: 'middle'}}/>login.spec.ts</span>
          </div>
          <div className="editor-content">
            <TypeAnimation
              sequence={[
                // step 0
                () => setBrowserStep(0),
                "import { test, expect } from '@playwright/test';\n\n",
                1000,
                "import { test, expect } from '@playwright/test';\n\ntest('user login flow', async ({ page }) => {\n",
                500,
                () => setBrowserStep(1), // navigating
                "import { test, expect } from '@playwright/test';\n\ntest('user login flow', async ({ page }) => {\n  await page.goto('https://myapp.com/login');\n",
                1500,
                () => setBrowserStep(2), // loaded, filling email
                "import { test, expect } from '@playwright/test';\n\ntest('user login flow', async ({ page }) => {\n  await page.goto('https://myapp.com/login');\n  await page.getByPlaceholder('Email').fill('user@demo.com');\n",
                1500,
                () => setBrowserStep(3), // filling password
                "import { test, expect } from '@playwright/test';\n\ntest('user login flow', async ({ page }) => {\n  await page.goto('https://myapp.com/login');\n  await page.getByPlaceholder('Email').fill('user@demo.com');\n  await page.getByPlaceholder('Password').fill('secret');\n",
                1500,
                () => setBrowserStep(4), // clicking
                "import { test, expect } from '@playwright/test';\n\ntest('user login flow', async ({ page }) => {\n  await page.goto('https://myapp.com/login');\n  await page.getByPlaceholder('Email').fill('user@demo.com');\n  await page.getByPlaceholder('Password').fill('secret');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n",
                1500,
                () => setBrowserStep(5), // expecting
                "import { test, expect } from '@playwright/test';\n\ntest('user login flow', async ({ page }) => {\n  await page.goto('https://myapp.com/login');\n  await page.getByPlaceholder('Email').fill('user@demo.com');\n  await page.getByPlaceholder('Password').fill('secret');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page.getByText('Welcome back!')).toBeVisible();\n});",
                5000,
              ]}
              wrapper="div"
              cursor={true}
              repeat={Infinity}
              className="typing-code"
              style={{ whiteSpace: 'pre', fontSize: '0.9rem', lineHeight: 1.6, color: '#A5F3FC' }}
            />
          </div>
        </div>

        {/* Browser Pane */}
        <div className="browser-pane">
          <div className="browser-header">
            <div className="browser-url-bar">
              <Globe size={14} />
              <span>{browserStep >= 1 ? 'https://myapp.com/login' : 'about:blank'}</span>
            </div>
          </div>
          <div className="browser-content">
            {browserStep === 0 && (
              <div className="browser-empty">Opening Browser...</div>
            )}
            {browserStep >= 1 && browserStep <= 4 && (
              <div className="browser-login-form">
                <h3>Sign In</h3>
                <div className={`mock-input-field ${browserStep >= 2 ? 'filled' : ''}`}>
                  <User size={16} />
                  <span>{browserStep >= 2 ? 'user@demo.com' : 'Email'}</span>
                </div>
                <div className={`mock-input-field ${browserStep >= 3 ? 'filled' : ''}`}>
                  <Lock size={16} />
                  <span>{browserStep >= 3 ? '••••••••' : 'Password'}</span>
                </div>
                <div className={`mock-submit-btn ${browserStep >= 4 ? 'clicked' : ''}`}>
                  Sign in <ArrowRight size={16} />
                </div>
              </div>
            )}
            {browserStep >= 5 && (
              <div className="browser-success">
                <CheckCircle2 size={48} color="#10b981" />
                <h2>Welcome back!</h2>
                <p>Dashboard loaded successfully.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

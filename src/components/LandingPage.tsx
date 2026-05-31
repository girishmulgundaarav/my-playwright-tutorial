import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Code, BookOpen, Terminal } from 'lucide-react';
import { CodeShowcase } from './CodeShowcase';
import { Newsletter } from './Newsletter';

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-panel hero-panel">
          <div className="hero-section">
            <div className="hero-text-container">
              <div className="badge">Playwright Tutorial 2026</div>
              <h1 className="hero-title">
                Master Web Automation with <span className="gradient-text">Playwright</span>
              </h1>
              <p className="hero-subtitle">
                From zero to hero. Learn to build robust, reliable, and fast end-to-end tests for modern web applications.
              </p>

              <div className="hero-actions">
                <Link to="/docs/Introduction/getting-started" className="cta-button primary">
                  <PlayCircle size={20} />
                  Start Learning
                </Link>
                <a href="https://playwright.dev" target="_blank" rel="noopener noreferrer" className="cta-button secondary">
                  Official Docs
                </a>
              </div>
            </div>

            <div className="hero-image-container">
              <div className="illustration-wrapper">
                <div className="glowing-bg"></div>
                <img
                  src="/img/autowait_resiliency.png"
                  alt="Playwright Auto-wait Resiliency Checklist"
                  className="hero-illustration"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card tool-card">
            <div className="feature-icon"><Terminal size={24} /></div>
            <h3>Modern Tooling</h3>
            <p>Leverage the latest features of Playwright including auto-waiting, web-first assertions, and tracing.</p>
          </div>
          <div className="feature-card lab-card">
            <div className="feature-icon"><Code size={24} /></div>
            <h3>Hands-on Labs</h3>
            <p>Practice what you learn with real-world examples and interactive coding challenges.</p>
          </div>
          <div className="feature-card guide-card">
            <div className="feature-icon"><BookOpen size={24} /></div>
            <h3>Comprehensive</h3>
            <p>Cover everything from basic locators to advanced CI/CD integration and API testing.</p>
          </div>
        </div>

        <CodeShowcase />
        <Newsletter />

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-card">
        {status === 'success' ? (
          <div className="newsletter-success">
            <CheckCircle2 size={48} color="#10b981" />
            <h3>You're on the list!</h3>
            <p>Thanks for subscribing. We'll send you the latest Playwright tips soon.</p>
          </div>
        ) : (
          <div className="newsletter-content">
            <h3>Level Up Your Testing</h3>
            <p>Subscribe to our newsletter for advanced Playwright techniques, interview prep, and automation best practices.</p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <div className="input-wrapper">
                <Mail size={20} className="mail-icon" />
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
              </div>
              <button type="submit" disabled={status === 'loading'} className={status === 'loading' ? 'loading' : ''}>
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'} <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

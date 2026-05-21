import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackWidgetProps {
  docId: string;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ docId }) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`feedback_${docId}`);
    if (saved) {
      setFeedback(saved as 'yes' | 'no');
    } else {
      setFeedback(null); // Reset when docId changes
    }
  }, [docId]);

  const handleFeedback = (type: 'yes' | 'no') => {
    setFeedback(type);
    localStorage.setItem(`feedback_${docId}`, type);
    // Future: send this data to Supabase or analytics backend
    console.log(`Feedback submitted for ${docId}: ${type}`);
  };

  if (feedback) {
    return (
      <div style={{ 
        marginTop: '3rem', 
        padding: '1.5rem', 
        textAlign: 'center',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
          Thank you for your feedback!
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Your input helps us improve the tutorial.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      marginTop: '4rem', 
      padding: '2rem', 
      textAlign: 'center',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-glass)',
      borderRadius: '12px'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
        Was this page helpful?
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button 
          onClick={() => handleFeedback('yes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-glass)';
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.color = '#10b981';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-glass)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ThumbsUp size={18} /> Yes
        </button>
        <button 
          onClick={() => handleFeedback('no')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-glass)';
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-glass)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ThumbsDown size={18} /> No
        </button>
      </div>
    </div>
  );
};

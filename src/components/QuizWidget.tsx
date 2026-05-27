import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface QuizData {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

interface QuizWidgetProps {
  data: QuizData;
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({ data }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected !== null) {
      setSubmitted(true);
    }
  };

  const isCorrect = selected === data.answer;

  return (
    <div className="quiz-widget" style={{ 
      margin: '2rem 0', 
      padding: '1.5rem', 
      backgroundColor: 'var(--bg-primary)', 
      border: '1px solid var(--border-glass)', 
      borderRadius: '0',
      whiteSpace: 'normal',
      fontFamily: 'var(--font-family, system-ui, -apple-system, sans-serif)',
      lineHeight: 1.5
    }}>
      <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        Knowledge Check: {data.question}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {data.options.map((option, idx) => {
          let bgColor = 'var(--bg-secondary)';
          let borderColor = 'var(--border-glass)';
          
          if (submitted) {
            if (idx === data.answer) {
              bgColor = 'rgba(16, 185, 129, 0.1)';
              borderColor = '#10b981';
            } else if (idx === selected) {
              bgColor = 'rgba(239, 68, 68, 0.1)';
              borderColor = '#ef4444';
            }
          } else if (selected === idx) {
            borderColor = 'var(--accent-primary)';
            bgColor = 'var(--bg-glass)';
          }

          return (
            <button
              key={idx}
              onClick={() => !submitted && setSelected(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: '0',
                color: 'var(--text-secondary)',
                cursor: submitted ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontSize: '0.95rem'
              }}
              disabled={submitted}
            >
              <span style={{ whiteSpace: 'normal', flex: 1, paddingRight: '1rem' }}>{option}</span>
              {submitted && idx === data.answer && <CheckCircle2 size={20} color="#10b981" />}
              {submitted && idx === selected && idx !== data.answer && <XCircle size={20} color="#ef4444" />}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button 
          onClick={handleSubmit} 
          disabled={selected === null}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: selected !== null ? 'var(--accent-primary)' : 'var(--border-glass)',
            color: 'white',
            border: 'none',
            borderRadius: '0',
            fontWeight: 600,
            cursor: selected !== null ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
        >
          Check Answer
        </button>
      ) : (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
          borderRadius: '0',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontWeight: 600, color: isCorrect ? '#10b981' : '#ef4444', marginBottom: '0.5rem' }}>
            {isCorrect ? 'Correct!' : 'Incorrect.'}
          </div>
          {data.explanation && (
            <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              {data.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

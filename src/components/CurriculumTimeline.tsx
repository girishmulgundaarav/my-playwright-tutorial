import React from 'react';
import { Link } from 'react-router-dom';
import sidebars from '../sidebars';
import { useProgress } from '../context/ProgressContext';
import { CheckCircle2, Circle } from 'lucide-react';

export const CurriculumTimeline: React.FC = () => {
  const { isCompleted } = useProgress();

  return (
    <section className="curriculum-section">
      <h2 className="section-title">Course Curriculum</h2>
      <p className="section-subtitle">A structured path from basics to advanced automation.</p>
      
      <div className="timeline-container">
        {sidebars.tutorialSidebar.map((category, idx) => {
          if (category.type !== 'category') return null;
          
          return (
            <div key={idx} className="timeline-module">
              <div className="module-header">
                <div className="module-number">Module {idx + 1}</div>
                <h3 className="module-title">{category.label}</h3>
              </div>
              <div className="module-lessons">
                {category.items?.map((lesson, lessonIdx) => {
                  if (lesson.type !== 'doc') return null;
                  const completed = isCompleted(lesson.id!);
                  return (
                    <Link to={`/docs/${lesson.id}`} key={lessonIdx} className={`lesson-item ${completed ? 'completed' : ''}`}>
                      <div className="lesson-status">
                        {completed ? <CheckCircle2 size={20} color="#10b981" /> : <Circle size={20} color="var(--border-glass)" />}
                      </div>
                      <div className="lesson-label">{lesson.label}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

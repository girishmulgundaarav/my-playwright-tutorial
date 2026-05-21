import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProgressContextType {
  completedDocs: string[];
  markAsCompleted: (docId: string) => void;
  isCompleted: (docId: string) => boolean;
  clearProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [completedDocs, setCompletedDocs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('playwright_tutorial_progress');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load progress from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('playwright_tutorial_progress', JSON.stringify(completedDocs));
    } catch (error) {
      console.error('Failed to save progress to localStorage', error);
    }
  }, [completedDocs]);

  const markAsCompleted = (docId: string) => {
    setCompletedDocs(prev => {
      if (prev.includes(docId)) return prev;
      return [...prev, docId];
    });
  };

  const isCompleted = (docId: string) => completedDocs.includes(docId);

  const clearProgress = () => {
    setCompletedDocs([]);
  };

  return (
    <ProgressContext.Provider value={{ completedDocs, markAsCompleted, isCompleted, clearProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DocsLayout } from './components/DocsLayout';
import { LandingPage } from './components/LandingPage';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs/*" element={<DocsLayout />} />
      </Routes>
    </div>
  );
};

export default App;

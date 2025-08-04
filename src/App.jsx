import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AkramProvider } from './contexts/AkramContext';
import Dashboard from './pages/Dashboard';
import RadarView from './pages/RadarView';
import ChaptersView from './pages/ChaptersView';
import PlanView from './pages/PlanView';
import './App.css';

function App() {
  return (
    <AppProvider>
      <AkramProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/radar/:radarId" element={<RadarView />} />
            <Route path="/radar/:radarId/subject/:subjectId" element={<ChaptersView />} />
            <Route path="/plan" element={<PlanView />} />
          </Routes>
        </Router>
      </AkramProvider>
    </AppProvider>
  );
}

export default App;
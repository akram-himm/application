import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AkramProvider } from './contexts/AkramContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RadarView from './pages/RadarView';
import ChaptersView from './pages/ChaptersView';
import PlanView from './pages/PlanView';
import CalendarView from './pages/CalendarView';
import NotesView from './pages/NotesView';
import './App.css';

function App() {
  return (
    <AppProvider>
      <AkramProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/radar/:radarId" element={<RadarView />} />
              <Route path="/radar/:radarId/subject/:subjectId" element={<ChaptersView />} />
              <Route path="/plan" element={<PlanView />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/notes" element={<NotesView />} />
            </Routes>
          </Layout>
        </Router>
      </AkramProvider>
    </AppProvider>
  );
}

export default App;
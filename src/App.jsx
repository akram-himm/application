import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AkramProvider } from './contexts/AkramContext';
// import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Improvements from './pages/Improvements';
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
          <div className="flex h-screen bg-[rgb(25,25,25)]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/improvements" element={<Improvements />} />
                <Route path="/radar/:radarId" element={<RadarView />} />
                <Route path="/radar/:radarId/subject/:subjectId" element={<ChaptersView />} />
                <Route path="/plan" element={<PlanView />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/notes" element={<NotesView />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AkramProvider>
    </AppProvider>
  );
}

export default App;
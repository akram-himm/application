import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AkramProvider } from './contexts/AkramContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import SaveIndicator from './components/ui/SaveIndicator';
import CrashRecovery from './components/CrashRecovery';
// import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DashboardView from './pages/DashboardView';
import HistoryView from './pages/HistoryView';
import Improvements from './pages/Improvements';
import RadarView from './pages/RadarView';
import ChaptersView from './pages/ChaptersView';
import PlanView from './pages/PlanView';
import CalendarView from './pages/CalendarView';
import NotesView from './pages/NotesView';
import TrashView from './pages/TrashView';
import CustomPage from './pages/CustomPage';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <AkramProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <CrashRecovery />
              <SaveIndicator />
              <div className="flex h-screen bg-gradient-to-b from-[#E9E9E9] via-[#F4F4F4] to-[#F9F9F9]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<DashboardView />} />
                      <Route path="/history" element={<HistoryView />} />
                      <Route path="/improvements" element={<Improvements />} />
                      <Route path="/radar/:radarId" element={<RadarView />} />
                      <Route path="/radar/:radarId/subject/:subjectId" element={<ChaptersView />} />
                      <Route path="/plan" element={<PlanView />} />
                      <Route path="/calendar" element={<CalendarView />} />
                      <Route path="/notes" element={<NotesView />} />
                      <Route path="/trash" element={<TrashView />} />
                      <Route path="/page/:pageId" element={<CustomPage />} />
                    </Routes>
                  </ErrorBoundary>
                </main>
              </div>
            </Router>
          </AkramProvider>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AkramProvider } from './contexts/AkramContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { UndoRedoProvider } from './contexts/UndoRedoContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import SaveIndicator from './components/ui/SaveIndicator';
import CrashRecovery from './components/CrashRecovery';
import WorkspaceDebug from './components/WorkspaceDebug';
import UndoRedoBar from './components/UndoRedoBar';
// import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DashboardView from './pages/DashboardView';
import Improvements from './pages/Improvements';
import VisualizationView from './pages/VisualizationView';
import ChaptersView from './pages/ChaptersView';
import PlanView from './pages/PlanView';
import CalendarView from './pages/CalendarView';
import NotesView from './pages/NotesView';
import TrashView from './pages/TrashView';
import CustomPage from './pages/CustomPage';
import PageView from './pages/PageView';
import Settings from './pages/Settings';
import HistoryView from './pages/HistoryView';
import TestLayout from './pages/TestLayout';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WorkspaceProvider>
          <AppProvider>
            <AkramProvider>
              <UndoRedoProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <CrashRecovery />
                <SaveIndicator />
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto">
                    <ErrorBoundary>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<DashboardView />} />
                        <Route path="/improvements" element={<Improvements />} />
                        <Route path="/radar/:radarId" element={<VisualizationView />} />
                        <Route path="/radar/:radarId/subject/:subjectId" element={<ChaptersView />} />
                        <Route path="/plan" element={<PlanView />} />
                        <Route path="/calendar" element={<CalendarView />} />
                        <Route path="/notes" element={<NotesView />} />
                        <Route path="/history" element={<HistoryView />} />
                        <Route path="/trash" element={<TrashView />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/page/:pageId" element={<PageView />} />
                        <Route path="/test-layout" element={<TestLayout />} />
                      </Routes>
                    </ErrorBoundary>
                </main>
              </div>
              <WorkspaceDebug />
              <UndoRedoBar />
              </Router>
              </UndoRedoProvider>
            </AkramProvider>
          </AppProvider>
        </WorkspaceProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FontSizeProvider } from './contexts/FontSizeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthenticatedLayout from './components/AuthenticatedLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CarbonCalculator from './pages/CarbonCalculator';
import CivicReporter from './pages/CivicReporter';
import PlantChecker from './pages/PlantChecker';
import MyReports from './pages/MyReports';
import GreenScore from './pages/GreenScore';
import GreenChallenges from './pages/GreenChallenges';
import Settings from './pages/Settings';
import EcoCityAssistant from './components/EcoCityAssistant';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-eco-50 dark:bg-dark-bg text-stone-900 dark:text-dark-text transition-colors">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />

              {/* Authenticated Routes wrapped in ProtectedRoute & AuthenticatedLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calculator" element={<CarbonCalculator />} />
                <Route path="/civic-reporter" element={<CivicReporter />} />
                <Route path="/plant-checker" element={<PlantChecker />} />
                <Route path="/green-challenges" element={<GreenChallenges />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/green-score" element={<GreenScore />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Official EcoCity Assistant AI Guide */}
            <EcoCityAssistant />
          </BrowserRouter>
        </AuthProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}

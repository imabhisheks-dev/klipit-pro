import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProClipboardCreate } from './components/ProClipboardCreate';
import { ClipboardVersionHistory } from './components/ClipboardVersionHistory';
import { SubscriptionDashboard } from './components/SubscriptionDashboard';
import './styles/App.css';

interface AppState {
  isLoggedIn: boolean;
  user: any | null;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    user: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token is still valid by calling a protected endpoint
          const response = await fetch('http://localhost:5000/health', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            setState({
              isLoggedIn: true,
              user: JSON.parse(localStorage.getItem('user') || '{}')
            });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Klipit Pro...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Klipit Pro</h1>
          <p>Secure Clipboard Management</p>
        </header>

        <main className="app-main">
          {!state.isLoggedIn ? (
            <div className="welcome-container">
              <h2>Welcome to Klipit Pro</h2>
              <p>Please log in or register to get started.</p>
              <div className="login-placeholder">
                <p>Login and Register components coming soon</p>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<ProClipboardCreate onClipboardCreated={() => {}} />} />
              <Route path="/history" element={<ClipboardVersionHistory handle="example" />} />
              <Route path="/subscription" element={<SubscriptionDashboard userId={state.user?.id} />} />
            </Routes>
          )}
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 Klipit Pro. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome to your Klipit Pro dashboard</p>
    </div>
  );
};

export default App;

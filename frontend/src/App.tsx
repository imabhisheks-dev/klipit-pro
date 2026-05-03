import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
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
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setState({
            isLoggedIn: true,
            user: JSON.parse(localStorage.getItem('user') || '{}')
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: any) => {
    setState({
      isLoggedIn: true,
      user
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      isLoggedIn: false,
      user: null
    });
  };

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
          {state.isLoggedIn && (
            <div className="header-user">
              <span>Welcome, {state.user?.username || state.user?.email}!</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </header>

        <main className="app-main">
          {!state.isLoggedIn ? (
            showRegister ? (
              <Register 
                onRegisterSuccess={handleLoginSuccess}
                onSwitchToLogin={() => setShowRegister(false)}
              />
            ) : (
              <div>
                <Login onLoginSuccess={handleLoginSuccess} />
                <div className="auth-switch">
                  <p>Don't have an account? <button onClick={() => setShowRegister(true)} className="link-button">Register</button></p>
                </div>
              </div>
            )
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard user={state.user} />} />
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

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome to your Klipit Pro dashboard, {user?.username || user?.email}!</p>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📝 Create Clipboard</h3>
          <p>Create a new Pro clipboard with advanced features</p>
          <a href="/create" className="dashboard-link">Create</a>
        </div>
        
        <div className="dashboard-card">
          <h3>📊 Version History</h3>
          <p>View and restore previous clipboard versions</p>
          <a href="/history" className="dashboard-link">View History</a>
        </div>
        
        <div className="dashboard-card">
          <h3>⭐ Subscription</h3>
          <p>Manage your Pro subscription and features</p>
          <a href="/subscription" className="dashboard-link">View Subscription</a>
        </div>
      </div>
    </div>
  );
};

export default App;

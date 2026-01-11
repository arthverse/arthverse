import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ArthVerseLanding from './pages/ArthVerseLanding';
import ArthVerseAuth from './pages/ArthVerseAuth';
import ArthVersePortal from './pages/ArthVersePortal';
import Dashboard from './pages/Dashboard';
import FinancialQuestionnaire from './pages/FinancialQuestionnaire';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const handleAuth = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* ArthVerse Main Routes */}
          <Route path="/" element={!token ? <ArthVerseLanding /> : <Navigate to="/arthverse/portal" />} />
          <Route path="/arthverse/auth" element={!token ? <ArthVerseAuth onAuth={handleAuth} /> : <Navigate to="/arthverse/portal" />} />
          <Route 
            path="/arthverse/portal" 
            element={token ? <ArthVersePortal token={token} user={user} onLogout={handleLogout} /> : <Navigate to="/arthverse/auth" />} 
          />

          {/* Arthvyay App Routes */}
          <Route 
            path="/arthvyay/questionnaire" 
            element={token ? <FinancialQuestionnaire token={token} onLogout={handleLogout} /> : <Navigate to="/arthverse/auth" />} 
          />
          <Route 
            path="/arthvyay/dashboard" 
            element={token ? <Dashboard token={token} user={user} onLogout={handleLogout} /> : <Navigate to="/arthverse/auth" />} 
          />
          <Route 
            path="/arthvyay/transactions" 
            element={token ? <Transactions token={token} onLogout={handleLogout} /> : <Navigate to="/arthverse/auth" />} 
          />
          <Route 
            path="/arthvyay/reports" 
            element={token ? <Reports token={token} onLogout={handleLogout} /> : <Navigate to="/arthverse/auth" />} 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;

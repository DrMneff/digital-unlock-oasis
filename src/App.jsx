import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import TrackOrderPage from '@/pages/TrackOrderPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmailConfirmationPage from '@/pages/EmailConfirmationPage';


function App() {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      setSessionLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setSessionLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });
      return () => subscription.unsubscribe();
    };
    getSession();
  }, []);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);


  return (
    
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="signup" element={<AuthPage />} />
          <Route path="forgot-password" element={<AuthPage />} />
          <Route path="email-confirm" element={<EmailConfirmationPage />} />
          
          
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute sessionLoading={sessionLoading}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="track-order" element={<TrackOrderPage />} />
          
          
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route 
            path="admin/dashboard" 
            element={
              <ProtectedRoute adminOnly={true} sessionLoading={sessionLoading}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    
  );
}

export default App;

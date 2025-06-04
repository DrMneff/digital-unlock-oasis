import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false, sessionLoading: appSessionLoading }) => {
  const [session, setSession] = useState(null);
  const [isAdminSessionVerified, setIsAdminSessionVerified] = useState(false); 
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSessionStatus = async () => {
      setLoading(true); 
      if (adminOnly) {
        const adminSessionToken = localStorage.getItem('admin_session');
        // In a real app, you'd verify this token with a backend or Supabase Edge Function
        // For simplicity here, we just check its existence.
        if (adminSessionToken) {
          // You might want to decode and check expiry or call a verification endpoint
          // For now, assume it's valid if it exists.
          setSession({ is_admin: true }); // Simulate a session object for admin
          setIsAdminSessionVerified(true);
        } else {
          setSession(null);
          setIsAdminSessionVerified(false);
        }
      } else {
        // Regular user session check
        const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          setSession(null);
        } else {
          setSession(supabaseSession);
        }

        // Listen for auth state changes for regular users
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, supabaseSessionUpdate) => {
              setSession(supabaseSessionUpdate);
              // No need to setLoading(false) here, initial check handles it
            }
        );
        // Cleanup listener on component unmount
        return () => {
            if (authListener && authListener.subscription) {
              authListener.subscription.unsubscribe();
            }
        };
      }
      // Delay setting loading to false to allow appSessionLoading to propagate if necessary
      // This ensures we don't get a flash of content if the app level session is still loading
      // setTimeout(() => setLoading(false), 100); // Short delay
      setLoading(false);
    };

    if (!appSessionLoading) { // Only run if the app-level session loading is complete
        checkSessionStatus();
    } else {
        setLoading(true); // If app session is loading, this route is also loading
    }

  }, [adminOnly, appSessionLoading, location.key]); // location.key forces re-check on navigation for some edge cases

  if (loading || appSessionLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
        <p className="text-slate-300 ml-3">جاري التحميل...</p>
      </div>
    );
  }

  if (adminOnly) {
    if (!isAdminSessionVerified) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } else { // Regular user
    if (!session) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // Check for email confirmation if the user session exists
    if (session && !session.user.email_confirmed_at) {
        // Redirect to login page with state to show 'emailNotConfirmed' mode
        return <Navigate to="/login" state={{ from: location, emailNotConfirmed: true, email: session.user.email }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
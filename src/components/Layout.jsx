import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { MessageSquare, UserCircle, LogIn, Search, Home, LogOut as LogOutIcon } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { supabase } from '@/lib/supabaseClient'; 
import { useToast } from "@/components/ui/use-toast";
import WhatsAppChatWidget from '@/components/WhatsAppChatWidget';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = React.useState(null);
  const [loadingSession, setLoadingSession] = React.useState(true);
  const ADMIN_WHATSAPP_NUMBER_FOR_CHAT = "966538182861"; // Replace with your actual admin WhatsApp number

  React.useEffect(() => {
    const fetchSession = async () => {
      setLoadingSession(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoadingSession(false);
    };
    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === "SIGNED_OUT") {
        navigate('/'); 
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/email-confirm'].includes(location.pathname);
  
  const showBackButton = !['/', '/admin/dashboard'].includes(location.pathname) && !isAuthRoute && location.pathname !== '/dashboard';

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "خطأ في تسجيل الخروج", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم تسجيل الخروج بنجاح." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col" dir="rtl">
      <header className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
            >
              <img  alt="Drmnef Logo" className="h-10 w-10 rounded-full border-2 border-purple-500" src="https://images.unsplash.com/photo-1691405167344-c3bbc9710ad2" />
            </motion.div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Drmnef
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-1">
              <Home size={18} /> الرئيسية
            </Link>
            <Link to="/track-order" className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-1">
              <Search size={18} /> تتبع طلبك
            </Link>
            {!loadingSession && (
              session ? (
                <>
                  <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-1">
                    <UserCircle size={18} /> حسابي
                  </Link>
                   <button 
                    onClick={handleLogout} 
                    className="text-sm font-medium text-slate-300 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <LogOutIcon size={18} /> تسجيل الخروج
                  </button>
                </>
              ) : (
                !isAuthRoute && ( 
                  <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-1">
                    <LogIn size={18} /> تسجيل الدخول
                  </Link>
                )
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showBackButton && <BackButton />}
        <Outlet />
      </main>
      
      {!isAdminRoute && (
        <>
          <a
            href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER_FOR_CHAT}`} // Direct WhatsApp link
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 transition-transform hover:scale-110"
            aria-label="تواصل عبر واتساب مباشرة"
          >
            <MessageSquare className="w-8 h-8" />
          </a>
          <WhatsAppChatWidget adminPhoneNumber={ADMIN_WHATSAPP_NUMBER_FOR_CHAT} />
        </>
      )}

      <footer className="py-8 text-center text-slate-400 border-t border-slate-700 bg-slate-900">
        <p>للاستفسارات والدعم الفني: <a href="mailto:Dr.mnef@Gmail.Com" className="text-purple-300 hover:underline">Dr.mnef@Gmail.Com</a> | واتساب: <a href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER_FOR_CHAT}`} className="text-purple-300 hover:underline">{ADMIN_WHATSAPP_NUMBER_FOR_CHAT}</a></p>
        <p>&copy; {new Date().getFullYear()} Drmnef. جميع الحقوق محفوظة.</p>
      </footer>
      <Toaster />
    </div>
  );
};

export default Layout;
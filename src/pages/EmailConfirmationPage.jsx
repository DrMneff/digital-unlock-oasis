import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const EmailConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'info', 'updatePasswordPrompt'
  const [message, setMessage] = useState('جاري معالجة طلبك...');

  useEffect(() => {
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const type = hashParams.get('type');
    const errorDescription = hashParams.get('error_description');
    // Supabase JS SDK handles the actual token exchange for email confirmation/recovery automatically in the background
    // when it detects the `access_token` in the URL fragment.
    // This page is primarily to display messages to the user based on the outcome.

    const handleState = async () => {
      if (errorDescription) {
        setStatus('error');
        setMessage(`فشل العملية: ${errorDescription}`);
        return;
      }

      if (type === 'recovery') {
        // User has clicked the password recovery link.
        // Supabase SDK should have set up the session for password update.
        // Navigate user to AuthPage in 'updatePassword' mode.
        setStatus('updatePasswordPrompt');
        setMessage('تم التحقق من رابط استعادة كلمة المرور. سيتم توجيهك الآن لتحديث كلمة المرور.');
        setTimeout(() => {
            // Pass a state to AuthPage to ensure it goes into updatePassword mode
            // The access token in URL fragment is used by Supabase client itself
            navigate('/forgot-password#type=recovery', { state: { isRecoveryFlow: true } }); 
        }, 2500);
        return;
      }
      
      // Default to email confirmation flow if no specific type like 'recovery'
      // Wait a moment for Supabase to potentially confirm the email in the background via onAuthStateChange
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        setStatus('success');
        setMessage('تم تأكيد بريدك الإلكتروني بنجاح! سيتم توجيهك الآن لتسجيل الدخول.');
        setTimeout(() => navigate('/login'), 3000);
      } else if (session && !session.user.email_confirmed_at) {
        setStatus('info');
        setMessage('لم يتم تأكيد بريدك الإلكتروني بعد. إذا كنت قد طلبت رابط تأكيد جديد، يرجى التحقق من بريدك الإلكتروني. يمكنك محاولة تسجيل الدخول للتحقق من الحالة أو طلب رابط جديد.');
      } else if (!session) {
         setStatus('info');
         setMessage('يرجى تسجيل الدخول للتحقق من حالة تأكيد بريدك الإلكتروني أو إذا كنت قد نقرت على رابط استعادة كلمة المرور.');
      } else {
        // Default fallback if still loading or indeterminate state
        setStatus('loading');
        setMessage('ما زلنا نتحقق من حالة طلبك. إذا لم يتم تحديث الصفحة قريبًا، حاول تسجيل الدخول.');
      }
    };

    handleState();

  }, [location, navigate]);

  let icon;
  let title;
  let cardBorderColor;

  switch (status) {
    case 'success':
      icon = <CheckCircle size={60} className="text-green-500" />;
      title = 'تم بنجاح!';
      cardBorderColor = 'border-green-500';
      break;
    case 'error':
      icon = <AlertTriangle size={60} className="text-red-500" />;
      title = 'خطأ في العملية';
      cardBorderColor = 'border-red-500';
      break;
    case 'info':
    case 'updatePasswordPrompt':
      icon = <Info size={60} className="text-blue-500" />;
      title = 'معلومات';
      cardBorderColor = 'border-blue-500';
      break;
    default: // loading
      icon = <Loader2 size={60} className="text-purple-500 animate-spin" />;
      title = 'جاري التحقق...';
      cardBorderColor = 'border-purple-500';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] py-8 px-4"
    >
      <Card className={`w-full max-w-lg bg-slate-800/80 shadow-xl text-center ${cardBorderColor} border-2`}>
        <CardHeader>
          <div className="flex justify-center mb-6">
            {icon}
          </div>
          <CardTitle className={`text-3xl font-bold ${
            status === 'success' ? 'text-green-400' :
            status === 'error' ? 'text-red-400' : 
            (status === 'info' || status === 'updatePasswordPrompt') ? 'text-blue-400' : 'text-purple-400'
          } mb-2`}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-300 text-lg">{message}</p>
          {(status === 'success' || status === 'error' || status === 'info') && status !== 'updatePasswordPrompt' && (
            <Button asChild className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-lg py-3 px-6">
              <Link to="/login">الانتقال إلى صفحة تسجيل الدخول</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmailConfirmationPage;
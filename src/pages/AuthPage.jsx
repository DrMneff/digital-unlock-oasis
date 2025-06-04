import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, LogIn, UserPlus, Mail, KeyRound, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(''); // New state for phone number
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgotPassword', 'updatePassword'
  const [resetToken, setResetToken] = useState(null);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendEmailAddress, setResendEmailAddress] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const token = params.get('access_token'); // For password recovery
    const error = params.get('error_description');

    if (error) {
      toast({ title: "خطأ في المصادقة", description: decodeURIComponent(error), variant: "destructive" });
      navigate('/login', { replace: true });
    }
    
    if (type === 'recovery' && token) {
      setAuthMode('updatePassword');
      setResetToken(token); // Store token to use for password update
    } else if (location.pathname === '/signup') {
      setAuthMode('signup');
    } else if (location.pathname === '/forgot-password') {
      setAuthMode('forgotPassword');
    } else {
      setAuthMode('login');
    }
  }, [location, navigate, toast]);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResendEmail(false);
    setResendEmailAddress('');

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين.", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone, // Add phone to user metadata
          },
          emailRedirectTo: `${window.location.origin}/email-confirm`,
        },
      });
      if (error) {
        toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
      } else if (data.user && !data.user.email_confirmed_at) {
        toast({ title: "تم التسجيل بنجاح!", description: "لقد أرسلنا رابط تأكيد إلى بريدك الإلكتروني. يرجى التحقق منه لتفعيل حسابك." });
        setAuthMode('login'); // Switch to login view or a dedicated "check email" view
      } else if (data.user && data.user.email_confirmed_at) {
        toast({ title: "تم التسجيل بنجاح!", description: "تم تأكيد بريدك الإلكتروني تلقائيًا." });
        navigate('/dashboard');
      }
    } else if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
        if (error.message.includes("Email not confirmed")) {
            setShowResendEmail(true);
            setResendEmailAddress(email);
        }
      } else if (data.user) {
        if (!data.user.email_confirmed_at) {
            toast({ title: "تأكيد البريد الإلكتروني مطلوب", description: "يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد الخاص بك.", variant: "default" });
            setShowResendEmail(true);
            setResendEmailAddress(email);
        } else {
            toast({ title: "تم تسجيل الدخول بنجاح!" });
            navigate(data.user.user_metadata?.is_admin ? '/admin/dashboard' : '/dashboard');
        }
      }
    } else if (authMode === 'forgotPassword') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?type=recovery`,
      });
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم إرسال رابط إعادة التعيين", description: "إذا كان البريد الإلكتروني موجودًا، ستصلك رسالة لإعادة تعيين كلمة المرور." });
      }
    } else if (authMode === 'updatePassword') {
      if (password !== confirmPassword) {
        toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين.", variant: "destructive" });
        setLoading(false);
        return;
      }
      // No need to use resetToken directly here if user is already "in session" from clicking the link
      // Supabase handles this context. If not, you'd use updateUser with the token.
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "خطأ في تحديث كلمة المرور", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم تحديث كلمة المرور بنجاح!", description: "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة." });
        navigate('/login');
      }
    }
    setLoading(false);
  };

  const handleResendConfirmationEmail = async () => {
    if (!resendEmailAddress) {
        toast({ title: "خطأ", description: "البريد الإلكتروني غير متوفر لإعادة الإرسال.", variant: "destructive" });
        return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmailAddress,
        options: {
            emailRedirectTo: `${window.location.origin}/email-confirm`,
        }
    });
    if (error) {
        toast({ title: "خطأ", description: `فشل إرسال بريد التأكيد: ${error.message}`, variant: "destructive" });
    } else {
        toast({ title: "تم الإرسال", description: "تم إرسال بريد تأكيد جديد. يرجى التحقق من صندوق الوارد الخاص بك." });
    }
    setLoading(false);
    setShowResendEmail(false);
  };


  const getTitle = () => {
    if (authMode === 'signup') return "إنشاء حساب جديد";
    if (authMode === 'forgotPassword') return "إعادة تعيين كلمة المرور";
    if (authMode === 'updatePassword') return "تحديث كلمة المرور";
    return "تسجيل الدخول";
  };

  const getButtonText = () => {
    if (authMode === 'signup') return "إنشاء حساب";
    if (authMode === 'forgotPassword') return "إرسال رابط إعادة التعيين";
    if (authMode === 'updatePassword') return "تحديث كلمة المرور";
    return "تسجيل الدخول";
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="w-full max-w-md bg-slate-800/70 border-slate-700 shadow-2xl shadow-purple-500/10">
        <CardHeader className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <img src="https://images.unsplash.com/photo-1691405167344-c3bbc9710ad2" alt="Drmnef Logo" className="w-20 h-20 mx-auto rounded-full border-4 border-purple-500 shadow-lg" />
          </motion.div>
          <CardTitle className="text-3xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">{getTitle()}</CardTitle>
          {authMode === 'login' && <CardDescription className="text-slate-400">مرحباً بعودتك! أدخل بياناتك للمتابعة.</CardDescription>}
          {authMode === 'signup' && <CardDescription className="text-slate-400">انضم إلينا! املأ النموذج أدناه.</CardDescription>}
          {authMode === 'forgotPassword' && <CardDescription className="text-slate-400">أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.</CardDescription>}
          {authMode === 'updatePassword' && <CardDescription className="text-slate-400">أدخل كلمة المرور الجديدة.</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuthAction} className="space-y-6">
            {authMode === 'signup' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="fullName" className="text-slate-300">الاسم الكامل</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <Input id="fullName" type="text" placeholder="مثال: عبدالله محمد" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-slate-700 border-slate-600 placeholder-slate-500 pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-300">رقم الهاتف (مع رمز الدولة)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <Input id="phone" type="tel" placeholder="مثال: 966501234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-700 border-slate-600 placeholder-slate-500 pl-10" />
                  </div>
                   <p className="text-xs text-slate-400 mt-1">اختياري, يستخدم لإشعارات SMS حول طلباتك.</p>
                </div>
              </div>
            )}

            {(authMode === 'login' || authMode === 'signup' || authMode === 'forgotPassword') && (
              <div>
                <Label htmlFor="email" className="text-slate-300">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <Input id="email" type="email" placeholder="example@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-700 border-slate-600 placeholder-slate-500 pl-10" />
                </div>
              </div>
            )}

            {(authMode === 'login' || authMode === 'signup' || authMode === 'updatePassword') && (
              <div>
                <Label htmlFor="password"className="text-slate-300">كلمة المرور</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-slate-700 border-slate-600 placeholder-slate-500 pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {(authMode === 'signup' || authMode === 'updatePassword') && (
              <div>
                <Label htmlFor="confirmPassword"className="text-slate-300">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-slate-700 border-slate-600 placeholder-slate-500 pl-10 pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-semibold py-3" disabled={loading}>
              {loading ? 'جاري المعالجة...' : getButtonText()}
              {(authMode === 'login' && !loading) && <LogIn className="mr-2 h-5 w-5" />}
              {(authMode === 'signup' && !loading) && <UserPlus className="mr-2 h-5 w-5" />}
            </Button>

            {showResendEmail && (
                <div className="text-center mt-4">
                    <p className="text-sm text-slate-300 mb-2">لم تستلم بريد التأكيد؟</p>
                    <Button variant="link" onClick={handleResendConfirmationEmail} disabled={loading} className="text-purple-400 hover:text-purple-300">
                        {loading ? 'جاري الإرسال...' : 'إعادة إرسال بريد التأكيد'}
                    </Button>
                </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3">
          {authMode === 'login' && (
            <>
              <Button variant="link" onClick={() => { setAuthMode('forgotPassword'); navigate('/forgot-password', { replace: true }); }} className="text-sm text-slate-400 hover:text-purple-300">نسيت كلمة المرور؟</Button>
              <p className="text-sm text-slate-400">
                ليس لديك حساب؟ <Button variant="link" onClick={() => { setAuthMode('signup'); navigate('/signup', { replace: true }); }} className="text-purple-400 hover:text-purple-300">إنشاء حساب جديد</Button>
              </p>
            </>
          )}
          {authMode === 'signup' && (
            <p className="text-sm text-slate-400">
              لديك حساب بالفعل؟ <Button variant="link" onClick={() => { setAuthMode('login'); navigate('/login', { replace: true }); }} className="text-purple-400 hover:text-purple-300">تسجيل الدخول</Button>
            </p>
          )}
          {(authMode === 'forgotPassword' || authMode === 'updatePassword') && (
            <p className="text-sm text-slate-400">
              تذكرت كلمة المرور؟ <Button variant="link" onClick={() => { setAuthMode('login'); navigate('/login', { replace: true }); }} className="text-purple-400 hover:text-purple-300">تسجيل الدخول</Button>
            </p>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AuthPage;
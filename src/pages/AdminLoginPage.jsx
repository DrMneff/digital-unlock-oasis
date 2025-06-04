import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'; // Using supabase for potential future direct DB calls if needed, though admin auth is custom here.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

// This is a simplified client-side "authentication" for the admin.
// In a real-world scenario, admin authentication MUST be handled securely on the backend.
// This example simulates a check against a predefined username and a hashed password (which should be fetched from DB).

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded credentials for demonstration - REPLACE with secure backend authentication.
    // The password here ('Mnef') is just for comparison. The one in DB is a placeholder hash.
    // In a real app, you'd send `password` to a backend, backend hashes it and compares with DB hash.
    if (username === 'Drmnef' && password === 'Mnef') { 
      // Simulate fetching the admin user from your custom `admin_users` table
      // For this example, we assume password verification would happen on a backend.
      // Here, we're just checking plain text which is INSECURE.
      
      // Placeholder for fetching hashed password from DB and comparing
      // const { data: adminUser, error } = await supabase
      //   .from('admin_users')
      //   .select('password_hash')
      //   .eq('username', username)
      //   .single();

      // if (error || !adminUser) {
      //   toast({ title: 'خطأ في الدخول', description: 'اسم المستخدم أو كلمة المرور غير صحيحة.', variant: 'destructive' });
      //   setLoading(false);
      //   return;
      // }

      // const passwordsMatch = await comparePasswordWithHash(password, adminUser.password_hash); // Implement this securely
      // if (passwordsMatch) {
      localStorage.setItem('admin_session', JSON.stringify({ username, loggedInAt: Date.now() }));
      toast({ title: 'تم تسجيل الدخول كمدير بنجاح!' });
      navigate('/admin/dashboard');
      // } else {
      //   toast({ title: 'خطأ في الدخول', description: 'اسم المستخدم أو كلمة المرور غير صحيحة.', variant: 'destructive' });
      // }
    } else {
      toast({ title: 'خطأ في الدخول', description: 'اسم المستخدم أو كلمة المرور غير صحيحة.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center py-8"
    >
      <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 shadow-xl">
        <CardHeader className="text-center">
          <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">دخول المدير</CardTitle>
          <CardDescription className="text-slate-400">الرجاء إدخال بيانات اعتماد المدير للوصول.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-slate-300">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:border-yellow-500"
                placeholder="Drmnef"
              />
            </div>
            <div className="relative">
              <Label htmlFor="password" className="text-slate-300">كلمة المرور</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:border-yellow-500 pr-10"
                placeholder="********"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-9 text-slate-400 hover:text-yellow-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-lg py-3">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminLoginPage;
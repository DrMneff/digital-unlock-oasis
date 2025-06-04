import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Package, Users, Settings, LogOut, ShoppingBag, Layers3, PlusCircle, Server as ServerIcon, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import OrderManagement from '@/components/admin/OrderManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import StockManagement from '@/components/admin/StockManagement';
import UserManagement from '@/components/admin/UserManagement'; 
// Placeholder for SettingsManagement when/if created

const AdminDashboardPage = () => {
  const [currentView, setCurrentView] = useState('orders'); // 'orders', 'products', 'stock', 'users', 'settings'
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!localStorage.getItem('admin_session')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    toast({ title: 'تم تسجيل الخروج كمدير.' });
    navigate('/admin/login');
  };

  const renderView = () => {
    switch (currentView) {
      case 'orders':
        return <OrderManagement />;
      case 'products':
        return <ProductManagement />;
      case 'stock':
        return <StockManagement />;
      case 'users':
        return <UserManagement />;
      // case 'settings':
      //   return <SettingsManagement />;
      default:
        return <OrderManagement />;
    }
  };

  const menuItems = [
    { id: 'orders', label: 'إدارة الطلبات', icon: Package, component: <OrderManagement /> },
    { id: 'products', label: 'إدارة المنتجات', icon: ShoppingBag, component: <ProductManagement /> },
    { id: 'stock', label: 'إدارة المخزون', icon: Layers3, component: <StockManagement /> },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, component: <UserManagement /> },
    // { id: 'settings', label: 'الإعدادات', icon: Settings, component: <SettingsManagement /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Card className="bg-slate-800/80 border-slate-700 shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 flex items-center">
              <ShieldCheck className="mr-2 h-8 w-8"/> لوحة تحكم المدير
            </CardTitle>
            <CardDescription className="text-slate-400">إدارة الطلبات، المنتجات، المخزون، المستخدمين، والخدمات.</CardDescription>
          </div>
          <Button onClick={handleLogout} variant="outline" className="bg-red-600 hover:bg-red-700 border-red-700 text-white self-start sm:self-center">
            <LogOut className="ml-2 h-4 w-4" /> تسجيل الخروج
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4 mb-6">
            {menuItems.map(item => (
              <Button 
                key={item.id}
                onClick={() => setCurrentView(item.id)} 
                variant={currentView === item.id ? "default" : "outline"} 
                className={`${currentView === item.id ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'} transition-all duration-150 ease-in-out`}
              >
                <item.icon className="ml-2 h-4 w-4" /> {item.label}
              </Button>
            ))}
          </div>
          {renderView()}
        </CardContent>
      </Card>

      {/* Fallback for views not yet fully implemented or if renderView returns null */}
      {!menuItems.find(item => item.id === currentView)?.component && (
         <Card className="bg-slate-800/80 border-slate-700 shadow-xl">
            <CardHeader><CardTitle className="text-yellow-300">قيد التطوير</CardTitle></CardHeader>
            <CardContent><p className="text-slate-400">هذه الميزة لا تزال قيد التطوير وستكون متاحة قريبًا.</p></CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default AdminDashboardPage;
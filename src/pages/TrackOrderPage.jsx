import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, ServerOff as ServerIcon, WrapText as ReceiptText } from 'lucide-react';
import { motion } from 'framer-motion';

const statusColors = {
  'Pending Payment': 'bg-yellow-500/80',
  'Pending Bank Confirmation': 'bg-orange-500/80',
  'Payment Initiated (PayPal)': 'bg-blue-500/80',
  'Payment Confirmed': 'bg-sky-500/80',
  'In Progress': 'bg-indigo-500/80',
  'Completed': 'bg-green-500/80',
  'Cancelled': 'bg-red-500/80',
};

const TrackOrderPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('orderId'); // 'orderId' or 'email'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم الطلب أو البريد الإلكتروني.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setOrders([]);

    try {
      let query = supabase.from('service_requests').select('*');
      if (searchType === 'orderId') {
        query = query.eq('id', searchTerm.trim());
      } else {
        query = query.eq('email', searchTerm.trim());
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(data);
        toast({ title: 'تم العثور على الطلبات!' });
      } else {
        toast({ title: 'لا توجد نتائج', description: 'لم يتم العثور على طلبات تطابق بحثك.', variant: 'default' });
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء البحث عن الطلب.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-slate-800/80 border-slate-700 shadow-xl">
        <CardHeader className="text-center">
          <ReceiptText className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">تتبع طلبك</CardTitle>
          <CardDescription className="text-slate-400">أدخل رقم طلبك أو بريدك الإلكتروني لعرض حالة طلباتك.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex space-x-2 space-x-reverse">
              <Button 
                type="button" 
                variant={searchType === 'orderId' ? 'default' : 'outline'} 
                onClick={() => setSearchType('orderId')}
                className={searchType === 'orderId' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'}
              >
                رقم الطلب
              </Button>
              <Button 
                type="button" 
                variant={searchType === 'email' ? 'default' : 'outline'} 
                onClick={() => setSearchType('email')}
                className={searchType === 'email' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'}
              >
                البريد الإلكتروني
              </Button>
            </div>
            <div>
              <Label htmlFor="searchTerm" className="text-slate-300">
                {searchType === 'orderId' ? 'رقم الطلب' : 'البريد الإلكتروني'}
              </Label>
              <Input
                id="searchTerm"
                type={searchType === 'orderId' ? 'text' : 'email'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:border-purple-500"
                placeholder={searchType === 'orderId' ? 'مثال: abc-123-xyz' : 'example@example.com'}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />} بحث
            </Button>
          </form>

          {orders.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold text-purple-300">نتائج البحث:</h3>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                <Card className="bg-slate-700/70 border-slate-600">
                  <CardHeader className="pb-3">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <CardTitle className="text-lg text-purple-300 mb-1 sm:mb-0">{order.service_name}</CardTitle>
                        <Badge className={`${statusColors[order.status] || 'bg-gray-500'} text-white text-xs`}>{order.status || 'غير محدد'}</Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-400">رقم الطلب: <span className="font-mono">{order.id}</span></CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-300 space-y-1">
                    <p>تاريخ الطلب: {formatDate(order.created_at)}</p>
                    {order.payment_method && <p>طريقة الدفع: {order.payment_method === 'paypal' ? 'PayPal' : 'تحويل بنكي'}</p>}
                    <p>البريد الإلكتروني: {order.email}</p>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </div>
          )}
          {!loading && orders.length === 0 && searchTerm && (
             <div className="text-center py-10 mt-6">
              <ServerIcon className="mx-auto h-12 w-12 text-slate-500" />
              <p className="mt-4 text-slate-400">لم يتم العثور على طلبات تطابق معايير البحث الخاصة بك.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrackOrderPage;
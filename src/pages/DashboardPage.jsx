import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Package, LogOut, RefreshCw, ServerOff as ServerIcon, Eye, Copy, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import InvoiceView from '@/components/InvoiceView';


const statusColors = {
  'Pending Payment': 'bg-yellow-500/80',
  'Pending Bank Confirmation': 'bg-orange-500/80',
  'Payment Initiated': 'bg-blue-500/80',
  'Payment Confirmed': 'bg-sky-500/80',
  'In Progress': 'bg-indigo-500/80',
  'Awaiting Stock': 'bg-purple-500/80',
  'Ready for Delivery': 'bg-cyan-500/80',
  'Shipped': 'bg-teal-500/80',
  'Delivered': 'bg-lime-500/80',
  'Completed': 'bg-green-500/80',
  'Cancelled': 'bg-red-500/80',
  'Refunded': 'bg-gray-600/80',
  'Failed': 'bg-rose-600/80',
  'Inquiry Received': 'bg-slate-500/80',
  'قيد التجهيز': 'bg-amber-600/80',
  'منتهي': 'bg-neutral-600/80',
};

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStockDataModal, setShowStockDataModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchOrders(session.user.id);
      } else {
        navigate('/login');
      }
      setLoading(false);
    };
    fetchUserData();
  }, [navigate]);

  const fetchOrders = async (userId) => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, digital_product_id (id, name, product_type), purchased_stock_id (id, stock_data), service_request_id(id, service_name, raw_form_data)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      setError(err.message);
      toast({ title: "خطأ", description: "لم نتمكن من جلب طلباتك.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleShowStockData = (order) => {
    setSelectedOrder(order);
    setShowStockDataModal(true);
  };
  
  const handleViewInvoice = (order) => {
    if (order.invoice_details) {
      setViewingInvoice(order);
    } else {
      toast({ title: "لا توجد فاتورة", description: "تفاصيل الفاتورة غير متوفرة لهذا الطلب.", variant: "default"});
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "تم النسخ!", description: "تم نسخ البيانات إلى الحافظة.", icon: <CheckCircle className="text-green-500" /> });
    }, () => {
      toast({ title: "فشل النسخ", description: "لم نتمكن من نسخ البيانات.", variant: "destructive" });
    });
  };
  
  const getProductName = (order) => {
    if (order.digital_product_id?.name) return order.digital_product_id.name;
    if (order.service_request_id?.service_name) return order.service_request_id.service_name;
    if (order.cart_items_snapshot && order.cart_items_snapshot.length > 0) {
        return `طلب سلة (${order.cart_items_snapshot.length} منتجات)`;
    }
    return 'طلب غير محدد';
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-4 md:p-6"
    >
      <Card className="bg-slate-800/70 border-slate-700 shadow-xl mb-8">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">لوحة تحكم المستخدم</CardTitle>
            {user && <CardDescription className="text-slate-400 mt-1">مرحباً بك، {user.user_metadata?.full_name || user.email}</CardDescription>}
          </div>
          <Button onClick={handleLogout} variant="outline" className="mt-4 sm:mt-0 border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
            <LogOut className="mr-2 h-4 w-4" /> تسجيل الخروج
          </Button>
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-semibold mb-6 text-slate-100 flex items-center">
        <Package className="mr-3 text-purple-400" /> طلباتك ({orders.length})
        <Button variant="ghost" size="icon" onClick={() => user && fetchOrders(user.id)} className="mr-auto" disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </h2>

      {error && <p className="text-red-500 bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}
      
      {loading && orders.length === 0 && (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-slate-300 ml-3">جاري تحميل طلباتك...</p>
         </div>
      )}

      {!loading && orders.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700 text-center py-10">
            <CardContent>
                <ServerIcon className="mx-auto h-16 w-16 text-slate-500" />
                <p className="mt-4 text-lg text-slate-400">ليس لديك طلبات حالياً.</p>
                <Button onClick={() => navigate('/')} className="mt-6 bg-purple-600 hover:bg-purple-700">
                    تصفح الخدمات
                </Button>
            </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-700/60 border-slate-600 hover:shadow-purple-500/20 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-purple-300">{getProductName(order)}</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      رقم الطلب: <span className="font-mono">{order.id}</span> | تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-SA')}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusColors[order.order_status] || 'bg-gray-500'} text-white text-xs whitespace-nowrap mt-2 sm:mt-0`}>
                    {order.order_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                <p>المبلغ الإجمالي: <span className="font-semibold text-green-400">{order.total_amount} ريال</span></p>
                <p>طريقة الدفع: <span className="font-medium">{order.payment_method === 'bank_transfer' ? 'تحويل بنكي' : order.payment_method}</span></p>
                {(order.order_status === 'Completed' || order.order_status === 'Delivered') && 
                  (order.purchased_stock_id?.stock_data || (order.service_request_id?.raw_form_data?.report_details && order.digital_product_id?.product_type === 'service_report')) && (
                  <Button 
                    onClick={() => handleShowStockData(order)} 
                    variant="secondary" 
                    size="sm" 
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Eye className="mr-2 h-4 w-4" /> عرض المنتج/التقرير المستلم
                  </Button>
                )}
                 {order.invoice_details && (
                    <Button 
                        onClick={() => handleViewInvoice(order)} 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 mr-2 border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-white"
                    >
                        <FileText className="mr-2 h-4 w-4" /> عرض الفاتورة
                    </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedOrder && (
        <Dialog open={showStockDataModal} onOpenChange={setShowStockDataModal}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-purple-300">تفاصيل المنتج/التقرير المستلم</DialogTitle>
              <DialogDescription className="text-slate-400">
                هذه هي البيانات الخاصة بطلبك <span className="font-mono text-xs">{selectedOrder.id.substring(0,8)}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 space-y-3 max-h-[60vh] overflow-y-auto p-1">
              {selectedOrder.purchased_stock_id?.stock_data && (
                <>
                  <p className="font-semibold text-slate-200">بيانات المنتج (كود/اشتراك):</p>
                  <pre className="bg-slate-900 p-3 rounded-md text-sm text-slate-300 whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedOrder.purchased_stock_id.stock_data, null, 2)}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(JSON.stringify(selectedOrder.purchased_stock_id.stock_data, null, 2))}
                    className="text-sky-400 hover:text-sky-300 mt-1"
                  >
                    <Copy className="mr-2 h-4 w-4"/> نسخ البيانات
                  </Button>
                </>
              )}
              {selectedOrder.service_request_id?.raw_form_data?.report_details && selectedOrder.digital_product_id?.product_type === 'service_report' && (
                <>
                   <p className="font-semibold text-slate-200 mt-4">تفاصيل تقرير الخدمة:</p>
                    <pre className="bg-slate-900 p-3 rounded-md text-sm text-slate-300 whitespace-pre-wrap break-all">
                        {selectedOrder.service_request_id.raw_form_data.report_details}
                    </pre>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(selectedOrder.service_request_id.raw_form_data.report_details)}
                        className="text-sky-400 hover:text-sky-300 mt-1"
                    >
                        <Copy className="mr-2 h-4 w-4"/> نسخ التقرير
                    </Button>
                </>
              )}
            </div>
             <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" className="border-slate-600 hover:bg-slate-700 text-slate-300">إغلاق</Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {viewingInvoice && (
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl p-0 print:bg-white print:text-black">
                <InvoiceView order={viewingInvoice} onClose={() => setViewingInvoice(null)} />
            </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default DashboardPage;
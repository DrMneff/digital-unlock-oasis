import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Filter, RefreshCw, ShoppingCart, Server as ServerIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import OrderTable from '@/components/admin/ordermanagement/OrderTable';
import OrderFilters from '@/components/admin/ordermanagement/OrderFilters';
import EditOrderDialog from '@/components/admin/ordermanagement/EditOrderDialog';
import OrderPagination from '@/components/admin/ordermanagement/OrderPagination';
import InvoiceView from '@/components/InvoiceView'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


export const statusOptions = [
  'Pending Payment', 
  'Pending Bank Confirmation', 
  'Payment Initiated', 
  'Payment Confirmed', 
  'In Progress', 
  'Awaiting Stock',
  'Ready for Delivery',
  'Shipped',
  'Delivered',
  'Completed', 
  'Cancelled', 
  'Refunded',
  'Failed',
  'Inquiry Received',
  'قيد التجهيز', 
  'منتهي' 
];

export const statusColors = {
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

const ITEMS_PER_PAGE = 10;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null); 
  const [availableStock, setAvailableStock] = useState([]);
  const [selectedStockId, setSelectedStockId] = useState('');
  
  const [filters, setFilters] = useState({ status: '', searchTerm: '', productId: '' });
  const [sortBy, setSortBy] = useState({ column: 'created_at', ascending: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, digital_product_id (id, name, product_type), service_request_id (id, service_name, raw_form_data, email, customer_phone), purchased_stock_id (id, stock_data)', { count: 'exact' })
        .order(sortBy.column, { ascending: sortBy.ascending })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE -1);

      if (filters.status) query = query.eq('order_status', filters.status);
      if (filters.productId) query = query.eq('digital_product_id', filters.productId); 
      if (filters.searchTerm) {
        query = query.or(`id.cs.${filters.searchTerm},service_request_id(id.cs.${filters.searchTerm}),digital_product_id(name.cs.${filters.searchTerm}),service_request_id(email.cs.${filters.searchTerm})`);
      }
      
      const { data, error, count } = await query;
      if (error) throw error;
      setOrders(data || []);
      setTotalOrders(count || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({ title: 'خطأ', description: 'لم نتمكن من جلب الطلبات.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, filters, sortBy, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchAvailableStock = async (productId) => {
    if (!productId) {
        setAvailableStock([]);
        return;
    }
    try {
        const { data, error } = await supabase
            .from('product_stock')
            .select('id, stock_data')
            .eq('product_id', productId)
            .eq('is_available', true);
        if (error) throw error;
        setAvailableStock(data || []);
    } catch (error) {
        console.error("Error fetching available stock:", error);
        toast({ title: "خطأ", description: "لم نتمكن من جلب المخزون المتوفر.", variant: "destructive" });
    }
  };
  
  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setSelectedStockId(''); 
    if (order.digital_product_id?.id && order.digital_product_id?.product_type !== 'service_report') {
        fetchAvailableStock(order.digital_product_id.id);
    } else {
        setAvailableStock([]);
    }
  };

  const handleViewInvoice = (order) => {
    if (order.invoice_details) {
      setViewingInvoice(order);
    } else {
      toast({ title: "لا توجد فاتورة", description: "تفاصيل الفاتورة غير متوفرة لهذا الطلب.", variant: "default"});
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    let updateData = { 
        order_status: editingOrder.order_status,
    };
    
    if ((editingOrder.order_status === 'Completed' || editingOrder.order_status === 'Delivered' || editingOrder.order_status === 'Shipped') && !editingOrder.invoice_details) {
        const itemsForInvoice = editingOrder.digital_product_id ? [{ 
                                name: editingOrder.digital_product_id.name, 
                                quantity: 1, 
                                unit_price: editingOrder.total_amount 
                              }] : [];
        const customerEmail = editingOrder.service_request_id?.email || editingOrder.user_id; 
        const customerName = editingOrder.service_request_id?.raw_form_data?.name || editingOrder.service_request_id?.email?.split('@')[0] || 'عميل';
        const customerPhone = editingOrder.service_request_id?.customer_phone || editingOrder.service_request_id?.raw_form_data?.phone || null;

        updateData.invoice_details = {
            invoice_number: `INV-${editingOrder.id.substring(0, 8).toUpperCase()}`,
            issue_date: new Date().toISOString(),
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            items: itemsForInvoice.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit_price: parseFloat(item.unit_price),
              total_price: parseFloat(item.unit_price) * item.quantity
            })),
            subtotal: editingOrder.total_amount,
            tax: 0, 
            total: editingOrder.total_amount,
            payment_method: editingOrder.payment_method,
            payment_status_details: editingOrder.order_status,
            company_info: { name: "Drmnef", address: "المملكة العربية السعودية", email: "Dr.mnef@Gmail.Com", phone: "+966538182861" },
        };
    }


    if ((editingOrder.order_status === 'Completed' || editingOrder.order_status === 'Delivered') && 
        editingOrder.digital_product_id?.product_type !== 'service_report' && 
        !editingOrder.purchased_stock_id) {
        
        if (editingOrder.digital_product_id) {
            if (!selectedStockId) {
                toast({ title: "خطأ", description: "يرجى اختيار عنصر من المخزون لتسليمه للعميل.", variant: "destructive" });
                return;
            }
            updateData.purchased_stock_id = selectedStockId;
        }
    }
    
    try {
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', editingOrder.id);
      if (error) throw error;

      if (updateData.purchased_stock_id) { 
        const { error: stockError } = await supabase
          .from('product_stock')
          .update({ is_available: false })
          .eq('id', updateData.purchased_stock_id);
        if (stockError) throw stockError;
      }
      
      if (editingOrder.service_request_id?.id) {
        await supabase
          .from('service_requests')
          .update({ status: editingOrder.order_status, raw_form_data: editingOrder.service_request_id.raw_form_data })
          .eq('id', editingOrder.service_request_id.id);
      }

      toast({ title: 'نجاح', description: 'تم تحديث حالة الطلب بنجاح.' });
      
      // Client Notification
      if (editingOrder.service_request_id?.email || editingOrder.service_request_id?.customer_phone) {
        const clientNotificationPayload = {
          orderUpdateDetails: {
            orderId: editingOrder.id,
            newStatus: editingOrder.order_status,
            productName: editingOrder.digital_product_id?.name || editingOrder.service_request_id?.service_name || 'طلبك',
            customerEmail: editingOrder.service_request_id.email,
            customerPhone: editingOrder.service_request_id.customer_phone || editingOrder.service_request_id.raw_form_data?.phone,
            customerName: editingOrder.service_request_id.raw_form_data?.name || editingOrder.service_request_id.email?.split('@')[0],
            reportDetails: editingOrder.order_status === 'Completed' && editingOrder.digital_product_id?.product_type === 'service_report' 
                           ? editingOrder.service_request_id.raw_form_data?.report_details 
                           : (editingOrder.purchased_stock_id?.stock_data ? `بيانات المنتج المسلم: ${JSON.stringify(editingOrder.purchased_stock_id.stock_data, null, 2)}` : null)
          }
        };
        supabase.functions.invoke('client-order-update-notification', { body: clientNotificationPayload })
          .then(response => console.log('Client notification sent:', response))
          .catch(error => console.error('Error sending client notification:', error));
      }

      fetchOrders(); 
      setEditingOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      toast({ title: 'خطأ', description: `لم نتمكن من تحديث الطلب: ${error.message}`, variant: 'destructive' });
    }
  };
  
  const handleDeleteOrder = async (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'نجاح', description: 'تم حذف الطلب.' });
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({ title: 'خطأ', description: 'لم نتمكن من حذف الطلب. قد يكون مرتبطًا بطلبات خدمة.', variant: 'destructive' });
    }
  };

  const handleSort = (column) => {
    setSortBy(prevSortBy => ({
      column,
      ascending: prevSortBy.column === column ? !prevSortBy.ascending : true,
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  return (
    <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <CardTitle className="text-2xl text-yellow-300 flex items-center"><ShoppingCart className="ml-2 h-6 w-6"/> إدارة الطلبات ({totalOrders})</CardTitle>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className={`h-5 w-5 ${showFilters ? 'text-purple-400' : 'text-slate-400'}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={fetchOrders} disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5 text-slate-400 hover:text-yellow-300" />}
                </Button>
            </div>
        </div>
        <AnimatePresence>
        {showFilters && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
            >
              <OrderFilters filters={filters} setFilters={setFilters} onApplyFilters={() => { fetchOrders(); setCurrentPage(1); }} statusOptions={statusOptions} />
            </motion.div>
        )}
        </AnimatePresence>
      </CardHeader>
      <CardContent>
        {loading && !orders.length ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            <p className="text-slate-300 ml-2">جاري تحميل الطلبات...</p>
          </div>
        ) : orders.length > 0 ? (
          <>
            <OrderTable 
              orders={orders} 
              handleSort={handleSort} 
              sortBy={sortBy} 
              handleEditOrder={handleEditOrder} 
              handleDeleteOrder={handleDeleteOrder}
              handleViewInvoice={handleViewInvoice}
              statusColors={statusColors}
            />
            <OrderPagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          </>
        ) : (
          <div className="text-center py-10">
            <ServerIcon className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-4 text-slate-400">لا توجد طلبات لعرضها حالياً.</p>
          </div>
        )}
      </CardContent>

      {editingOrder && (
        <EditOrderDialog
          editingOrder={editingOrder}
          setEditingOrder={setEditingOrder}
          availableStock={availableStock}
          selectedStockId={selectedStockId}
          setSelectedStockId={setSelectedStockId}
          handleUpdateOrder={handleUpdateOrder}
          statusOptions={statusOptions}
          toast={toast}
        />
      )}

      {viewingInvoice && (
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl p-0 print:bg-white print:text-black">
                <InvoiceView order={viewingInvoice} onClose={() => setViewingInvoice(null)} />
            </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default OrderManagement;
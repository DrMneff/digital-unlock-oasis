import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea'; // Assuming you have Textarea component
import { ThumbsUp } from 'lucide-react';

const EditOrderDialog = ({ 
  editingOrder, 
  setEditingOrder, 
  availableStock, 
  selectedStockId, 
  setSelectedStockId, 
  handleUpdateOrder, 
  statusOptions,
  toast
}) => {
  if (!editingOrder) return null;

  const handleServiceReportDetailsChange = (e) => {
    const updatedSr = {
        ...editingOrder.service_request_id,
        raw_form_data: {
            ...(editingOrder.service_request_id?.raw_form_data || {}),
            report_details: e.target.value
        }
    };
    setEditingOrder({...editingOrder, service_request_id: updatedSr });
  };

  const saveServiceReportDetails = async () => {
    if (!editingOrder.service_request_id?.id || !editingOrder.service_request_id?.raw_form_data) {
        toast({title:"لا يوجد طلب خدمة مرتبط", description: "لا يمكن حفظ تفاصيل التقرير بدون طلب خدمة مرتبط.", variant: "destructive"});
        return;
    }
    const { error } = await supabase.from('service_requests')
        .update({ raw_form_data: editingOrder.service_request_id.raw_form_data })
        .eq('id', editingOrder.service_request_id.id);
    if (error) toast({title:"خطأ", description: "فشل حفظ تفاصيل التقرير", variant: "destructive"});
    else toast({title: "تم الحفظ", description: "تم حفظ تفاصيل التقرير."});
  };

  const getProductName = () => {
    if (editingOrder.digital_product_id?.name) return editingOrder.digital_product_id.name;
    if (editingOrder.service_request_id?.service_name) return editingOrder.service_request_id.service_name;
    if (editingOrder.cart_items_snapshot && editingOrder.cart_items_snapshot.length > 0) {
        return `طلب سلة (${editingOrder.cart_items_snapshot.length} منتجات)`;
    }
    return 'طلب غير محدد';
  };

  const isSingleProductRequiringStock = editingOrder.digital_product_id && editingOrder.digital_product_id.product_type !== 'service_report';
  const isCartOrderWithStockableItems = editingOrder.cart_items_snapshot && editingOrder.cart_items_snapshot.some(item => item.product_type !== 'service_report');
  // Simplified: show stock selection if single product or if cart has one stockable item (for now)
  // A more complex UI would be needed for multi-stock assignment in cart.
  const showStockSelection = (editingOrder.order_status === 'Completed' || editingOrder.order_status === 'Delivered') &&
                             !editingOrder.purchased_stock_id && 
                             (isSingleProductRequiringStock || (isCartOrderWithStockableItems && editingOrder.cart_items_snapshot.length === 1));


  return (
    <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-yellow-300">تعديل الطلب: {editingOrder.id.substring(0,8)}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <p><span className="font-semibold">المنتج/الخدمة:</span> {getProductName()}</p>
          <p><span className="font-semibold">المستخدم:</span> {editingOrder.service_request_id?.email || (editingOrder.user_id ? editingOrder.user_id.substring(0,8)+'...' : 'زائر')}</p>
          <div>
            <Label htmlFor="order-status-edit" className="text-slate-300">حالة الطلب:</Label>
            <Select
              value={editingOrder.order_status}
              onValueChange={(newStatus) => setEditingOrder({...editingOrder, order_status: newStatus})}
            >
              <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {showStockSelection && (
            <div>
              <Label htmlFor="stock-assign" className="text-slate-300">تسليم المنتج (اختر من المخزون):</Label>
              {availableStock.length > 0 ? (
                <Select onValueChange={setSelectedStockId} value={selectedStockId}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                    <SelectValue placeholder="اختر كود/بيانات لتسليمها" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    {availableStock.map(stock => (
                      <SelectItem key={stock.id} value={stock.id}>
                        {stock.stock_data?.code || stock.stock_data?.username || `Stock ID: ${stock.id.substring(0,8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-orange-400">لا يوجد مخزون متوفر لهذا المنتج حاليًا. يرجى إضافة مخزون أولاً.</p>
              )}
            </div>
          )}
          {editingOrder.purchased_stock_id?.stock_data && (
            <div>
              <Label className="text-slate-300">المنتج المسلم:</Label>
              <pre className="text-xs bg-slate-700 p-2 rounded overflow-x-auto">
                {JSON.stringify(editingOrder.purchased_stock_id.stock_data, null, 2)}
              </pre>
            </div>
          )}

          {editingOrder.order_status === 'Completed' && (editingOrder.digital_product_id?.product_type === 'service_report' || (editingOrder.cart_items_snapshot && editingOrder.cart_items_snapshot.some(item => item.product_type === 'service_report'))) && (
            <div>
              <Label htmlFor="service-report-details" className="text-slate-300">تفاصيل تقرير الخدمة (للعميل):</Label>
              <Textarea
                id="service-report-details"
                rows={3}
                className="w-full bg-slate-700 border-slate-600 p-2 rounded text-sm placeholder-slate-500"
                placeholder="أدخل تفاصيل التقرير هنا..."
                value={editingOrder.service_request_id?.raw_form_data?.report_details || ''}
                onChange={handleServiceReportDetailsChange}
              />
              <Button 
                size="sm" className="mt-1 bg-sky-600 hover:bg-sky-700"
                onClick={saveServiceReportDetails}
              >حفظ تفاصيل التقرير</Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-slate-600 text-slate-300">إلغاء</Button>
          </DialogClose>
          <Button onClick={handleUpdateOrder} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
            <ThumbsUp className="ml-2 h-4 w-4"/> حفظ التعديلات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
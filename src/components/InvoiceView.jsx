import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const InvoiceView = ({ order, onClose }) => {
  if (!order || !order.invoice_details) {
    return (
      <div className="p-4 text-center text-red-500">
        لا توجد تفاصيل فاتورة لعرضها.
        {onClose && <Button onClick={onClose} variant="outline" className="mt-4">إغلاق</Button>}
      </div>
    );
  }

  const { invoice_number, issue_date, due_date, customer_name, customer_email, items, subtotal, tax, total, payment_method, payment_status_details, company_info } = order.invoice_details;

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-slate-800 border-slate-700 text-white shadow-2xl print:shadow-none print:border-none print:bg-white print:text-black">
      <CardHeader className="border-b border-slate-600 print:border-slate-200 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-bold text-purple-400 print:text-purple-700">فاتورة</CardTitle>
            <CardDescription className="text-slate-400 print:text-slate-600">رقم الفاتورة: <span className="font-mono">{invoice_number}</span></CardDescription>
          </div>
          <div className="text-left">
            <img alt="Drmnef Logo" className="h-12 w-12 rounded-full border border-purple-500 mb-2 hidden print:block" src="https://images.unsplash.com/photo-1691405167344-c3bbc9710ad2" />
            <p className="font-semibold text-lg text-slate-300 print:text-slate-700">{company_info?.name || 'Drmnef'}</p>
            <p className="text-xs text-slate-400 print:text-slate-500">{company_info?.address || 'المملكة العربية السعودية'}</p>
            <p className="text-xs text-slate-400 print:text-slate-500">البريد: {company_info?.email || 'Dr.mnef@Gmail.Com'}</p>
            <p className="text-xs text-slate-400 print:text-slate-500">واتساب: {company_info?.phone || '+966538182861'}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-slate-300 print:text-slate-700">
          <p>تاريخ الإصدار: {formatDate(issue_date)}</p>
          {due_date && <p>تاريخ الاستحقاق: {formatDate(due_date)}</p>}
        </div>
      </CardHeader>
      <CardContent className="py-6 px-4 sm:px-6 space-y-6">
        <div>
          <h4 className="font-semibold text-purple-300 print:text-purple-600 mb-1">فاتورة إلى:</h4>
          <p className="text-slate-300 print:text-slate-700">{customer_name || 'عميل غير مسجل'}</p>
          <p className="text-slate-400 print:text-slate-600 text-sm">{customer_email}</p>
        </div>

        <div>
          <h4 className="font-semibold text-purple-300 print:text-purple-600 mb-2">تفاصيل الطلب:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300 print:text-slate-700">
              <thead className="text-xs text-slate-400 print:text-slate-500 uppercase bg-slate-700 print:bg-slate-100">
                <tr>
                  <th scope="col" className="px-3 py-2">المنتج/الخدمة</th>
                  <th scope="col" className="px-3 py-2 text-center">الكمية</th>
                  <th scope="col" className="px-3 py-2 text-center">سعر الوحدة</th>
                  <th scope="col" className="px-3 py-2 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {items && items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-600 print:border-slate-200">
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-center">{item.unit_price?.toFixed(2)} ريال</td>
                    <td className="px-3 py-2 text-left">{(item.unit_price * item.quantity).toFixed(2)} ريال</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <div className="w-full max-w-xs space-y-1 text-sm text-slate-300 print:text-slate-700">
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>{subtotal?.toFixed(2)} ريال</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span>الضريبة ({((tax / subtotal) * 100).toFixed(0)}%):</span>
                <span>{tax?.toFixed(2)} ريال</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-purple-300 print:text-purple-600 border-t border-slate-600 print:border-slate-200 pt-1 mt-1">
              <span>المجموع الإجمالي:</span>
              <span>{total?.toFixed(2)} ريال</span>
            </div>
          </div>
        </div>
        
        {payment_method && (
            <div className="mt-4 pt-4 border-t border-slate-600 print:border-slate-200">
                <h4 className="font-semibold text-purple-300 print:text-purple-600 mb-1">معلومات الدفع:</h4>
                <p className="text-sm text-slate-300 print:text-slate-700">طريقة الدفع: <span className="font-medium">{payment_method === 'bank_transfer' ? 'تحويل بنكي' : payment_method}</span></p>
                <p className="text-sm text-slate-300 print:text-slate-700">حالة الدفع: <span className="font-medium">{payment_status_details || order.order_status}</span></p>
                {order.order_status === "Pending Bank Confirmation" && (
                     <div className="text-xs text-orange-400 print:text-orange-600 mt-1 p-2 bg-orange-900/30 print:bg-orange-100 rounded">
                        يرجى إرفاق إيصال التحويل وتأكيد الدفع عبر واتساب لتسريع معالجة طلبك.
                     </div>
                )}
            </div>
        )}

      </CardContent>
      <CardFooter className="border-t border-slate-600 print:border-slate-200 pt-4 pb-6 flex justify-between items-center print:hidden">
        {onClose && <Button variant="outline" onClick={onClose} className="border-slate-500 hover:bg-slate-700 text-slate-300">إغلاق</Button>}
        <Button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700">
          <Download className="ml-2 h-4 w-4" /> طباعة / تحميل PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InvoiceView;
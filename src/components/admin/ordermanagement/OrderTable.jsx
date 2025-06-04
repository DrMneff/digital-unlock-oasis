import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const SortIcon = ({ column, sortBy }) => {
  if (sortBy.column !== column) return <ChevronDown className="inline-block ml-1 h-3 w-3 opacity-50" />;
  return sortBy.ascending ? 
    <ChevronUp className="inline-block ml-1 h-3 w-3 text-yellow-300" /> : 
    <ChevronDown className="inline-block ml-1 h-3 w-3 text-yellow-300" />;
};

const formatDate = (dateString) => {
  if (!dateString) return 'غير متوفر';
  return new Date(dateString).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
};

const OrderTable = ({ orders, handleSort, sortBy, handleEditOrder, handleDeleteOrder, handleViewInvoice, statusColors }) => {
  
  const getProductName = (order) => {
    if (order.digital_product_id?.name) return order.digital_product_id.name;
    if (order.service_request_id?.service_name) return order.service_request_id.service_name;
    if (order.cart_items_snapshot && order.cart_items_snapshot.length > 0) {
        return `طلب سلة (${order.cart_items_snapshot.length} منتجات)`;
    }
    return 'N/A';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right text-slate-300">
        <thead className="text-xs text-yellow-300 uppercase bg-slate-700">
          <tr>
            <th scope="col" className="px-3 py-3 cursor-pointer" onClick={() => handleSort('id')}>
              رقم الطلب <SortIcon column="id" sortBy={sortBy} />
            </th>
            <th scope="col" className="px-3 py-3">المنتج/الخدمة</th>
            <th scope="col" className="px-3 py-3">العميل (البريد)</th>
            <th scope="col" className="px-3 py-3 cursor-pointer" onClick={() => handleSort('order_status')}>
              الحالة <SortIcon column="order_status" sortBy={sortBy} />
            </th>
            <th scope="col" className="px-3 py-3 cursor-pointer" onClick={() => handleSort('total_amount')}>
              المبلغ <SortIcon column="total_amount" sortBy={sortBy} />
            </th>
            <th scope="col" className="px-3 py-3 cursor-pointer" onClick={() => handleSort('created_at')}>
              التاريخ <SortIcon column="created_at" sortBy={sortBy} />
            </th>
            <th scope="col" className="px-3 py-3">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
              <td className="px-3 py-3 font-mono text-xs">{order.id.substring(0,13)}...</td>
              <td className="px-3 py-3">{getProductName(order)}</td>
              <td className="px-3 py-3 text-xs">{order.service_request_id?.email || (order.user_id ? order.user_id.substring(0,8)+'...' : 'زائر')}</td>
              <td className="px-3 py-3">
                <Badge className={`${statusColors[order.order_status] || 'bg-gray-500'} text-white text-xs whitespace-nowrap`}>{order.order_status || 'غير محدد'}</Badge>
              </td>
              <td className="px-3 py-3">{order.total_amount} ريال</td>
              <td className="px-3 py-3">{formatDate(order.created_at)}</td>
              <td className="px-3 py-3 flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditOrder(order)} title="تعديل الطلب">
                  <Edit3 className="h-4 w-4 text-blue-400 hover:text-blue-300" />
                </Button>
                {order.invoice_details && (
                    <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(order)} title="عرض الفاتورة">
                        <FileText className="h-4 w-4 text-green-400 hover:text-green-300" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order.id)} title="حذف الطلب">
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
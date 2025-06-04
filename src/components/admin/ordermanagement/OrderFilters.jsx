import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

const OrderFilters = ({ filters, setFilters, onApplyFilters, statusOptions }) => {
  return (
    <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="filter-order-search" className="text-slate-300">بحث (رقم طلب/خدمة/منتج)</Label>
          <Input 
            id="filter-order-search"
            placeholder="ادخل رقم الطلب أو اسم المنتج..." 
            value={filters.searchTerm} 
            onChange={e => setFilters(f => ({...f, searchTerm: e.target.value}))}
            className="bg-slate-600 border-slate-500 placeholder-slate-400"
          />
        </div>
        <div>
          <Label htmlFor="filter-order-status" className="text-slate-300">حالة الطلب</Label>
          <Select value={filters.status} onValueChange={v => setFilters(f => ({...f, status: v}))}>
            <SelectTrigger className="w-full bg-slate-600 border-slate-500 text-slate-300">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-white">
              <SelectItem value="">جميع الحالات</SelectItem>
              {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {/* Consider adding a product filter here if needed */}
        {/* <div>
          <Label htmlFor="filter-order-product" className="text-slate-300">المنتج</Label>
          <Input placeholder="اسم المنتج" disabled className="bg-slate-600 border-slate-500" />
        </div> */}
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onApplyFilters} className="bg-purple-600 hover:bg-purple-700">
          <Search className="ml-2 h-4 w-4" /> تطبيق الفلاتر
        </Button>
      </div>
    </div>
  );
};

export default OrderFilters;
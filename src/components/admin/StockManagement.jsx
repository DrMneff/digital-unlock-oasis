import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2, PlusCircle, Layers3, RefreshCw, Server as ServerIcon, PackageSearch } from 'lucide-react';

const StockManagement = () => {
  const [stockItems, setStockItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    stock_data_type: 'code',
    code: '',
    username: '',
    password: '',
    profile_name: '',
    bulk_codes: '',
  });
  const { toast } = useToast();

  const fetchStockItems = useCallback(async (productId = null) => {
    setLoading(true);
    try {
      let query = supabase.from('product_stock').select('*, product_id (id, name)').order('created_at', { ascending: false });
      if (productId) {
        query = query.eq('product_id', productId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error("Error fetching stock items:", error);
      toast({ title: "خطأ", description: "لم نتمكن من جلب عناصر المخزون.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('digital_products').select('id, name, product_type')
        .in('product_type', ['code', 'account_details']);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products for stock:", error);
    }
  }, []);

  useEffect(() => {
    fetchStockItems();
    fetchProducts();
  }, [fetchStockItems, fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
     setFormData(prev => ({ ...prev, [name]: value }));
     if (name === 'product_id') {
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct) {
            setFormData(prev => ({ ...prev, stock_data_type: selectedProduct.product_type || 'code' }));
        }
     }
  };
  
  const resetFormData = () => {
    setFormData({ product_id: '', stock_data_type: 'code', code: '', username: '', password: '', profile_name: '', bulk_codes: '' });
  };

  const handleSubmitStock = async (e) => {
    e.preventDefault();
    if (!formData.product_id) {
        toast({title: "خطأ", description: "يرجى اختيار المنتج أولاً.", variant: "destructive"});
        return;
    }

    let stockDataPayloads = [];
    const now = new Date().toISOString();

    if(formData.bulk_codes && formData.stock_data_type === 'code') {
        stockDataPayloads = formData.bulk_codes.split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(code => ({ 
                product_id: formData.product_id, 
                stock_data: { code },
                created_at: now,
                updated_at: now,
            }));
    } else if (formData.stock_data_type === 'code' && formData.code) {
        stockDataPayloads.push({ 
            product_id: formData.product_id, 
            stock_data: { code: formData.code },
            created_at: now,
            updated_at: now,
        });
    } else if (formData.stock_data_type === 'account_details' && formData.username && formData.password) {
        stockDataPayloads.push({ 
            product_id: formData.product_id, 
            stock_data: { 
                username: formData.username, 
                password: formData.password,
                profile_name: formData.profile_name || undefined 
            },
            created_at: now,
            updated_at: now,
        });
    } else {
        toast({title: "خطأ", description: "يرجى إدخال بيانات المخزون (كود أو تفاصيل حساب أو أكواد مجمعة).", variant: "destructive"});
        return;
    }

    if (stockDataPayloads.length === 0) {
        toast({title: "خطأ", description: "لا توجد بيانات مخزون صالحة للإضافة.", variant: "destructive"});
        return;
    }


    try {
      const { error } = await supabase.from('product_stock').insert(stockDataPayloads);
      if (error) throw error;

      toast({ title: "نجاح!", description: `تمت إضافة ${stockDataPayloads.length} عنصر/عناصر مخزون بنجاح.` });
      setShowStockModal(false);
      resetFormData();
      fetchStockItems();
    } catch (error) {
      console.error("Error saving stock:", error);
      toast({ title: "خطأ", description: `فشل حفظ المخزون: ${error.message}`, variant: "destructive" });
    }
  };
  
  const handleDeleteStockItem = async (stockId) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف عنصر المخزون هذا؟")) return;
    try {
      const { error } = await supabase.from('product_stock').delete().eq('id', stockId);
      if (error) throw error;
      toast({ title: "نجاح", description: "تم حذف عنصر المخزون." });
      fetchStockItems();
    } catch (error) {
      console.error("Error deleting stock item:", error);
      toast({ title: "خطأ", description: `فشل حذف عنصر المخزون: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-2xl text-yellow-300 flex items-center"><Layers3 className="ml-2 h-6 w-6"/> إدارة مخزون المنتجات ({stockItems.length})</CardTitle>
        <div className="flex gap-2">
            <Button onClick={() => fetchStockItems()} variant="ghost" size="icon" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5 text-slate-400 hover:text-yellow-300" />}
            </Button>
            <Button onClick={() => { resetFormData(); setShowStockModal(true); }} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="ml-2 h-4 w-4" /> إضافة مخزون جديد
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          </div>
        ) : stockItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-300">
              <thead className="text-xs text-yellow-300 uppercase bg-slate-700">
                <tr>
                  <th scope="col" className="px-3 py-3">المنتج</th>
                  <th scope="col" className="px-3 py-3">بيانات المخزون</th>
                  <th scope="col" className="px-3 py-3">متوفر</th>
                  <th scope="col" className="px-3 py-3">تاريخ الإضافة</th>
                  <th scope="col" className="px-3 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map(item => (
                  <tr key={item.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="px-3 py-3">{item.product_id?.name || 'منتج محذوف'}</td>
                    <td className="px-3 py-3 text-xs font-mono break-all">
                        {item.stock_data?.code || `${item.stock_data?.username} / ${item.stock_data?.password ? '***' : ''}`}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${item.is_available ? 'bg-green-500/80 text-green-100' : 'bg-red-500/80 text-red-100'}`}>
                        {item.is_available ? 'نعم' : 'لا (مباع/محجوز)'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{new Date(item.created_at).toLocaleDateString('ar-EG')}</td>
                    <td className="px-3 py-3">
                      <Button variant="outline" size="xs" onClick={() => handleDeleteStockItem(item.id)} className="border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs px-1.5 py-0.5">
                        <Trash2 className="ml-1 h-3 w-3" /> حذف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
           <div className="text-center py-10">
            <PackageSearch className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-2 text-slate-400">لا يوجد مخزون مضاف حتى الآن أو للمنتج المحدد.</p>
          </div>
        )}
      </CardContent>

      <Dialog open={showStockModal} onOpenChange={(isOpen) => {
          setShowStockModal(isOpen);
          if (!isOpen) resetFormData();
        }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-yellow-300">إضافة مخزون جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitStock} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="stock-product-id" className="text-slate-300">المنتج*</Label>
              <Select name="product_id" value={formData.product_id} onValueChange={(value) => handleSelectChange('product_id', value)}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600"><SelectValue placeholder="اختر المنتج لإضافة مخزون له" /></SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white">
                  {products.length > 0 ? products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.product_type})</SelectItem>) : <SelectItem value="" disabled>لا توجد منتجات تتطلب مخزون</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            
            {formData.product_id && (
                <>
                    {formData.stock_data_type === 'code' && (
                        <>
                        <div>
                            <Label htmlFor="stock-code" className="text-slate-300">الكود (إذا كان عنصر واحد)</Label>
                            <Input id="stock-code" name="code" value={formData.code} onChange={handleInputChange} className="bg-slate-700 border-slate-600" />
                        </div>
                        <div>
                            <Label htmlFor="stock-bulk-codes" className="text-slate-300">أو أكواد مجمعة (كل كود في سطر جديد)</Label>
                            <Textarea id="stock-bulk-codes" name="bulk_codes" value={formData.bulk_codes} onChange={handleInputChange} rows={5} className="bg-slate-700 border-slate-600" placeholder="CODE1&#x000A;CODE2&#x000A;CODE3" />
                        </div>
                        </>
                    )}

                    {formData.stock_data_type === 'account_details' && (
                        <>
                        <div>
                            <Label htmlFor="stock-username" className="text-slate-300">اسم المستخدم*</Label>
                            <Input id="stock-username" name="username" value={formData.username} onChange={handleInputChange} className="bg-slate-700 border-slate-600" required={formData.stock_data_type === 'account_details'} />
                        </div>
                        <div>
                            <Label htmlFor="stock-password" className="text-slate-300">كلمة المرور*</Label>
                            <Input id="stock-password" name="password" value={formData.password} onChange={handleInputChange} className="bg-slate-700 border-slate-600" required={formData.stock_data_type === 'account_details'} />
                        </div>
                         <div>
                            <Label htmlFor="stock-profile-name" className="text-slate-300">اسم الملف الشخصي (اختياري)</Label>
                            <Input id="stock-profile-name" name="profile_name" value={formData.profile_name} onChange={handleInputChange} className="bg-slate-700 border-slate-600" />
                        </div>
                        </>
                    )}
                </>
            )}


            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" className="border-slate-600 text-slate-300">إلغاء</Button></DialogClose>
              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                إضافة إلى المخزون
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default StockManagement;
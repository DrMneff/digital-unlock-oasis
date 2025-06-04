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
import { Loader2, Edit3, Trash2, PlusCircle, ShoppingBag, RefreshCw, Server as ServerIcon } from 'lucide-react';

const serviceCategories = ['app_subscription', 'itunes_card', 'streaming_subscription', 'imei_check', 'ecommerce_service', 'other_service'];
const productTypes = ['code', 'account_details', 'service_report', 'physical_product', 'custom_service'];

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    service_category: '',
    product_type: '',
    image_url: ''
  });
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('digital_products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({ title: "خطأ", description: "لم نتمكن من جلب المنتجات.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetFormData = () => {
    setFormData({ name: '', description: '', price: '', service_category: '', product_type: '', image_url: '' });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.service_category || !formData.product_type) {
        toast({title: "خطأ", description: "يرجى ملء الحقول الإلزامية: الاسم، السعر، فئة الخدمة، نوع المنتج.", variant: "destructive"});
        return;
    }

    try {
      let result;
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        updated_at: new Date().toISOString(), 
      };

      if (editingProduct) {
        result = await supabase.from('digital_products').update(productData).eq('id', editingProduct.id).select().single();
      } else {
        productData.created_at = new Date().toISOString();
        result = await supabase.from('digital_products').insert(productData).select().single();
      }

      const { data, error } = result;
      if (error) throw error;

      toast({ title: "نجاح!", description: editingProduct ? "تم تحديث المنتج بنجاح." : "تم إضافة المنتج بنجاح." });
      setShowProductModal(false);
      setEditingProduct(null);
      resetFormData();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ title: "خطأ", description: `فشل حفظ المنتج: ${error.message}`, variant: "destructive" });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        service_category: product.service_category || '',
        product_type: product.product_type || '',
        image_url: product.image_url || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟ هذا الإجراء سيحذف أي مخزون مرتبط به.")) return;
    try {
      const { error } = await supabase.from('digital_products').delete().eq('id', productId);
      if (error) throw error;
      toast({ title: "نجاح", description: "تم حذف المنتج." });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "خطأ", description: `فشل حذف المنتج: ${error.message}`, variant: "destructive" });
    }
  };


  return (
    <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-2xl text-yellow-300 flex items-center"><ShoppingBag className="ml-2 h-6 w-6"/> إدارة المنتجات الرقمية ({products.length})</CardTitle>
        <div className="flex gap-2">
            <Button onClick={fetchProducts} variant="ghost" size="icon" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5 text-slate-400 hover:text-yellow-300" />}
            </Button>
            <Button onClick={() => { setEditingProduct(null); resetFormData(); setShowProductModal(true); }} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة منتج جديد
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <Card key={product.id} className="bg-slate-700/70 border-slate-600 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-200">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-1 text-sm">
                  <p className="text-slate-400 truncate">{product.description || "لا يوجد وصف."}</p>
                  <p><span className="font-semibold text-slate-300">السعر:</span> <span className="text-green-400">{product.price} ريال</span></p>
                  <p><span className="font-semibold text-slate-300">الفئة:</span> {product.service_category}</p>
                  <p><span className="font-semibold text-slate-300">النوع:</span> {product.product_type}</p>
                  {product.image_url && <img src={product.image_url} alt={product.name} className="mt-2 h-20 w-auto rounded-md object-contain"/>}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)} className="border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300">
                    <Edit3 className="ml-1 h-3 w-3" /> تعديل
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)} className="border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300">
                    <Trash2 className="ml-1 h-3 w-3" /> حذف
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <ServerIcon className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-2 text-slate-400">لا توجد منتجات مضافة حتى الآن.</p>
          </div>
        )}
      </CardContent>

      <Dialog open={showProductModal} onOpenChange={(isOpen) => {
          setShowProductModal(isOpen);
          if (!isOpen) {
            setEditingProduct(null);
            resetFormData();
          }
        }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-yellow-300">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProduct} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="product-name" className="text-slate-300">اسم المنتج*</Label>
              <Input id="product-name" name="name" value={formData.name} onChange={handleInputChange} className="bg-slate-700 border-slate-600" required />
            </div>
            <div>
              <Label htmlFor="product-description" className="text-slate-300">الوصف</Label>
              <Textarea id="product-description" name="description" value={formData.description} onChange={handleInputChange} className="bg-slate-700 border-slate-600" />
            </div>
            <div>
              <Label htmlFor="product-price" className="text-slate-300">السعر (بالريال)*</Label>
              <Input id="product-price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} className="bg-slate-700 border-slate-600" required />
            </div>
             <div>
              <Label htmlFor="product-image-url" className="text-slate-300">رابط صورة المنتج (اختياري)</Label>
              <Input id="product-image-url" name="image_url" value={formData.image_url} onChange={handleInputChange} placeholder="https://example.com/image.png" className="bg-slate-700 border-slate-600" />
            </div>
            <div>
              <Label htmlFor="product-service-category" className="text-slate-300">فئة الخدمة*</Label>
              <Select name="service_category" value={formData.service_category} onValueChange={(value) => handleSelectChange('service_category', value)}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600"><SelectValue placeholder="اختر فئة" /></SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white">
                  {serviceCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product-product-type" className="text-slate-300">نوع المنتج*</Label>
              <Select name="product_type" value={formData.product_type} onValueChange={(value) => handleSelectChange('product_type', value)}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600"><SelectValue placeholder="اختر نوع المنتج" /></SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white">
                  {productTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" className="border-slate-600 text-slate-300">إلغاء</Button></DialogClose>
              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductManagement;
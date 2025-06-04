import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchCheck as SearchCheckIcon } from 'lucide-react'; // Removed ShoppingCart
import { useToast } from "@/components/ui/use-toast";
// import { useCart } from '@/contexts/CartContext'; // useCart removed


export const IcloudBypassSection = ({ formData, handleInputChange, handleSubmit, products }) => {
  const { toast } = useToast();
  // const { addToCart } = useCart(); // addToCart removed
  const imeiCheckProduct = products && products.find(p => p.service_category === 'imei_check'); 

  const handleImeiCheckSubmit = () => {
    if (imeiCheckProduct && formData.imei) {
      handleSubmit({ 
        name: imeiCheckProduct.name, 
        price: parseFloat(imeiCheckProduct.price), 
        id: imeiCheckProduct.id,
        category: imeiCheckProduct.service_category
      });
    } else if (!formData.imei) {
      toast({ title: "خطأ", description: "يرجى إدخال رقم IMEI لفحص القائمة السوداء.", variant: "destructive" });
    } else {
      toast({ title: "خطأ", description: "خدمة فحص IMEI غير متاحة حالياً.", variant: "destructive" });
    }
  };

  // handleAddToCartImeiCheck removed
  
  const handleIcloudBypassSubmit = () => {
    if (!formData.name || !formData.email || !formData.serialNumber || !formData.imei_icloud) { // Changed imei to imei_icloud
        toast({ title: "خطأ", description: "يرجى ملء جميع الحقول لخدمة تجاوز iCloud.", variant: "destructive" });
        return;
    }
    handleSubmit({
        name: 'خدمة تجاوز iCloud (طلب مخصص)',
        price: 0, 
        id: null, 
        category: 'icloud_bypass_request'
    });
  };


  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-md">نقدم حلولاً متقدمة لتجاوز قفل iCloud على أجهزة iPhone و iPad، بالإضافة إلى خدمة فحص القائمة السوداء لرقم IMEI.</p>
      
      <Card className="bg-slate-700/80 border-slate-600">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center"><SearchCheckIcon className="w-5 h-5 ml-2"/> فحص القائمة السوداء (IMEI)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">تحقق من حالة جهازك (نظيف / قائمة سوداء) قبل الشراء أو لإجراءات أخرى. سعر الخدمة: <span className="font-bold text-green-400">{imeiCheckProduct ? `${parseFloat(imeiCheckProduct.price)} ريال` : 'غير محدد'}</span>.</p>
          <div>
            <Label htmlFor="imei-blacklist" className="text-slate-300">رقم IMEI للفحص</Label>
            <Input id="imei-blacklist" name="imei" value={formData.imei} onChange={handleInputChange} placeholder="352027000000000" className="bg-slate-700 border-slate-600 placeholder-slate-500" />
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-1 gap-2"> {/* Changed to grid-cols-1 */}
          <Button 
            onClick={handleImeiCheckSubmit} 
            className="w-full bg-purple-600 hover:bg-purple-700" 
            disabled={!imeiCheckProduct || parseFloat(imeiCheckProduct.price) <= 0}
          >
            {imeiCheckProduct && parseFloat(imeiCheckProduct.price) > 0 ? 'شراء الآن' : (imeiCheckProduct ? 'اطلب الخدمة' : 'الخدمة غير متاحة')}
          </Button>
           {/* Add to Cart button removed */}
        </CardFooter>
      </Card>

      <Card className="bg-slate-700/80 border-slate-600">
        <CardHeader>
          <CardTitle className="text-purple-300">طلب خدمة تجاوز iCloud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">يرجى ملء البيانات التالية لطلب خدمة تجاوز قفل iCloud. سيتم التواصل معك بشأن السعر والتفاصيل.</p>
          <div>
            <Label htmlFor="name-icloud" className="text-slate-300">الاسم الكامل</Label>
            <Input id="name-icloud" name="name" value={formData.name} onChange={handleInputChange} placeholder="مثال: عبدالله محمد" className="bg-slate-700 border-slate-600 placeholder-slate-500" />
          </div>
          <div>
            <Label htmlFor="email-icloud" className="text-slate-300">البريد الإلكتروني</Label>
            <Input id="email-icloud" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="example@example.com" className="bg-slate-700 border-slate-600 placeholder-slate-500" />
          </div>
          <div>
            <Label htmlFor="serialNumber-icloud" className="text-slate-300">الرقم التسلسلي (Serial Number)</Label>
            <Input id="serialNumber-icloud" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} placeholder="C02XXXXXXG85" className="bg-slate-700 border-slate-600 placeholder-slate-500" />
          </div>
          <div>
            <Label htmlFor="imei-icloud-bypass-form" className="text-slate-300">رقم IMEI (الخاص بجهاز iCloud)</Label>
            <Input id="imei-icloud-bypass-form" name="imei_icloud" value={formData.imei_icloud} onChange={handleInputChange} placeholder="352027000000000" className="bg-slate-700 border-slate-600 placeholder-slate-500" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleIcloudBypassSubmit} className="w-full bg-purple-500 hover:bg-purple-600">إرسال طلب خدمة تجاوز iCloud</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
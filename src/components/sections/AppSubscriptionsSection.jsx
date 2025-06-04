import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, PackagePlus } from 'lucide-react'; // Removed ShoppingCart
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { useCart } from '@/contexts/CartContext'; // useCart removed
import { useToast } from '@/components/ui/use-toast'; 

export const AppSubscriptionsSection = ({ formData, handleInputChange, handleSubmit, products }) => {
  // const { addToCart } = useCart(); // addToCart removed
  const { toast } = useToast();

  const handleProductSelectAndSubmit = (product) => {
    if (product) {
      handleSubmit({ 
        name: product.name, 
        price: parseFloat(product.price), 
        id: product.id, 
        category: product.service_category 
      });
    }
  };

  // handleAddToCart removed

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-md">احصل على اشتراكات سنوية لمجموعة واسعة من التطبيقات المميزة. نوفر لك وصولاً آمناً وموثوقاً لملفات التعريف والتحقق.</p>
      
      {products && products.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {products.map(product => (
            <Card key={product.id} className="bg-slate-700/80 border-slate-600 hover:shadow-teal-500/30 hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="text-teal-300 text-lg flex items-center"><PackagePlus className="w-5 h-5 ml-2" /> {product.name}</CardTitle>
                <CardDescription className="text-slate-400 h-10 overflow-y-auto">{product.description || 'اشتراك تطبيقات مميز.'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-green-400 font-bold text-xl">{parseFloat(product.price)} ريال</p>
              </CardContent>
              <CardFooter className="grid grid-cols-1 gap-2"> {/* Changed to grid-cols-1 */}
                <Button 
                  onClick={() => handleProductSelectAndSubmit(product)} 
                  className="w-full bg-teal-500 hover:bg-teal-600"
                  disabled={parseFloat(product.price) <= 0}
                >
                  {parseFloat(product.price) > 0 ? 'شراء الآن' : 'اطلب الخدمة'}
                </Button>
                {/* Add to Cart button removed */}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500">لا توجد باقات اشتراكات تطبيقات متاحة حالياً.</p>
      )}

      <div className="mt-6 space-y-4 p-4 border border-dashed border-slate-600 rounded-md">
        <h4 className="font-semibold text-md mb-2 text-teal-300 flex items-center"><Download className="w-5 h-5 ml-2" /> معلومات إضافية</h4>
        <div>
            <Label htmlFor="udid-apps" className="text-slate-300">رقم UDID الخاص بجهازك (اختياري عند الطلب العام)</Label>
            <Input id="udid-apps" name="udid" value={formData.udid} onChange={handleInputChange} placeholder="00008020-000000000000002E" className="bg-slate-700 border-slate-600 placeholder-slate-500" />
            <p className="text-xs text-slate-400 mt-1">قد نحتاج رقم UDID لبعض الاشتراكات. يمكنك الحصول عليه عن طريق توصيل جهازك بالكمبيوتر واستخدام iTunes/Finder أو مواقع متخصصة.</p>
        </div>
        <p className="text-sm text-slate-400 mt-2">بعد إتمام الطلب والدفع، سيتم تزويدك ببيانات الاشتراك أو رابط مباشر لتحميل ملف التعريف. اتبع الخطوات التالية للتثبيت إذا كان ملف تعريف:</p>
        <ol className="list-decimal list-inside text-sm text-slate-400 space-y-1">
          <li>قم بتحميل ملف التعريف من الرابط المرسل إليك.</li>
          <li>اذهب إلى الإعدادات {'>'} عام {'>'} VPN وإدارة الجهاز.</li>
          <li>ستجد ملف التعريف تحت قسم "ملف تعريف تم تنزيله". اضغط عليه.</li>
          <li>اضغط على "تثبيت" في أعلى اليمين، وأدخل رمز الدخول الخاص بجهازك إذا طُلب.</li>
          <li>اضغط على "تثبيت" مرة أخرى لتأكيد العملية.</li>
        </ol>
      </div>
    </div>
  );
};
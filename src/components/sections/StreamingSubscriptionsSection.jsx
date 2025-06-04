import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tv } from 'lucide-react'; // Removed ShoppingCart
// import { useCart } from '@/contexts/CartContext'; // useCart removed
import { useToast } from '@/components/ui/use-toast';

export const StreamingSubscriptionsSection = ({ handleSubmit, products }) => {
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
  
  const defaultImage = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-md">استمتع بأفضل محتوى ترفيهي مع اشتراكات نتفلكس وشاهد. باقات متنوعة تناسب جميع الأذواق. يتم تسليم بيانات الاشتراك بعد تأكيد الدفع.</p>
      
      {products && products.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <Card key={product.id} className="bg-slate-700/80 border-slate-600 hover:shadow-rose-500/30 hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="flex-grow p-0">
                 <img
                    src={product.image_url || defaultImage}
                    alt={product.name}
                    className="rounded-t-lg h-40 w-full object-cover"
                />
                <div className="p-4">
                    <CardTitle className="text-rose-300 text-lg flex items-center"><Tv className="w-5 h-5 ml-2" /> {product.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <p className="text-slate-400 text-sm mb-2 h-12 overflow-y-auto">{product.description || 'اشتراك خدمة بث مميز.'}</p>
                <p className="text-green-400 font-bold text-xl">{parseFloat(product.price)} ريال</p>
              </CardContent>
              <CardFooter className="p-4 grid grid-cols-1 gap-2"> {/* Changed to grid-cols-1 */}
                <Button 
                  onClick={() => handleProductSelectAndSubmit(product)} 
                  className="w-full bg-rose-500 hover:bg-rose-600"
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
        <p className="text-center text-slate-500">لا توجد باقات اشتراكات بث متاحة حالياً.</p>
      )}
    </div>
  );
};
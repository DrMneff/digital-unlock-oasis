import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart as StoreIcon } from 'lucide-react'; // Removed CartIconLucide
// import { useCart } from '@/contexts/CartContext'; // useCart removed
import { useToast } from '@/components/ui/use-toast';

export const EcommerceStoresSection = ({ handleSubmit, products }) => {
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
  
  const defaultImage = "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-md">نساعدك في بناء متجرك الإلكتروني الاحترافي. اختر الباقة التي تناسب احتياجاتك وانطلق في عالم التجارة الرقمية.</p>
      
      {products && products.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <Card key={product.id} className="bg-slate-700/80 border-slate-600 hover:shadow-sky-500/30 hover:shadow-lg transition-shadow flex flex-col">
               <CardHeader className="flex-grow p-0">
                 <img
                    src={product.image_url || defaultImage}
                    alt={product.name}
                    className="rounded-t-lg h-40 w-full object-cover"
                />
                <div className="p-4">
                  <CardTitle className="text-sky-300 text-lg flex items-center"><StoreIcon className="w-5 h-5 ml-2" /> {product.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <p className="text-slate-400 text-sm mb-2 h-12 overflow-y-auto">{product.description || 'باقة إنشاء متجر إلكتروني.'}</p>
                <p className="text-green-400 font-bold text-xl">{parseFloat(product.price)} ريال</p>
              </CardContent>
              <CardFooter className="p-4 grid grid-cols-1 gap-2"> {/* Changed to grid-cols-1 */}
                <Button 
                  onClick={() => handleProductSelectAndSubmit(product)} 
                  className="w-full bg-sky-500 hover:bg-sky-600"
                  disabled={parseFloat(product.price) <= 0}
                >
                  {parseFloat(product.price) > 0 ? 'اطلب الآن' : 'اطلب الخدمة'}
                </Button>
                {/* Add to Cart button removed */}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500">لا توجد باقات إنشاء متاجر متاحة حالياً.</p>
      )}
    </div>
  );
};
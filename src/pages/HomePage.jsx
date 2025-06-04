import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { supabase } from '@/lib/supabaseClient';
import { Smartphone, Package as AppPackageIcon, ShoppingCart as StoreIconLucide, CreditCard, Film } from 'lucide-react';

import { useHomePageData } from '@/hooks/useHomePageData';
import ServiceDisplayCard from '@/components/home/ServiceDisplayCard';
import PaymentModal from '@/components/home/PaymentModal';

import { IcloudBypassSection } from '@/components/sections/IcloudBypassSection';
import { AppSubscriptionsSection } from '@/components/sections/AppSubscriptionsSection';
import { EcommerceStoresSection } from '@/components/sections/EcommerceStoresSection';
import { ItunesGameCardsSection } from '@/components/sections/ItunesGameCardsSection';
import { StreamingSubscriptionsSection } from '@/components/sections/StreamingSubscriptionsSection';
import { handleServiceRequestSubmit, handlePaymentProcessing, generateInvoiceDetailsUtil } from '@/lib/homePageUtils';


const initialServiceFormData = {
  name: '',
  email: '',
  phone: '', 
  serialNumber: '',
  imei: '',
  imei_icloud: '', 
  udid: '',
  selectedProductId: null, 
};

const HomePage = () => {
  const { toast } = useToast();
  const { digitalProducts, loadingProducts, session } = useHomePageData();

  const [formData, setFormData] = useState(initialServiceFormData);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentService, setCurrentService] = useState({ name: '', price: 0, id: null, category: '' }); 
  const [currentServiceRequestId, setCurrentServiceRequestId] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({ 
        ...prev, 
        email: session.user.email || '', 
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
        phone: session.user.user_metadata?.phone || session.user.phone || '' 
      }));
    } else {
      setFormData(prev => ({ ...initialServiceFormData }));
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'selectedProductId') {
      const allProductsFlat = Object.values(digitalProducts).flat();
      const product = allProductsFlat.find(p => p.id === value);
      if (product) {
        setCurrentService({ name: product.name, price: parseFloat(product.price), id: product.id, category: product.service_category });
      }
    }
  };

  const handleSubmitRequest = async (serviceDetails) => {
    await handleServiceRequestSubmit(
      serviceDetails,
      formData,
      session,
      toast,
      setCurrentService,
      setCurrentServiceRequestId,
      setShowPaymentModal,
      setFormData,
      initialServiceFormData,
      setExpandedCard,
      supabase // Pass supabase client
    );
  };

  const handlePayment = async () => {
    await handlePaymentProcessing(
      paymentMethod,
      currentService,
      currentServiceRequestId,
      formData,
      session,
      toast,
      setFormData,
      initialServiceFormData,
      setShowPaymentModal,
      setPaymentMethod,
      setCurrentService,
      setCurrentServiceRequestId,
      setExpandedCard,
      supabase // Pass supabase client
    );
  };
  
  const bankDetailsBarcodeUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/d738bb7b-2905-41ca-9bc3-acc005a23438/02de802d21a689df78d7f0acb5c85f50.png";

  const servicesConfig = [
    { 
      id: "icloud_bypass", 
      title: "خدمات iCloud وفحص IMEI", 
      shortDescription: "حلول تجاوز iCloud وفحص القائمة السوداء.",
      icon: <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />,
      titleColor: "text-purple-300",
      component: <IcloudBypassSection />,
      productCategoryKey: 'imeiChecks', 
    },
    { 
      id: "app_subscriptions", 
      title: "اشتراكات التطبيقات", 
      shortDescription: "اشتراكات سنوية لتطبيقات مميزة.",
      icon: <AppPackageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-teal-400" />,
      titleColor: "text-teal-300",
      component: <AppSubscriptionsSection />,
      productCategoryKey: 'appSubscriptions',
    },
    { 
      id: "ecommerce_stores", 
      title: "إنشاء متاجر إلكترونية", 
      shortDescription: "بناء متجرك الإلكتروني الاحترافي.",
      icon: <StoreIconLucide className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" />,
      titleColor: "text-sky-300",
      component: <EcommerceStoresSection />,
      productCategoryKey: 'ecommerceServices',
    },
    { 
      id: "itunes_game_cards", 
      title: "بطاقات آيتونز وألعاب", 
      shortDescription: "شحن رصيد وبطاقات ألعاب.",
      icon: <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-lime-400" />,
      titleColor: "text-lime-300",
      component: <ItunesGameCardsSection />,
      productCategoryKey: 'itunesGameCards',
    },
    { 
      id: "streaming_subscriptions", 
      title: "اشتراكات شاهد ونتفلكس", 
      shortDescription: "أفضل محتوى ترفيهي.",
      icon: <Film className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />,
      titleColor: "text-rose-300",
      component: <StreamingSubscriptionsSection />,
      productCategoryKey: 'streamingSubscriptions',
    },
  ];

  const handleToggleExpand = (serviceId) => {
    setExpandedCard(expandedCard === serviceId ? null : serviceId);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <header className="text-center mb-12 md:mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
        >
          خدمات Drmnef المتميزة
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-md sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto px-4"
        >
          نقدم حلول احترافية ومتخصصة لجميع مشاكل الايفون و الايباد بالإضافة إلى تطوير المتاجر الإلكترونية واشتراكات التطبيقات بأعلى معايير الجودة والأمان.
        </motion.p>
      </header>
      
      {loadingProducts ? (
         <div className="flex justify-center items-center py-10">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-4 border-t-purple-500 border-r-purple-500 border-b-slate-700 border-l-slate-700 rounded-full"
            />
            <p className="text-slate-300 ml-3 text-lg">جاري تحميل الخدمات...</p>
         </div>
      ) : (
        <div className="w-full max-w-3xl space-y-4 sm:space-y-6 px-2 sm:px-0">
          {servicesConfig.map((service) => (
            <ServiceDisplayCard 
              key={service.id}
              service={service}
              formData={formData}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleSubmit={handleSubmitRequest} 
              isExpanded={expandedCard === service.id}
              onToggleExpand={() => handleToggleExpand(service.id)}
              products={digitalProducts} 
            />
          ))}
        </div>
      )}

      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        currentService={currentService}
        currentServiceRequestId={currentServiceRequestId}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handlePayment={handlePayment}
        bankDetailsBarcodeUrl={bankDetailsBarcodeUrl}
      />
    </div>
  );
};

export default HomePage;
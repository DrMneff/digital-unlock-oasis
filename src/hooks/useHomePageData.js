import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

export const useHomePageData = () => {
  const { toast } = useToast();
  const [digitalProducts, setDigitalProducts] = useState({
    appSubscriptions: [],
    itunesGameCards: [],
    streamingSubscriptions: [],
    imeiChecks: [],
    ecommerceServices: [],
  });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [session, setSession] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase.from('digital_products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const categorizedProducts = {
        appSubscriptions: data.filter(p => p.service_category === 'app_subscription'),
        itunesGameCards: data.filter(p => p.service_category === 'itunes_card'),
        streamingSubscriptions: data.filter(p => p.service_category === 'streaming_subscription'),
        imeiChecks: data.filter(p => p.service_category === 'imei_check'),
        ecommerceServices: data.filter(p => p.service_category === 'ecommerce_service'),
      };
      setDigitalProducts(categorizedProducts);
    } catch (error) {
      console.error("Error fetching digital products:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل المنتجات.", variant: "destructive" });
    } finally {
      setLoadingProducts(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return {
    digitalProducts,
    loadingProducts,
    session,
    fetchProducts, 
    setSession
  };
};
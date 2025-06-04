import { supabase } from '@/lib/supabaseClient';

export const generateInvoiceDetailsUtil = (orderId, service, paymentMethodUsed, user, formData) => {
  const companyInfoData = {
    name: "Drmnef",
    address: "المملكة العربية السعودية",
    email: "Dr.mnef@Gmail.Com",
    phone: "+966538182861"
  };
  return {
    invoice_number: `INV-${orderId.substring(0, 8).toUpperCase()}`,
    issue_date: new Date().toISOString(),
    due_date: new Date().toISOString(),
    customer_name: formData.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "عميل",
    customer_email: formData.email || user?.email || "غير متوفر",
    customer_phone: formData.phone || user?.user_metadata?.phone || user?.phone || null,
    items: [{
      name: service.name,
      quantity: 1,
      unit_price: parseFloat(service.price),
      total_price: parseFloat(service.price)
    }],
    subtotal: parseFloat(service.price),
    tax_rate: 0,
    tax: 0,
    total: parseFloat(service.price),
    payment_method: paymentMethodUsed,
    payment_status_details: paymentMethodUsed === 'bank_transfer' ? 'Pending Bank Confirmation' : 'Payment Initiated',
    company_info: companyInfoData,
    notes: "شكراً لتعاملك معنا!",
  };
};


export const handleServiceRequestSubmit = async (
  serviceDetails,
  formData,
  session,
  toast,
  setCurrentService,
  setCurrentServiceRequestId,
  setShowPaymentModal,
  setFormData,
  initialServiceFormData,
  setExpandedCard
) => {
  setCurrentService(serviceDetails);
  const userEmail = formData.email || session?.user?.email;

  if (!userEmail && serviceDetails.price > 0) {
    toast({ title: "خطأ", description: "يرجى إدخال البريد الإلكتروني أو تسجيل الدخول للمتابعة.", variant: "destructive" });
    return;
  }

  if (serviceDetails.category === 'icloud_bypass_request' && (!formData.name || !formData.email || !formData.serialNumber || !formData.imei_icloud)) {
    toast({ title: "خطأ", description: "يرجى ملء جميع حقول طلب خدمة تجاوز iCloud.", variant: "destructive" });
    return;
  }
  if (serviceDetails.category === 'imei_check' && serviceDetails.price > 0 && !formData.imei) {
    toast({ title: "خطأ", description: "يرجى إدخال رقم IMEI لفحص القائمة السوداء.", variant: "destructive" });
    return;
  }

  if (serviceDetails.price > 0) {
    setCurrentServiceRequestId(null);
    setShowPaymentModal(true);
  } else {
    const requestData = {
      service_name: serviceDetails.name,
      name: formData.name || userEmail?.split('@')[0] || 'زائر',
      email: userEmail || 'غير متوفر (طلب مجاني)',
      customer_phone: formData.phone || session?.user?.user_metadata?.phone || session?.user?.phone || null,
      serial_number: serviceDetails.category === 'icloud_bypass_request' ? formData.serialNumber : null,
      imei: serviceDetails.category === 'icloud_bypass_request' ? formData.imei_icloud : (serviceDetails.category === 'imei_check' ? formData.imei : null),
      udid: formData.udid || null,
      digital_product_id: serviceDetails.id || null,
      status: 'Inquiry Received',
      raw_form_data: { ...formData, service_name_details: serviceDetails.name, selectedProductId: serviceDetails.id, category: serviceDetails.category },
      user_id: session?.user?.id || null,
      payment_status: 'Not Applicable',
    };

    try {
      const { data: serviceRequest, error } = await supabase
        .from('service_requests')
        .insert([requestData])
        .select('id')
        .single();
      if (error) throw error;
      if (serviceRequest?.id) {
        toast({ title: "تم استلام طلبك!", description: `تم إرسال طلبك لـ "${serviceDetails.name}". سنتواصل معك قريباً. رقم الطلب: ${serviceRequest.id}` });

        const adminNotificationPayload = {
          orderDetails: {
            orderId: serviceRequest.id,
            productName: serviceDetails.name,
            productPrice: "0 (استفسار)",
            customerName: requestData.name,
            customerEmail: requestData.email,
          }
        };
        supabase.functions.invoke('admin-order-notification', { body: adminNotificationPayload })
          .then(response => console.log('Admin notification for inquiry sent:', response))
          .catch(err => console.error('Error sending admin notification for inquiry:', err));

        setFormData(initialServiceFormData);
        if (session?.user) setFormData(prev => ({ ...prev, email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split('@')[0] || '', phone: session.user.user_metadata?.phone || session.user.phone || '' }));
        setExpandedCard(null);
      } else {
        toast({ title: "خطأ", description: "لم نتمكن من إنشاء الطلب. حاول مرة أخرى.", variant: "destructive" });
      }
    } catch (err) {
      console.error('Error submitting free/inquiry service request:', err);
      toast({ title: "خطأ في الاتصال", description: `حدث خطأ أثناء إرسال طلبك: ${err.message}.`, variant: "destructive" });
    }
  }
};

export const handlePaymentProcessing = async (
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
  setExpandedCard
) => {
  if (!paymentMethod) {
    toast({ title: "خطأ", description: "يرجى اختيار طريقة الدفع.", variant: "destructive" });
    return;
  }
  if (!currentService || currentService.price <= 0 || !currentService.id) {
    toast({ title: "خطأ", description: "بيانات المنتج غير كاملة أو السعر غير صحيح للدفع.", variant: "destructive" });
    return;
  }

  const userEmail = formData.email || session?.user?.email;
  if (!userEmail) {
    toast({ title: "خطأ", description: "البريد الإلكتروني مطلوب لإتمام عملية الشراء.", variant: "destructive" });
    return;
  }
  let tempServiceRequestId = currentServiceRequestId;

  if (!tempServiceRequestId) {
    const serviceRequestPayload = {
      service_name: currentService.name,
      name: formData.name || userEmail.split('@')[0],
      email: userEmail,
      customer_phone: formData.phone || session?.user?.user_metadata?.phone || session?.user?.phone || null,
      serial_number: currentService.category === 'icloud_bypass_request' ? formData.serialNumber : null,
      imei: currentService.category === 'icloud_bypass_request' ? formData.imei_icloud : (currentService.category === 'imei_check' ? formData.imei : null),
      udid: formData.udid || null,
      digital_product_id: currentService.id,
      status: 'Pending Payment',
      raw_form_data: { ...formData, service_name_details: currentService.name, selectedProductId: currentService.id, category: currentService.category },
      user_id: session?.user?.id || null,
      payment_status: 'Pending',
    };
    try {
      const { data: srData, error: srError } = await supabase
        .from('service_requests')
        .insert(serviceRequestPayload)
        .select('id')
        .single();
      if (srError) throw srError;
      if (!srData || !srData.id) throw new Error("Failed to create service request for order.");
      tempServiceRequestId = srData.id;
      setCurrentServiceRequestId(tempServiceRequestId);
    } catch (err) {
      console.error('Error creating service_request for order:', err);
      toast({ title: "خطأ", description: `لم نتمكن من تهيئة الطلب: ${err.message}`, variant: "destructive" });
      return;
    }
  }

  try {
    const orderStatus = paymentMethod === 'bank_transfer' ? 'Pending Bank Confirmation' : 'Payment Initiated';
    const invoiceDetails = generateInvoiceDetailsUtil(tempServiceRequestId, currentService, paymentMethod, session?.user, formData);

    const orderData = {
      service_request_id: tempServiceRequestId,
      user_id: session?.user?.id || null,
      digital_product_id: currentService.id,
      order_status: orderStatus,
      payment_method: paymentMethod,
      total_amount: currentService.price,
      invoice_details: invoiceDetails,
    };

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select('id')
      .single();

    if (orderError) throw orderError;
    if (!newOrder || !newOrder.id) throw new Error("Failed to create order record.");

    const { error: srUpdateError } = await supabase
      .from('service_requests')
      .update({
        status: orderStatus,
        payment_method: paymentMethod,
        order_id: newOrder.id,
        payment_status: orderStatus === 'Pending Bank Confirmation' ? 'Pending Confirmation' : 'Initiated'
      })
      .eq('id', tempServiceRequestId);

    if (srUpdateError) throw srUpdateError;

    toast({ title: "نجاح!", description: `تم إنشاء طلبك لـ "${currentService.name}" بنجاح! (رقم الطلب: ${newOrder.id}). يرجى إكمال الدفع.` });

    const adminNotificationPayload = {
      orderDetails: {
        orderId: newOrder.id,
        productName: currentService.name,
        productPrice: currentService.price,
        customerName: formData.name || userEmail.split('@')[0],
        customerEmail: userEmail,
      }
    };
    supabase.functions.invoke('admin-order-notification', { body: adminNotificationPayload })
      .then(response => console.log('Admin notification for paid order sent:', response))
      .catch(err => console.error('Error sending admin notification for paid order:', err));

    if (paymentMethod === 'paypal') {
      const paypalEmail = "mnefal3mzi@hotmail.com";
      const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${paypalEmail}&item_name=${encodeURIComponent(currentService.name + ` (Order: ${newOrder.id})`)}&amount=${currentService.price}&currency_code=SAR&custom=${newOrder.id}`;
      window.open(paypalUrl, '_blank');
    }

    setFormData(initialServiceFormData);
    if (session?.user) setFormData(prev => ({ ...prev, email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split('@')[0] || '', phone: session.user.user_metadata?.phone || session.user.phone || '' }));
    setShowPaymentModal(false);
    setPaymentMethod('');
    setCurrentService({ name: '', price: 0, id: null, category: '' });
    setCurrentServiceRequestId(null);
    setExpandedCard(null);

  } catch (err) {
    console.error('Error processing payment and order:', err);
    toast({ title: "خطأ في معالجة الطلب", description: `حدث خطأ: ${err.message}. يرجى المحاولة مرة أخرى أو التواصل معنا.`, variant: "destructive" });
  }
};
import React from 'react';
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter as ShadAlertDialogFooter } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PaymentModal = ({
  showPaymentModal,
  setShowPaymentModal,
  currentService,
  currentServiceRequestId, // This can be null if it's a direct product purchase without a prior service_request
  paymentMethod,
  setPaymentMethod,
  handlePayment,
  bankDetailsBarcodeUrl,
}) => {
  if (!currentService || typeof currentService.price === 'undefined') {
    return null; // Or some fallback UI if currentService is not properly defined
  }

  return (
    <AlertDialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-purple-300">إتمام الطلب والدفع</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            أنت على وشك شراء: <span className="font-semibold text-purple-400">{currentService.name}</span> بسعر: <span className="font-semibold text-green-400">{currentService.price} ريال</span>.
            {currentServiceRequestId && (
              <span> (رقم الطلب الأساسي: <span className="font-mono text-sm">{currentServiceRequestId}</span>)</span>
            )}
            . يرجى اختيار طريقة الدفع.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="paymentMethod" className="text-slate-300">اختر طريقة الدفع:</Label>
            <Select onValueChange={setPaymentMethod} value={paymentMethod}>
              <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                <SelectValue placeholder="اختر طريقة الدفع" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                <SelectItem value="paypal" className="hover:bg-slate-600">PayPal (mnefal3mzi@hotmail.com)</SelectItem>
                <SelectItem value="bank_transfer" className="hover:bg-slate-600">تحويل بنك الراجحي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {paymentMethod === 'bank_transfer' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 border border-dashed border-slate-600 rounded-md text-sm text-slate-300 space-y-2"
            >
              <p className="font-semibold text-purple-300">بيانات التحويل لبنك الراجحي:</p>
              <p>رقم الحساب: <span className="font-mono">430000010006086069072</span></p>
              <p>رقم الآيبان: <span className="font-mono">SA1780000430608016069072</span></p>
              <p>يرجى إرفاق صورة من إيصال التحويل عند التواصل معنا عبر واتساب لتأكيد طلبك (مع ذكر اسم المنتج أو رقم الطلب الأساسي إذا وجد: <span className="font-mono text-xs">{currentServiceRequestId || currentService.name}</span>).</p>
              <p className="font-semibold">باركود التحويل السريع:</p>
              <div className="flex justify-center">
                <img alt="باركود تحويل بنك الراجحي" className="w-40 h-40 sm:w-48 sm:h-48 rounded-md bg-white p-1" src={bankDetailsBarcodeUrl} />
              </div>
            </motion.div>
          )}
        </div>
        <ShadAlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowPaymentModal(false)} className="border-slate-600 hover:bg-slate-700 text-slate-300">إلغاء</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handlePayment} 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!paymentMethod || currentService.price <= 0}
          >
            تأكيد الدفع والمتابعة
          </AlertDialogAction>
        </ShadAlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaymentModal;
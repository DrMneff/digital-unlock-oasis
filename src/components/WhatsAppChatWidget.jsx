import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare as MessageSquareText, Send, X, User, Phone as PhoneIcon } from 'lucide-react';

const WhatsAppChatWidget = ({ adminPhoneNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    let fullMessage = `*رسالة من زائر الموقع:*\n`;
    if (userName.trim()) {
      fullMessage += `*الاسم:* ${userName.trim()}\n`;
    }
    if (userPhone.trim()) {
      fullMessage += `*رقم الهاتف:* ${userPhone.trim()}\n`;
    }
    fullMessage += `*الرسالة:* ${message.trim()}`;
    
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
    setMessage('');
    // Optionally clear name and phone after sending, or keep them for next message
    // setUserName(''); 
    // setUserPhone('');
    setIsOpen(false); // Close widget after sending
  };

  const widgetVariants = {
    closed: { opacity: 0, y: 20, scale: 0.95 },
    open: { opacity: 1, y: 0, scale: 1 }
  };

  const iconVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 }
  };

  return (
    <>
      <button
        onClick={toggleOpen}
        className="fixed bottom-24 left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-xl z-50 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        aria-label="افتح نافذة الدردشة"
      >
        <motion.div variants={iconVariants} animate={isOpen ? "open" : "closed"}>
          {isOpen ? <X size={28} /> : <MessageSquareText size={28} />}
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={widgetVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-40 left-6 sm:left-8 w-[calc(100%-3rem)] sm:w-80 h-auto bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col"
            dir="rtl"
          >
            <header className="bg-slate-700/50 p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold text-purple-300">تواصل معنا عبر واتساب</h3>
              <button onClick={toggleOpen} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </header>
            
            <form onSubmit={handleSend} className="p-4 space-y-4 flex-grow flex flex-col">
              <div>
                <Label htmlFor="chat-user-name" className="text-sm text-slate-300 mb-1 block">اسمك (اختياري)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    id="chat-user-name"
                    type="text" 
                    placeholder="مثال: عبدالله" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    className="bg-slate-700 border-slate-600 placeholder-slate-500 pl-10 text-sm" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="chat-user-phone" className="text-sm text-slate-300 mb-1 block">رقم هاتفك (اختياري)</Label>
                 <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    id="chat-user-phone"
                    type="tel" 
                    placeholder="مثال: 966501234567" 
                    value={userPhone} 
                    onChange={(e) => setUserPhone(e.target.value)} 
                    className="bg-slate-700 border-slate-600 placeholder-slate-500 pl-10 text-sm" 
                  />
                </div>
              </div>
              <div className="flex-grow flex flex-col">
                <Label htmlFor="chat-message" className="text-sm text-slate-300 mb-1 block">رسالتك</Label>
                <Textarea
                  id="chat-message"
                  placeholder="اكتب استفسارك هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 placeholder-slate-500 flex-grow resize-none text-sm min-h-[80px]"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2.5 flex items-center justify-center gap-2">
                <Send size={18} /> إرسال عبر واتساب
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppChatWidget;
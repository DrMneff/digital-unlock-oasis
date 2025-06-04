import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] text-center px-4"
    >
      <AlertTriangle className="w-24 h-24 text-yellow-400 mb-8 animate-bounce" />
      <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-slate-200 mb-6">أُووبس! الصفحة غير موجودة.</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        يبدو أنك تائه في الفضاء الرقمي. الصفحة التي تبحث عنها قد تكون حُذفت، أو تغير اسمها، أو أنها لم تكن موجودة أصلاً.
      </p>
      <Link to="/">
        <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
          العودة إلى الصفحة الرئيسية
        </Button>
      </Link>
    </motion.div>
  );
};

export default NotFoundPage;
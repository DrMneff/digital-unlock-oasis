import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; // ArrowRight for RTL "Back"

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="outline" 
      onClick={() => navigate(-1)} 
      className="mb-6 bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300"
    >
      <ArrowRight className="ml-2 h-4 w-4" /> الرجوع
    </Button>
  );
};

export default BackButton;
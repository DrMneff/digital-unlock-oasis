import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from 'lucide-react';

const ServiceDisplayCard = ({ service, formData, handleInputChange, handleSelectChange, handleSubmit, isExpanded, onToggleExpand, products }) => {
  const MotionCard = motion(Card);

  return (
    <MotionCard
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      className="bg-slate-800/70 backdrop-blur-md border-slate-700 shadow-2xl overflow-hidden w-full"
    >
      <CardHeader 
        className="cursor-pointer flex flex-row justify-between items-center p-4 sm:p-6" 
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {service.icon}
          <div>
            <CardTitle className={`text-lg sm:text-xl font-semibold ${service.titleColor}`}>{service.title}</CardTitle>
            {!isExpanded && <CardDescription className="text-xs sm:text-sm text-slate-400 mt-1">{service.shortDescription}</CardDescription>}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
      </CardHeader>
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <CardContent className="p-4 sm:p-6 md:p-8 border-t border-slate-700/50">
          {React.cloneElement(service.component, { 
            formData, 
            handleInputChange, 
            handleSelectChange, 
            handleSubmit, 
            products: products[service.productCategoryKey] || [] // Pass only relevant products
          })}
        </CardContent>
      </motion.div>
    </MotionCard>
  );
};

export default ServiceDisplayCard;
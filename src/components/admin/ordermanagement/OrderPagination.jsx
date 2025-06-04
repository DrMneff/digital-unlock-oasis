import React from 'react';
import { Button } from '@/components/ui/button';

const OrderPagination = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  const pagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

  if (endPage - startPage + 1 < pagesToShow) {
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  const pageButtons = [];
  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <Button
        key={i}
        variant={currentPage === i ? 'default' : 'outline'}
        size="sm"
        onClick={() => setCurrentPage(i)}
        className={`mx-1 ${currentPage === i ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'}`}
      >
        {i}
      </Button>
    );
  }

  return (
    <div className="flex justify-center items-center mt-6">
      <Button 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
        disabled={currentPage === 1}
        variant="outline" size="sm" className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300"
      >
        السابق
      </Button>
      {startPage > 1 && <span className="mx-1 text-slate-400">...</span>}
      {pageButtons}
      {endPage < totalPages && <span className="mx-1 text-slate-400">...</span>}
      <Button 
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
        disabled={currentPage === totalPages}
        variant="outline" size="sm" className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300"
      >
        التالي
      </Button>
    </div>
  );
};

export default OrderPagination;
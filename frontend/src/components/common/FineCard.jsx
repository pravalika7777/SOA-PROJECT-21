import React from 'react';
import Badge from './Badge';
import Button from './Button';
import { Receipt, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FineCard = ({ fine, onPay, isPaying, isLibrarian }) => {
  const isPending = fine.status === 'PENDING';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all duration-150">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-800 text-sm">Fine #{fine.fineId}</span>
            <span className="text-slate-400 text-xs block">Loan #{fine.rentalId}</span>
          </div>
        </div>
        <Badge variant={fine.status} size="sm">
          {fine.status}
        </Badge>
      </div>

      <div className="my-4 p-3 bg-slate-50 rounded-lg flex items-baseline justify-between">
        <span className="text-xs text-slate-500 font-medium">Fine Amount</span>
        <span className="text-xl font-bold text-slate-900">
          ₹{fine.amount ? fine.amount.toFixed(2) : '0.00'}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <Link
          to={`/fines/${fine.fineId}`}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Details
        </Link>
        {isLibrarian && isPending && onPay && (
          <Button
            size="sm"
            variant="success"
            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
            onClick={() => onPay(fine)}
            isLoading={isPaying}
          >
            Mark Paid
          </Button>
        )}
      </div>
    </div>
  );
};

export default FineCard;

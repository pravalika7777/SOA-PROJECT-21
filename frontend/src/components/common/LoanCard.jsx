import React from 'react';
import Badge from './Badge';
import Button from './Button';
import { formatDate, calculateDueDate } from '../../utils/formatDate';
import { BookOpen, Calendar, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoanCard = ({ loan, bookTitle, onReturn, isReturning }) => {
  const isBorrowed = loan.status === 'BORROWED';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all duration-150">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <span className="font-semibold text-slate-800">Loan #{loan.loanId}</span>
          <span>•</span>
          <span>Book #{loan.bookId}</span>
        </div>
        <Badge variant={loan.status} size="sm">
          {loan.status}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
          {bookTitle || `Book ID: ${loan.bookId}`}
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-lg">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Issued</span>
          <span className="font-medium flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(loan.issueDate)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
            {loan.returnDate ? 'Returned' : 'Due Date'}
          </span>
          <span className="font-medium flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            {loan.returnDate ? formatDate(loan.returnDate) : calculateDueDate(loan.issueDate)}
          </span>
        </div>
      </div>

      {loan.fineAmount !== null && loan.fineAmount !== undefined && (
        <div className="mb-4 text-xs flex items-center justify-between text-slate-600 px-1">
          <span>Fine:</span>
          <span className={`font-semibold ${loan.fineAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹{loan.fineAmount.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <Link
          to={`/loans/${loan.loanId}`}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Details
        </Link>
        {isBorrowed && onReturn && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
            onClick={() => onReturn(loan)}
            isLoading={isReturning}
          >
            Return Book
          </Button>
        )}
      </div>
    </div>
  );
};

export default LoanCard;

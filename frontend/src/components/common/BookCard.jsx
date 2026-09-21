import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Button from './Button';

export const BookCard = ({ book, onBorrow, isBorrowing }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <Badge variant={isAvailable ? 'available' : 'out_of_stock'} size="sm">
            {isAvailable ? `${book.availableCopies} Available` : 'Out of Stock'}
          </Badge>
        </div>

        <h3 className="text-base font-semibold text-slate-900 line-clamp-1 mb-1" title={book.title}>
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-1 mb-4">
          By <span className="font-medium text-slate-700">{book.author}</span>
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-4">
          <span>ID: #{book.bookId}</span>
          <span>•</span>
          <span>Stock: {book.availableCopies} copies</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/books/${book.bookId}`}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {onBorrow && (
          <Button
            size="sm"
            variant={isAvailable ? 'primary' : 'outline'}
            disabled={!isAvailable || isBorrowing}
            onClick={() => onBorrow(book)}
          >
            {isAvailable ? 'Borrow Book' : 'Unavailable'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookCard;

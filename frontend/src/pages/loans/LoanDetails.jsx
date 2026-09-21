import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loanService } from '../../services/loanService';
import { bookService } from '../../services/bookService';
import { fineService } from '../../services/fineService';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate, calculateDueDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  Calendar,
  Clock,
  RotateCcw,
  Receipt,
  User,
} from 'lucide-react';

export const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLibrarian } = useAuth();

  const [loan, setLoan] = useState(null);
  const [book, setBook] = useState(null);
  const [fine, setFine] = useState(null);
  const [loading, setLoading] = useState(true);

  // Return state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returning, setReturning] = useState(false);

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      const loanData = await loanService.getLoanById(id);
      setLoan(loanData);

      if (loanData && loanData.bookId) {
        const bookData = await bookService.getBookById(loanData.bookId).catch(() => null);
        setBook(bookData);
      }

      // Check fine by rental/loan id
      const finesData = await fineService.getFinesByRental(id).catch(() => null);
      if (Array.isArray(finesData) && finesData.length > 0) {
        setFine(finesData[0]);
      } else if (finesData && !Array.isArray(finesData)) {
        setFine(finesData);
      }
    } catch {
      toast.error('Failed to load loan record details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [id]);

  const handleConfirmReturn = async () => {
    try {
      setReturning(true);
      await loanService.returnLoan(id);
      toast.success('Book returned successfully.');
      setReturnModalOpen(false);
      fetchLoanData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to return book';
      toast.error(typeof msg === 'string' ? msg : 'Failed to return book');
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading circulation record..." />
      </div>
    );
  }

  if (!loan) return null;

  const isBorrowed = loan.status === 'BORROWED';
  const dueDate = loan.dueDate || calculateDueDate(loan.issueDate);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <PageHeader
          title={`Circulation Loan #${loan.id || loan.loanId}`}
          subtitle="Detailed checkout logs and circulation lifecycle metadata."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Loan Status</h2>
              </div>
              <div>
                {loan.status === 'BORROWED' && <Badge variant="blue">BORROWED</Badge>}
                {loan.status === 'RETURNED' && <Badge variant="green">RETURNED</Badge>}
                {loan.status === 'OVERDUE' && <Badge variant="red">OVERDUE</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Circulation Loan ID</p>
                <p className="font-mono font-bold text-slate-800 mt-1">#{loan.id || loan.loanId}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Borrower Identity</p>
                <p className="font-semibold text-slate-800 mt-1">User #{loan.userId}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Date Issued</p>
                <p className="font-medium text-slate-700 mt-1">{formatDate(loan.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Date Due</p>
                <p className="font-medium text-slate-700 mt-1">{formatDate(dueDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Date Returned</p>
                <p className="font-medium text-slate-700 mt-1">
                  {loan.returnDate ? formatDate(loan.returnDate) : 'Not yet returned'}
                </p>
              </div>
            </div>
          </Card>

          {/* Book Details */}
          <Card>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Associated Resource</h2>
            </div>

            {book ? (
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">{book.title}</h3>
                <p className="text-sm text-slate-600">
                  Author: <span className="font-medium text-slate-800">{book.author}</span>
                </p>
                <p className="text-xs font-mono text-slate-400">System Book ID: #{book.id || book.bookId}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Book ID: #{loan.bookId}</p>
            )}
          </Card>

          {/* Fine Card if exists */}
          {fine && (
            <Card className="border-amber-200 bg-amber-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Circulation Fine: ₹{Number(fine.fineAmount || fine.amount || 0).toFixed(2)}
                    </h3>
                    <p className="text-xs text-slate-500">Status: {fine.status}</p>
                  </div>
                </div>
                <Badge variant={fine.status === 'PAID' ? 'green' : 'red'}>
                  {fine.status}
                </Badge>
              </div>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div>
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Actions</h3>
            {isBorrowed ? (
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => setReturnModalOpen(true)}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Return Book</span>
              </Button>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs text-center font-medium">
                This circulation record has been completed and returned.
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleConfirmReturn}
        title="Confirm Book Return"
        message="Are you sure you want to return this book? The available inventory copy will be restored."
        confirmText={returning ? 'Returning...' : 'Confirm Return'}
        confirmVariant="primary"
        loading={returning}
      />
    </div>
  );
};

export default LoanDetails;

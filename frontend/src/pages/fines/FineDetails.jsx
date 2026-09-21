import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fineService } from '../../services/fineService';
import { loanService } from '../../services/loanService';
import { bookService } from '../../services/bookService';
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
  Receipt,
  CheckCircle,
  CreditCard,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const FineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLibrarian } = useAuth();

  const [fine, setFine] = useState(null);
  const [loan, setLoan] = useState(null);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pay Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const fetchFineDetails = async () => {
    try {
      setLoading(true);
      const fineData = await fineService.getFineById(id);
      setFine(fineData);

      const rentalId = fineData.rentalId || fineData.loanId;
      if (rentalId) {
        const loanData = await loanService.getLoanById(rentalId).catch(() => null);
        setLoan(loanData);

        if (loanData && loanData.bookId) {
          const bookData = await bookService.getBookById(loanData.bookId).catch(() => null);
          setBook(bookData);
        }
      }
    } catch {
      toast.error('Failed to load fine specifications');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFineDetails();
  }, [id]);

  const handleConfirmPay = async () => {
    try {
      setPaying(true);
      await fineService.payFine(id);
      toast.success('Fine marked as PAID successfully.');
      setPayModalOpen(false);
      fetchFineDetails();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to settle fine';
      toast.error(typeof msg === 'string' ? msg : 'Failed to settle fine');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading fine ledger details..." />
      </div>
    );
  }

  if (!fine) return null;

  const amount = Number(fine.fineAmount || fine.amount) || 0;
  const isPending = fine.status === 'PENDING';

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
          title={`Fine Specification #${fine.id || fine.fineId}`}
          subtitle="Audit breakdown for overdue circulation penalty."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">Fine Status</h2>
              </div>
              <Badge variant={isPending ? 'red' : 'green'}>
                {fine.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Fine ID</p>
                <p className="font-mono font-bold text-slate-800 mt-1">#{fine.id || fine.fineId}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Circulation Rental ID</p>
                <p className="font-mono font-semibold text-slate-800 mt-1">#{fine.rentalId || fine.loanId}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Total Penalty Amount</p>
                <p className="text-xl font-extrabold text-rose-600 mt-1">₹{amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400">Standard Rate</p>
                <p className="font-medium text-slate-700 mt-1">₹5.00 / day overdue</p>
              </div>
            </div>
          </Card>

          {/* Associated Book and Loan info */}
          <Card>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Associated Resource &amp; Dates</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Book Title</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {book ? book.title : loan ? `Book #${loan.bookId}` : 'Academic Resource'}
                </p>
              </div>

              {loan && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-400">Date Issued</span>
                    <p className="text-slate-700 font-medium">{formatDate(loan.issueDate)}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-400">Date Due</span>
                    <p className="text-slate-700 font-medium">
                      {formatDate(loan.dueDate || calculateDueDate(loan.issueDate))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Ledger Action</h3>
            {isPending && isLibrarian ? (
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => setPayModalOpen(true)}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Paid</span>
              </Button>
            ) : isPending ? (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs">
                This fine is currently pending settlement. Please present payment to a campus librarian.
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Payment recorded and reconciled in full.</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onConfirm={handleConfirmPay}
        title="Reconcile Fine Payment"
        message={`Confirm settlement of ₹${amount.toFixed(2)} for Fine #${fine.id || fine.fineId}?`}
        confirmText={paying ? 'Updating...' : 'Confirm Paid'}
        confirmVariant="primary"
        loading={paying}
      />
    </div>
  );
};

export default FineDetails;

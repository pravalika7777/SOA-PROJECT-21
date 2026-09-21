import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
import { loanService } from '../../services/loanService';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import {
  BookOpen,
  ArrowLeft,
  Layers,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLibrarian } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);

  // Borrow state
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [borrowing, setBorrowing] = useState(false);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBookById(id);
      setBook(data);
    } catch {
      toast.error('Failed to load book specifications');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const handleCheckAvailability = async () => {
    try {
      setCheckingAvailability(true);
      const isAvail = await bookService.checkAvailability(id);
      setAvailabilityStatus(isAvail);
      if (isAvail) {
        toast.success('Confirmed: Copies are currently available for circulation.');
      } else {
        toast.error('All copies of this resource are currently checked out.');
      }
    } catch {
      toast.error('Failed to query availability service');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleConfirmBorrow = async () => {
    if (!book || !user?.userId) {
      toast.error('Unable to verify user credentials');
      return;
    }

    try {
      setBorrowing(true);
      await loanService.createLoan({
        userId: user.userId,
        bookId: book.id || book.bookId,
      });

      toast.success('Book borrowed successfully.');
      setBorrowModalOpen(false);
      fetchBookDetails();
    } catch (err) {
      const status = err.response?.status;
      const respData = err.response?.data;
      const errorMsg =
        typeof respData === 'string'
          ? respData
          : respData?.message || respData?.error || '';

      if (status === 409) {
        const lower = errorMsg.toLowerCase();
        if (lower.includes('duplicate') || lower.includes('already') || lower.includes('active loan')) {
          toast.error('Already borrowed: You already have an active loan for this book.');
        } else if (lower.includes('copy') || lower.includes('copies') || lower.includes('available')) {
          toast.error('No copies available for this book.');
        } else {
          toast.error(errorMsg || 'Cannot borrow book at this time.');
        }
      } else {
        toast.error(errorMsg || 'Failed to borrow book.');
      }
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading academic resource..." />
      </div>
    );
  }

  if (!book) return null;

  const copies = Number(book.availableCopies) || 0;
  const isAvailable = copies > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <button
          onClick={() => navigate('/books')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <PageHeader
          title={book.title}
          subtitle={`By ${book.author} • Academic Resource ID #${book.id || book.bookId}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-700 rounded-2xl shrink-0">
                <BookOpen className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">
                  Resource Specification
                </span>
                <h2 className="text-xl font-bold text-slate-900">{book.title}</h2>
                <p className="text-sm font-medium text-slate-600">
                  Authored by: <span className="text-slate-800">{book.author}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Inventory Status</p>
                <div className="mt-1">
                  {copies > 2 ? (
                    <Badge variant="green">AVAILABLE ({copies} COPIES)</Badge>
                  ) : copies > 0 ? (
                    <Badge variant="yellow">LIMITED STOCK ({copies} LEFT)</Badge>
                  ) : (
                    <Badge variant="red">OUT OF STOCK</Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">System Identification</p>
                <p className="mt-1 text-sm font-mono font-semibold text-slate-700">
                  REF-{book.id || book.bookId}
                </p>
              </div>
            </div>
          </Card>

          {/* Availability Service Verification */}
          <Card className="bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real-Time Service Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct inquiry to Book Microservice availability endpoint.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckAvailability}
                disabled={checkingAvailability}
              >
                {checkingAvailability ? 'Verifying...' : 'Check Availability'}
              </Button>
            </div>

            {availabilityStatus !== null && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-2 text-xs">
                {availabilityStatus ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      Service confirms: Title is in stock and ready for immediate circulation.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-700 font-semibold">
                      Service confirms: No active copies currently available.
                    </span>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Circulation Action</h3>

            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-indigo-950">Circulation Policy:</p>
                <p>&bull; Standard borrowing duration is 14 days.</p>
                <p>&bull; Late returns accrue overdue fines automatically.</p>
                <p>&bull; Duplicate active loans on same title are prohibited.</p>
              </div>

              {!isLibrarian ? (
                <Button
                  variant="primary"
                  className="w-full justify-center py-2.5"
                  disabled={!isAvailable}
                  onClick={() => setBorrowModalOpen(true)}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Borrow This Book</span>
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 italic">
                    Administrative account: use Inventory Management to modify catalog records.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => navigate('/admin/books')}
                  >
                    Manage Inventory
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onConfirm={handleConfirmBorrow}
        title="Confirm Book Borrowing"
        message={`Are you sure you want to borrow "${book.title}"? Your active loan will be logged and the available copy count will be reduced.`}
        confirmText={borrowing ? 'Borrowing...' : 'Borrow Book'}
        confirmVariant="primary"
        loading={borrowing}
      />
    </div>
  );
};

export default BookDetails;

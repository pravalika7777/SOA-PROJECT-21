import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loanService } from '../../services/loanService';
import { bookService } from '../../services/bookService';
import { fineService } from '../../services/fineService';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate, calculateDueDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import {
  ArrowLeftRight,
  RotateCcw,
  CheckCircle,
  Clock,
  Receipt,
  BookOpen,
  Eye,
} from 'lucide-react';

export const Loans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);
  const [booksMap, setBooksMap] = useState(new Map());
  const [finesMap, setFinesMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Return Book State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returning, setReturning] = useState(false);

  const fetchLoansData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const [userLoans, allBooks, allFines] = await Promise.all([
        loanService.getUserLoans(user.userId).catch(() => []),
        bookService.getAllBooks().catch(() => []),
        fineService.getFines().catch(() => []),
      ]);

      setLoans(Array.isArray(userLoans) ? userLoans : []);

      // Build book map
      const bMap = new Map();
      (Array.isArray(allBooks) ? allBooks : []).forEach((b) => {
        bMap.set(b.id || b.bookId, b);
      });
      setBooksMap(bMap);

      // Build fine map by rental/loan ID
      const fMap = new Map();
      (Array.isArray(allFines) ? allFines : []).forEach((f) => {
        fMap.set(f.rentalId || f.loanId, f);
      });
      setFinesMap(fMap);
    } catch {
      toast.error('Failed to load borrowing history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoansData();
  }, [user]);

  const handleOpenReturnModal = (loan) => {
    setSelectedLoan(loan);
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedLoan) return;

    try {
      setReturning(true);
      const loanId = selectedLoan.id || selectedLoan.loanId;
      await loanService.returnLoan(loanId);

      // Check if overdue by comparing due date with today
      const dueDate = selectedLoan.dueDate || calculateDueDate(selectedLoan.issueDate);
      const isLate = new Date() > new Date(dueDate);

      if (isLate) {
        toast.success('Book returned. Fine calculated.');
      } else {
        toast.success('Book returned successfully.');
      }

      setReturnModalOpen(false);
      setSelectedLoan(null);
      fetchLoansData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to return book';
      toast.error(typeof msg === 'string' ? msg : 'Failed to return book');
    } finally {
      setReturning(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    if (filterStatus === 'ALL') return true;
    return loan.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Circulation Loans"
        subtitle="Track active borrow records, view due dates, and return checked-out titles."
        action={
          <Button variant="primary" onClick={() => navigate('/books')}>
            <BookOpen className="w-4 h-4" />
            <span>Borrow More Books</span>
          </Button>
        }
      />

      {/* Filter Tabs */}
      <Card padding="sm">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              filterStatus === 'ALL'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Loans ({loans.length})
          </button>
          <button
            onClick={() => setFilterStatus('BORROWED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              filterStatus === 'BORROWED'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active ({loans.filter((l) => l.status === 'BORROWED').length})
          </button>
          <button
            onClick={() => setFilterStatus('RETURNED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              filterStatus === 'RETURNED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Returned ({loans.filter((l) => l.status === 'RETURNED').length})
          </button>
          <button
            onClick={() => setFilterStatus('OVERDUE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              filterStatus === 'OVERDUE'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overdue ({loans.filter((l) => l.status === 'OVERDUE').length})
          </button>
        </div>
      </Card>

      {/* Loans Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading your circulation records..." />
        </div>
      ) : filteredLoans.length === 0 ? (
        <EmptyState
          title="No Circulation Records"
          description={
            filterStatus === 'ALL'
              ? 'You have not borrowed any books yet.'
              : `No loans found matching status "${filterStatus}".`
          }
          actionLabel="Explore Catalog"
          onAction={() => navigate('/books')}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Loan ID</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Return Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Fine Info</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const loanId = loan.id || loan.loanId;
                  const book = booksMap.get(loan.bookId);
                  const fine = finesMap.get(loanId);
                  const isBorrowed = loan.status === 'BORROWED';
                  const isReturned = loan.status === 'RETURNED';
                  const isOverdue = loan.status === 'OVERDUE';
                  const dueDate = loan.dueDate || calculateDueDate(loan.issueDate);

                  return (
                    <tr key={loanId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{loanId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {book ? book.title : `Book #${loan.bookId}`}
                        {book && (
                          <span className="block text-xs font-normal text-slate-500">
                            by {book.author}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(loan.issueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(dueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {loan.returnDate ? formatDate(loan.returnDate) : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isBorrowed && <Badge variant="blue">BORROWED</Badge>}
                        {isReturned && <Badge variant="green">RETURNED</Badge>}
                        {isOverdue && <Badge variant="red">OVERDUE</Badge>}
                      </td>
                      <td className="py-3.5 px-4">
                        {fine ? (
                          <span className={`text-xs font-bold ${fine.status === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ₹{Number(fine.fineAmount || fine.amount || 0).toFixed(2)} ({fine.status})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/loans/${loanId}`)}
                            title="Inspect Loan Details"
                          >
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>

                          {isBorrowed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReturnModal(loan)}
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Return</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleConfirmReturn}
        title="Return Academic Resource"
        message={`Are you sure you want to return "${
          selectedLoan
            ? (booksMap.get(selectedLoan.bookId)?.title || `Book #${selectedLoan.bookId}`)
            : 'this book'
        }"? The book copy will be returned to available inventory.`}
        confirmText={returning ? 'Returning...' : 'Confirm Return'}
        confirmVariant="primary"
        loading={returning}
      />
    </div>
  );
};

export default Loans;

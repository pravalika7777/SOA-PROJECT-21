import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fineService } from '../../services/fineService';
import { loanService } from '../../services/loanService';
import { bookService } from '../../services/bookService';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import {
  Receipt,
  CheckCircle,
  CreditCard,
  Eye,
  AlertCircle,
} from 'lucide-react';

export const Fines = () => {
  const { user, isLibrarian } = useAuth();
  const navigate = useNavigate();

  const [fines, setFines] = useState([]);
  const [loansMap, setLoansMap] = useState(new Map());
  const [booksMap, setBooksMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Fine Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [paying, setPaying] = useState(false);

  const fetchFinesData = async () => {
    try {
      setLoading(true);

      const [finesData, loansData, booksData] = await Promise.all([
        fineService.getFines().catch(() => []),
        loanService.getAllLoans().catch(() => []),
        bookService.getAllBooks().catch(() => []),
      ]);

      const lMap = new Map();
      (Array.isArray(loansData) ? loansData : []).forEach((l) => {
        lMap.set(l.id || l.loanId, l);
      });
      setLoansMap(lMap);

      const bMap = new Map();
      (Array.isArray(booksData) ? booksData : []).forEach((b) => {
        bMap.set(b.id || b.bookId, b);
      });
      setBooksMap(bMap);

      let displayedFines = Array.isArray(finesData) ? finesData : [];

      // If student, filter fines for student's loans
      if (!isLibrarian && user?.userId) {
        const studentLoanIds = new Set(
          (Array.isArray(loansData) ? loansData : [])
            .filter((l) => l.userId === user.userId)
            .map((l) => l.id || l.loanId)
        );
        displayedFines = displayedFines.filter((f) =>
          studentLoanIds.has(f.rentalId || f.loanId)
        );
      }

      setFines(displayedFines);
    } catch {
      toast.error('Failed to query fines from financial service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinesData();
  }, [user, isLibrarian]);

  const handleOpenPayModal = (fine) => {
    setSelectedFine(fine);
    setPayModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedFine) return;
    try {
      setPaying(true);
      const fineId = selectedFine.id || selectedFine.fineId;
      await fineService.payFine(fineId);
      toast.success('Fine marked as PAID successfully.');
      setPayModalOpen(false);
      setSelectedFine(null);
      fetchFinesData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to settle fine';
      toast.error(typeof msg === 'string' ? msg : 'Failed to settle fine');
    } finally {
      setPaying(false);
    }
  };

  const filteredFines = fines.filter((fine) => {
    if (filterStatus === 'ALL') return true;
    return fine.status === filterStatus;
  });

  const totalOutstanding = fines
    .filter((f) => f.status === 'PENDING')
    .reduce((acc, f) => acc + (Number(f.fineAmount || f.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLibrarian ? 'Fine Management & Fee Audit' : 'My Library Fines'}
        subtitle={
          isLibrarian
            ? 'Monitor late return fines, audit receipts, and confirm fee reconciliations.'
            : 'Review outstanding overdue charges and payment records for your loans.'
        }
      />

      {/* Summary Banner */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Total Outstanding Balance
              </p>
              <h2 className="text-2xl font-black text-amber-300">
                ₹{totalOutstanding.toFixed(2)}
              </h2>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            {isLibrarian
              ? 'Librarians can confirm offline/cash fee settlements.'
              : 'Please visit the library circulation desk to settle outstanding balances.'}
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <Card padding="sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Fines ({fines.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'PENDING'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({fines.filter((f) => f.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilterStatus('PAID')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'PAID'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Settled ({fines.filter((f) => f.status === 'PAID').length})
          </button>
        </div>
      </Card>

      {/* Fines Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Auditing fine ledgers..." />
        </div>
      ) : filteredFines.length === 0 ? (
        <EmptyState
          title="No Fines on Record"
          description={
            filterStatus === 'ALL'
              ? 'There are currently no overdue fines associated with your loans.'
              : `No fines found with status "${filterStatus}".`
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Fine ID</th>
                  <th className="py-3.5 px-4">Loan ID</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Fine Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFines.map((fine) => {
                  const fineId = fine.id || fine.fineId;
                  const rentalId = fine.rentalId || fine.loanId;
                  const loan = loansMap.get(rentalId);
                  const book = loan ? booksMap.get(loan.bookId) : null;
                  const amount = Number(fine.fineAmount || fine.amount) || 0;
                  const isPending = fine.status === 'PENDING';

                  return (
                    <tr key={fineId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{fineId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        #{rentalId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {book ? book.title : loan ? `Book #${loan.bookId}` : 'Academic Title'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <Badge variant="red">PENDING</Badge>
                        ) : (
                          <Badge variant="green">PAID</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/fines/${fineId}`)}
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>

                          {isLibrarian && isPending && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPayModal(fine)}
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark as Paid</span>
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

      {/* Payment Confirmation Modal for Librarian */}
      <ConfirmModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onConfirm={handleConfirmPayment}
        title="Reconcile Fine Payment"
        message={`Mark Fine #${selectedFine?.id || selectedFine?.fineId} (Amount: ₹${Number(
          selectedFine?.fineAmount || selectedFine?.amount || 0
        ).toFixed(2)}) as PAID? This will update the financial ledger in Fine Service.`}
        confirmText={paying ? 'Reconciling...' : 'Confirm Paid'}
        confirmVariant="primary"
        loading={paying}
      />
    </div>
  );
};

export default Fines;

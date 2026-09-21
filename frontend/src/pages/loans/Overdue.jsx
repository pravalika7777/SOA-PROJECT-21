import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { bookService } from '../../services/bookService';
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
  AlertTriangle,
  Bell,
  Eye,
  RotateCcw,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const Overdue = () => {
  const navigate = useNavigate();

  const [overdueLoans, setOverdueLoans] = useState([]);
  const [booksMap, setBooksMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);

  // Return state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returning, setReturning] = useState(false);

  const fetchOverdueData = async () => {
    try {
      setLoading(true);
      const [overdueData, booksData] = await Promise.all([
        loanService.getOverdueLoans().catch(() => []),
        bookService.getAllBooks().catch(() => []),
      ]);

      setOverdueLoans(Array.isArray(overdueData) ? overdueData : []);

      const bMap = new Map();
      (Array.isArray(booksData) ? booksData : []).forEach((b) => {
        bMap.set(b.id || b.bookId, b);
      });
      setBooksMap(bMap);
    } catch {
      toast.error('Failed to query overdue loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueData();
  }, []);

  const handleTriggerNotifications = async () => {
    try {
      setNotifying(true);
      const res = await loanService.triggerOverdueNotifications();
      const msg = typeof res === 'string' ? res : res?.message || 'Overdue notification scan completed.';
      toast.success(msg);
      fetchOverdueData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to trigger notifications';
      toast.error(typeof msg === 'string' ? msg : 'Failed to trigger notifications');
    } finally {
      setNotifying(false);
    }
  };

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
      toast.success('Book returned. Fine calculated.');
      setReturnModalOpen(false);
      setSelectedLoan(null);
      fetchOverdueData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to return book';
      toast.error(typeof msg === 'string' ? msg : 'Failed to return book');
    } finally {
      setReturning(false);
    }
  };

  // Calculate days overdue
  const getDaysOverdue = (issueDate, dueDateStr) => {
    const due = dueDateStr ? new Date(dueDateStr) : new Date(calculateDueDate(issueDate));
    const now = new Date();
    const diffTime = now - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overdue Circulation Monitor"
        subtitle="Detect and process loans exceeding authorized return schedules."
        action={
          <Button
            variant="danger"
            onClick={handleTriggerNotifications}
            loading={notifying}
            disabled={overdueLoans.length === 0}
          >
            <Bell className="w-4 h-4" />
            <span>Notify Overdue Users</span>
          </Button>
        }
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Scanning overdue circulation loans..." />
        </div>
      ) : overdueLoans.length === 0 ? (
        <EmptyState
          title="No Overdue Circulation Records"
          description="All active library loans are currently compliant with scheduled return windows."
          actionLabel="View All Loans"
          onAction={() => navigate('/admin/loans')}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{overdueLoans.length} record(s) flagged as OVERDUE</span>
            </div>
            <span className="text-xs text-slate-500">Fine rate: ₹5.00 / day default</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Loan ID</th>
                  <th className="py-3.5 px-4">Borrower</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Days Overdue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueLoans.map((loan) => {
                  const loanId = loan.id || loan.loanId;
                  const book = booksMap.get(loan.bookId);
                  const dueDate = loan.dueDate || calculateDueDate(loan.issueDate);
                  const daysLate = getDaysOverdue(loan.issueDate, dueDate);

                  return (
                    <tr key={loanId} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{loanId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        User #{loan.userId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {book ? book.title : `Book #${loan.bookId}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(loan.issueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-rose-600 font-medium whitespace-nowrap">
                        {formatDate(dueDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          {daysLate} day{daysLate > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="red">OVERDUE</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/loans/${loanId}`)}
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReturnModal(loan)}
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Return &amp; Fine</span>
                          </Button>
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
        title="Process Overdue Return"
        message={`Return overdue book for loan #${selectedLoan?.id || selectedLoan?.loanId}? The inventory copy will be incremented and an overdue fine will be automatically calculated.`}
        confirmText={returning ? 'Processing...' : 'Confirm Return & Calculate Fine'}
        confirmVariant="primary"
        loading={returning}
      />
    </div>
  );
};

export default Overdue;

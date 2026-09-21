import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { bookService } from '../../services/bookService';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
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
  Eye,
  Trash2,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const AdminLoans = () => {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);
  const [booksMap, setBooksMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAllCirculation = async () => {
    try {
      setLoading(true);
      const [loansData, booksData] = await Promise.all([
        loanService.getAllLoans().catch(() => []),
        bookService.getAllBooks().catch(() => []),
      ]);

      setLoans(Array.isArray(loansData) ? loansData : []);

      const bMap = new Map();
      (Array.isArray(booksData) ? booksData : []).forEach((b) => {
        bMap.set(b.id || b.bookId, b);
      });
      setBooksMap(bMap);
    } catch {
      toast.error('Failed to load circulation records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCirculation();
  }, []);

  const handleOpenDeleteModal = (loan) => {
    setLoanToDelete(loan);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!loanToDelete) return;
    try {
      setDeleting(true);
      const loanId = loanToDelete.id || loanToDelete.loanId;
      await loanService.deleteLoan(loanId);
      toast.success('Loan record deleted');
      setDeleteModalOpen(false);
      setLoanToDelete(null);
      fetchAllCirculation();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to delete loan';
      toast.error(typeof msg === 'string' ? msg : 'Failed to delete loan');
    } finally {
      setDeleting(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const loanId = String(loan.id || loan.loanId || '');
    const userId = String(loan.userId || '');
    const book = booksMap.get(loan.bookId);
    const bookTitle = (book?.title || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      loanId.includes(query) ||
      userId.includes(query) ||
      bookTitle.includes(query) ||
      String(loan.bookId).includes(query);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && loan.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Circulation Oversight"
        subtitle="Manage and audit all borrow transactions across the institution."
      />

      <Card>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Loan ID, User ID, or Title..."
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({loans.length})
            </button>
            <button
              onClick={() => setStatusFilter('BORROWED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'BORROWED'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('RETURNED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'RETURNED'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Returned
            </button>
            <button
              onClick={() => setStatusFilter('OVERDUE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'OVERDUE'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading circulation records..." />
        </div>
      ) : filteredLoans.length === 0 ? (
        <EmptyState
          title="No Circulation Records"
          description="No loans found matching your current filter criteria."
          actionLabel={searchQuery ? 'Clear Search' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Loan ID</th>
                  <th className="py-3.5 px-4">Borrower</th>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Return Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const loanId = loan.id || loan.loanId;
                  const book = booksMap.get(loan.bookId);
                  const dueDate = loan.dueDate || calculateDueDate(loan.issueDate);

                  return (
                    <tr key={loanId} className="hover:bg-slate-50/70 transition-colors">
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
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(dueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {loan.returnDate ? formatDate(loan.returnDate) : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {loan.status === 'BORROWED' && <Badge variant="blue">BORROWED</Badge>}
                        {loan.status === 'RETURNED' && <Badge variant="green">RETURNED</Badge>}
                        {loan.status === 'OVERDUE' && <Badge variant="red">OVERDUE</Badge>}
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
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(loan)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Circulation Record"
        message={`Are you sure you want to permanently delete circulation record #${loanToDelete?.id || loanToDelete?.loanId}?`}
        confirmText="Delete Record"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default AdminLoans;

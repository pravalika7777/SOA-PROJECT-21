import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
import { loanService } from '../../services/loanService';
import { fineService } from '../../services/fineService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import {
  BookOpen,
  ArrowLeftRight,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Library,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isLibrarian } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [fines, setFines] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);

  // Return book state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returning, setReturning] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch books
      const booksData = await bookService.getAllBooks().catch(() => []);
      setBooks(Array.isArray(booksData) ? booksData : []);

      if (isLibrarian) {
        // Librarian sees system-wide data
        const [allLoansData, allFinesData, overdueData] = await Promise.all([
          loanService.getAllLoans().catch(() => []),
          fineService.getFines().catch(() => []),
          loanService.getOverdueLoans().catch(() => []),
        ]);
        setLoans(Array.isArray(allLoansData) ? allLoansData : []);
        setFines(Array.isArray(allFinesData) ? allFinesData : []);
        setOverdueLoans(Array.isArray(overdueData) ? overdueData : []);
      } else {
        // Student sees their own loans and fines
        if (user?.userId) {
          const userLoans = await loanService.getUserLoans(user.userId).catch(() => []);
          setLoans(Array.isArray(userLoans) ? userLoans : []);

          // Find fines corresponding to user's loans
          const allFines = await fineService.getFines().catch(() => []);
          const userLoanIds = new Set((Array.isArray(userLoans) ? userLoans : []).map((l) => l.id || l.loanId));
          const userFines = (Array.isArray(allFines) ? allFines : []).filter((f) =>
            userLoanIds.has(f.rentalId || f.loanId)
          );
          setFines(userFines);
        }
      }
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, isLibrarian]);

  // Handle return book flow
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
      toast.success('Book returned successfully.');
      setReturnModalOpen(false);
      setSelectedLoan(null);
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to return book';
      toast.error(typeof msg === 'string' ? msg : 'Failed to return book');
    } finally {
      setReturning(false);
    }
  };

  // Helper map for book titles
  const bookTitleMap = new Map();
  books.forEach((b) => {
    const id = b.id || b.bookId;
    bookTitleMap.set(id, b.title || `Book #${id}`);
  });

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Spinner size="lg" label="Loading circulation dashboard..." />
      </div>
    );
  }

  // Calculate metrics
  const totalBooks = books.length;
  const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const activeLoans = loans.filter((l) => l.status === 'BORROWED');
  const returnedLoans = loans.filter((l) => l.status === 'RETURNED');
  const outstandingFines = fines
    .filter((f) => f.status === 'PENDING')
    .reduce((acc, f) => acc + (Number(f.fineAmount || f.amount) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Resource Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.username || 'Scholar'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {isLibrarian
              ? 'Comprehensive administrative portal for inventory oversight, circulation enforcement, and fee reconciliation.'
              : 'Explore our academic catalog, track your active loans, and monitor return schedules seamlessly.'}
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Library className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Metrics Row */}
      {isLibrarian ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Titles"
            value={totalBooks}
            icon={BookOpen}
            color="indigo"
            subtitle="Cataloged in system"
          />
          <StatCard
            title="Available Copies"
            value={availableCopies}
            icon={CheckCircle}
            color="emerald"
            subtitle="Ready for checkout"
          />
          <StatCard
            title="Active Loans"
            value={activeLoans.length}
            icon={ArrowLeftRight}
            color="blue"
            subtitle="Currently circulating"
          />
          <StatCard
            title="Overdue Loans"
            value={overdueLoans.length}
            icon={AlertTriangle}
            color="rose"
            subtitle="Exceeded due dates"
          />
          <StatCard
            title="Pending Fines"
            value={`₹${outstandingFines.toFixed(2)}`}
            icon={Receipt}
            color="amber"
            subtitle="Unsettled fees"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Books"
            value={books.filter((b) => (b.availableCopies || 0) > 0).length}
            icon={BookOpen}
            color="indigo"
            subtitle="Ready to borrow"
          />
          <StatCard
            title="My Active Loans"
            value={activeLoans.length}
            icon={ArrowLeftRight}
            color="blue"
            subtitle="In your possession"
          />
          <StatCard
            title="Books Returned"
            value={returnedLoans.length}
            icon={CheckCircle}
            color="emerald"
            subtitle="Successfully returned"
          />
          <StatCard
            title="Outstanding Fine"
            value={`₹${outstandingFines.toFixed(2)}`}
            icon={Receipt}
            color="rose"
            subtitle="Pending dues"
          />
        </div>
      )}

      {/* Quick Actions (Librarian) */}
      {isLibrarian && (
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Administrative Quick Actions</h2>
              <p className="text-xs text-slate-500">Shortcuts to essential circulation workflows</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start text-xs py-3"
              onClick={() => navigate('/admin/books')}
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Add / Manage Books</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start text-xs py-3"
              onClick={() => navigate('/admin/loans')}
            >
              <ArrowLeftRight className="w-4 h-4 text-blue-600" />
              <span>Circulation Records</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start text-xs py-3"
              onClick={() => navigate('/admin/overdue')}
            >
              <Clock className="w-4 h-4 text-rose-600" />
              <span>Overdue Monitor</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start text-xs py-3"
              onClick={() => navigate('/admin/fines')}
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>Fine Auditing</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Currently Borrowed / Active Loans Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isLibrarian ? 'Recent Active Circulation' : 'My Current Borrowings'}
            </h2>
            <p className="text-xs text-slate-500">
              {isLibrarian
                ? 'Latest active loans recorded across the institution'
                : 'Books currently checked out in your custody'}
            </p>
          </div>
          <Link
            to={isLibrarian ? '/admin/loans' : '/loans'}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeLoans.length === 0 ? (
          <EmptyState
            title="No Active Loans"
            description={
              isLibrarian
                ? 'There are currently no active book borrowings in the circulation system.'
                : 'You have no books currently checked out. Browse the catalog to borrow.'
            }
            actionLabel={isLibrarian ? undefined : 'Browse Books'}
            onAction={isLibrarian ? undefined : () => navigate('/books')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Loan ID</th>
                  {isLibrarian && <th className="py-3 px-4">Student ID</th>}
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.slice(0, 5).map((loan) => {
                  const loanId = loan.id || loan.loanId;
                  const title = bookTitleMap.get(loan.bookId) || `Book #${loan.bookId}`;
                  return (
                    <tr key={loanId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        #{loanId}
                      </td>
                      {isLibrarian && (
                        <td className="py-3 px-4 text-slate-600">
                          User #{loan.userId}
                        </td>
                      )}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {title}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(loan.issueDate)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="blue">BORROWED</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReturnModal(loan)}
                        >
                          Return Book
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Overdue Alert Banner for Librarian */}
      {isLibrarian && overdueLoans.length > 0 && (
        <Card className="border-rose-200 bg-rose-50/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-950">
                  {overdueLoans.length} Overdue Circulation Record{overdueLoans.length > 1 ? 's' : ''} Detected
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Overdue loans require fee calculation and student return notification dispatch.
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => navigate('/admin/overdue')}
            >
              Inspect Overdue Loans
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation Modal for Returning Book */}
      <ConfirmModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleConfirmReturn}
        title="Confirm Book Return"
        message={`Are you sure you want to return "${
          selectedLoan ? (bookTitleMap.get(selectedLoan.bookId) || `Book #${selectedLoan.bookId}`) : 'this book'
        }"? The book inventory copy will be incremented and any applicable overdue fines calculated.`}
        confirmText="Confirm Return"
        confirmVariant="primary"
        loading={returning}
      />
    </div>
  );
};

export default Dashboard;

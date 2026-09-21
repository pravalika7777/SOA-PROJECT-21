import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
import { loanService } from '../../services/loanService';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Eye,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

export const Books = () => {
  const { user, isLibrarian } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'OUT_OF_STOCK'
  const [sortBy, setSortBy] = useState('TITLE_ASC');

  // Borrow Flow States
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [borrowing, setBorrowing] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load books from inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenBorrowModal = (book) => {
    setSelectedBook(book);
    setBorrowModalOpen(true);
  };

  const handleConfirmBorrow = async () => {
    if (!selectedBook || !user?.userId) {
      toast.error('Unable to identify authenticated user. Please re-login.');
      return;
    }

    const bookId = selectedBook.id || selectedBook.bookId;

    try {
      setBorrowing(true);
      await loanService.createLoan({
        userId: user.userId,
        bookId: bookId,
      });

      toast.success('Book borrowed successfully.');
      setBorrowModalOpen(false);
      setSelectedBook(null);
      fetchBooks();
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
        toast.error(errorMsg || 'Failed to borrow book. Please try again.');
      }
    } finally {
      setBorrowing(false);
    }
  };

  // Filter and Search logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      (book.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author || '').toLowerCase().includes(searchQuery.toLowerCase());

    const copies = Number(book.availableCopies) || 0;
    if (filterAvailability === 'AVAILABLE') {
      return matchesSearch && copies > 0;
    }
    if (filterAvailability === 'OUT_OF_STOCK') {
      return matchesSearch && copies === 0;
    }
    return matchesSearch;
  });

  // Sort logic
  filteredBooks.sort((a, b) => {
    if (sortBy === 'TITLE_ASC') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortBy === 'TITLE_DESC') {
      return (b.title || '').localeCompare(a.title || '');
    }
    if (sortBy === 'COPIES_DESC') {
      return (b.availableCopies || 0) - (a.availableCopies || 0);
    }
    return 0;
  });

  const getAvailabilityBadge = (copies) => {
    const count = Number(copies) || 0;
    if (count > 2) {
      return <Badge variant="green">AVAILABLE ({count})</Badge>;
    }
    if (count > 0) {
      return <Badge variant="yellow">LIMITED ({count})</Badge>;
    }
    return <Badge variant="red">OUT OF STOCK</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Catalog"
        subtitle="Explore titles, inspect copy availability, and borrow academic resources."
        action={
          isLibrarian && (
            <Button
              variant="primary"
              onClick={() => navigate('/admin/books')}
            >
              <Plus className="w-4 h-4" />
              <span>Manage Inventory</span>
            </Button>
          )
        }
      />

      {/* Filter and Search Controls */}
      <Card>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or author..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterAvailability('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filterAvailability === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({books.length})
              </button>
              <button
                onClick={() => setFilterAvailability('AVAILABLE')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filterAvailability === 'AVAILABLE'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setFilterAvailability('OUT_OF_STOCK')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filterAvailability === 'OUT_OF_STOCK'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Out of Stock
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="TITLE_ASC">Title (A - Z)</option>
              <option value="TITLE_DESC">Title (Z - A)</option>
              <option value="COPIES_DESC">Most Copies Available</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Books Table / Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading catalog titles..." />
        </div>
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          title="No Books Found"
          description={
            searchQuery
              ? `No catalog items matched your query "${searchQuery}".`
              : 'There are currently no books registered in the system catalog.'
          }
          actionLabel={searchQuery ? 'Clear Filters' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Book ID</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Available Copies</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => {
                  const bookId = book.id || book.bookId;
                  const copies = Number(book.availableCopies) || 0;
                  const isAvailable = copies > 0;

                  return (
                    <tr
                      key={bookId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{bookId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {book.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {book.author}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>{copies}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getAvailabilityBadge(copies)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/books/${bookId}`)}
                            title="Inspect Book Details"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>

                          {!isLibrarian && (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={!isAvailable}
                              onClick={() => handleOpenBorrowModal(book)}
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span>Borrow</span>
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

      {/* Borrow Confirmation Modal */}
      <ConfirmModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onConfirm={handleConfirmBorrow}
        title="Borrow Academic Resource"
        message={`Borrow this book: "${selectedBook?.title}" by ${selectedBook?.author}? This will create an active loan in your account and decrement the available inventory copies.`}
        confirmText={borrowing ? 'Borrowing...' : 'Confirm Borrow'}
        confirmVariant="primary"
        loading={borrowing}
      />
    </div>
  );
};

export default Books;

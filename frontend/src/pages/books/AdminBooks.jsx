import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/bookService';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  BookPlus,
  Edit2,
  Trash2,
  Layers,
  BookOpen,
} from 'lucide-react';

export const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    availableCopies: 1,
  });
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load inventory records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      availableCopies: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      availableCopies: book.availableCopies || 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error('Please enter both book title and author');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        availableCopies: parseInt(formData.availableCopies, 10) || 0,
      };

      if (editingBook) {
        const id = editingBook.id || editingBook.bookId;
        await bookService.updateBook(id, payload);
        toast.success('Book record updated successfully');
      } else {
        await bookService.addBook(payload);
        toast.success('Book added to inventory successfully');
      }

      setIsModalOpen(false);
      fetchBooks();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to save book';
      toast.error(typeof msg === 'string' ? msg : 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteModal = (book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      setDeleting(true);
      const id = bookToDelete.id || bookToDelete.bookId;
      await bookService.deleteBook(id);
      toast.success('Book deleted from system');
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
      fetchBooks();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to delete book';
      toast.error(typeof msg === 'string' ? msg : 'Failed to delete book');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Catalog Management"
        subtitle="Add, modify, and manage academic book resources in the central catalog."
        action={
          <Button variant="primary" onClick={handleOpenAddModal}>
            <BookPlus className="w-4 h-4" />
            <span>Add New Book</span>
          </Button>
        }
      />

      <Card>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter books by title or author..."
        />
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading books..." />
        </div>
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          title="No Books Found"
          description={
            searchQuery
              ? `No catalog records match "${searchQuery}".`
              : 'There are currently no books in the inventory catalog.'
          }
          actionLabel="Add Book"
          onAction={handleOpenAddModal}
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

                  return (
                    <tr key={bookId} className="hover:bg-slate-50/70 transition-colors">
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
                        {copies > 2 ? (
                          <Badge variant="green">AVAILABLE</Badge>
                        ) : copies > 0 ? (
                          <Badge variant="yellow">LIMITED</Badge>
                        ) : (
                          <Badge variant="red">OUT OF STOCK</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(book)}
                            title="Edit Book Specifications"
                          >
                            <Edit2 className="w-4 h-4 text-indigo-600" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(book)}
                            title="Delete Book Record"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
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

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book Specifications' : 'Add New Academic Title'}
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <Input
            label="Book Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Distributed Operating Systems"
            required
          />
          <Input
            label="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="e.g. Andrew S. Tanenbaum"
            required
          />
          <Input
            label="Available Copies"
            type="number"
            min="0"
            value={formData.availableCopies}
            onChange={(e) => setFormData({ ...formData, availableCopies: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              {editingBook ? 'Save Changes' : 'Add Book'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Book Record"
        message={`Are you sure you want to permanently delete "${bookToDelete?.title}" from the catalog? This action cannot be reversed.`}
        confirmText="Delete Book"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default AdminBooks;

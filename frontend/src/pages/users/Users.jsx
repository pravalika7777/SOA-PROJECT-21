import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  UserPlus,
  Trash2,
  Shield,
  UserCheck,
  Mail,
  User as UserIcon,
} from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Add User State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [adding, setAdding] = useState(false);

  // Delete User State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load user accounts from directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setAdding(true);
      await userService.addUser({
        name: formData.username.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      toast.success(`User ${formData.username} registered successfully.`);
      setAddModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'STUDENT',
      });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to add user account';
      toast.error(typeof msg === 'string' ? msg : 'Failed to add user account');
    } finally {
      setAdding(false);
    }
  };

  const handleOpenDeleteModal = (u) => {
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      const userId = userToDelete.id || userToDelete.userId;
      await userService.deleteUser(userId);
      toast.success('User account removed');
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to delete user';
      toast.error(typeof msg === 'string' ? msg : 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const displayName = (u.username || u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = displayName.includes(query) || email.includes(query);

    if (roleFilter === 'ALL') return matchesQuery;
    const userRole = u.role || 'STUDENT';
    return matchesQuery && userRole === roleFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Account Directory"
        subtitle="Provision, audit, and manage student and librarian accounts."
        action={
          <Button variant="primary" onClick={() => setAddModalOpen(true)}>
            <UserPlus className="w-4 h-4" />
            <span>Create User Account</span>
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or email..."
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                roleFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('STUDENT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                roleFilter === 'STUDENT'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setRoleFilter('LIBRARIAN')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                roleFilter === 'LIBRARIAN'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Librarians
            </button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Querying user directory service..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description="No user accounts matched your search or role filters."
          actionLabel={searchQuery ? 'Clear Search' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const uid = u.id || u.userId;
                  const displayName = u.username || u.name || `User #${uid}`;
                  const isLib = u.role === 'LIBRARIAN';

                  return (
                    <tr key={uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{uid}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {displayName[0].toUpperCase()}
                          </div>
                          <span>{displayName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        {isLib ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            LIBRARIAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            {u.role || 'STUDENT'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteModal(u)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Provision New User Account"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="e.g. s_patel"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. s_patel@university.edu"
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="STUDENT">STUDENT (Borrower Access)</option>
              <option value="LIBRARIAN">LIBRARIAN (Administrative Staff)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={adding}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently remove user "${userToDelete?.username}" (ID: #${userToDelete?.id || userToDelete?.userId})? All associated credentials will be revoked.`}
        confirmText="Delete Account"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Users;

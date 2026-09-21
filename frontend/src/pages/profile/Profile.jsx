import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loanService } from '../../services/loanService';
import { fineService } from '../../services/fineService';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Spinner from '../../components/common/Spinner';
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  BookOpen,
  ArrowLeftRight,
  Receipt,
  CheckCircle,
} from 'lucide-react';

export const Profile = () => {
  const { user, isLibrarian } = useAuth();

  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    returnedLoans: 0,
    finesOwed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loans = await loanService.getUserLoans(user.userId).catch(() => []);
        const fines = await fineService.getFines().catch(() => []);

        const userLoanIds = new Set((Array.isArray(loans) ? loans : []).map((l) => l.id || l.loanId));
        const userFines = (Array.isArray(fines) ? fines : []).filter((f) =>
          userLoanIds.has(f.rentalId || f.loanId)
        );

        const totalLoans = (Array.isArray(loans) ? loans : []).length;
        const activeLoans = (Array.isArray(loans) ? loans : []).filter(
          (l) => l.status === 'BORROWED'
        ).length;
        const returnedLoans = (Array.isArray(loans) ? loans : []).filter(
          (l) => l.status === 'RETURNED'
        ).length;
        const finesOwed = userFines
          .filter((f) => f.status === 'PENDING')
          .reduce((acc, f) => acc + (Number(f.fineAmount || f.amount) || 0), 0);

        setStats({
          totalLoans,
          activeLoans,
          returnedLoans,
          finesOwed,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();
  }, [user]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Scholar Profile"
        subtitle="Identity verification, role authorizations, and personal circulation activity."
      />

      {/* Main Profile Identity Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {(user?.username || 'U')[0].toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-2xl font-black text-slate-900">
                {user?.username || 'Authenticated Scholar'}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                  isLibrarian
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-purple-100 text-purple-800 border border-purple-200'
                }`}
              >
                {user?.role || 'STUDENT'}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              Academic ID: #{user?.userId || 'N/A'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>JWT Authentication Validated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Stateless Microservices Token</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Activity Statistics */}
      {!isLibrarian && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Personal Circulation History
          </h3>
          {loading ? (
            <div className="py-10 flex justify-center">
              <Spinner size="md" label="Calculating circulation metrics..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                title="Total Loans"
                value={stats.totalLoans}
                icon={BookOpen}
                color="indigo"
              />
              <StatCard
                title="Active Loans"
                value={stats.activeLoans}
                icon={ArrowLeftRight}
                color="blue"
              />
              <StatCard
                title="Books Returned"
                value={stats.returnedLoans}
                icon={CheckCircle}
                color="emerald"
              />
              <StatCard
                title="Unpaid Fines"
                value={`₹${stats.finesOwed.toFixed(2)}`}
                icon={Receipt}
                color="rose"
              />
            </div>
          )}
        </div>
      )}

      {/* Access & Authorization Overview */}
      <Card>
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Role-Based Access Control (RBAC) Specification
        </h3>
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            You are authenticated with the role{' '}
            <span className="font-bold text-slate-800">{user?.role}</span>. Access to
            microservices endpoints via the Spring Cloud API Gateway is strictly authorized
            according to your JWT claims.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-1">Granted Privileges:</h4>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              {isLibrarian ? (
                <>
                  <li>Full inventory catalog mutation (Create, Update, Delete books)</li>
                  <li>System-wide circulation record audit and inspection</li>
                  <li>Overdue loans monitoring &amp; event notification dispatch</li>
                  <li>Fine ledger reconciliation (Settlement marking)</li>
                  <li>User account provisioning and directory administration</li>
                </>
              ) : (
                <>
                  <li>Catalog search and title availability inquiries</li>
                  <li>Book loan creation (14-day standard circulation window)</li>
                  <li>Active loan returns and copy restoration</li>
                  <li>Personal fine balance auditing and status tracking</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

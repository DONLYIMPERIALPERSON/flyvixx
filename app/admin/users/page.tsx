'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '../../../components/admin-guard';
import AdminNav from '../../../components/admin-nav';
import { useToast } from '../../../components/toast-notification';

interface UserInfo {
  id: string;
  email: string;
  cashBalance: number;
  lockedFunds: number;
  totalWealth: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalReferral: number;
  createdAt: string;
}

interface UsersResponse {
  users: UserInfo[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const { showError } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = async (page: number = 1, email?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (email && email.trim()) {
        params.append('email', email.trim());
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: { success: boolean; data: UsersResponse } = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setCurrentPage(data.data.currentPage);
        setTotalPages(data.data.totalPages);
        setTotalCount(data.data.totalCount);
      } else {
        showError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = () => {
    setSearchEmail(searchInput);
    fetchUsers(1, searchInput);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchEmail);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700]/20 border-t-[#FFD700] mx-auto mb-4"></div>
            <p className="text-white/70">Loading users...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Users Management</h1>
            <p className="mt-2 text-white/60">View and manage all registered users</p>
          </div>

          {/* Search and Stats */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Search by email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-[#FFD700] text-[#004B49] rounded-md hover:bg-[#FFD700]/90 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 font-medium"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="text-sm text-white/60">
                Total Users: <span className="font-semibold text-white">{totalCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No users found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Cash Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Locked Funds
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Total Wealth
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Total Deposit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Total Withdrawal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Total Referral
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {user.email}
                                </div>
                                <div className="text-sm text-white/60">
                                  ID: {user.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCurrency(user.cashBalance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCurrency(user.lockedFunds)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                            {formatCurrency(user.totalWealth)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCurrency(user.totalDeposit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCurrency(user.totalWithdrawal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {user.totalReferral}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-t border-white/10 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-white/70">
                          Showing page <span className="font-medium text-white">{currentPage}</span> of{' '}
                          <span className="font-medium text-white">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/20 bg-white/10 text-sm font-medium text-white/70 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            ‹
                          </button>

                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            if (pageNum > totalPages) return null;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === currentPage
                                    ? 'z-10 bg-[#FFD700] border-[#FFD700] text-[#004B49]'
                                    : 'border-white/20 bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-white/20 bg-white/10 text-sm font-medium text-white/70 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            ›
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
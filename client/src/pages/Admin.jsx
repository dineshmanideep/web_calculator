/*
 * Admin
 *
 * Purpose:
 * Provides an administrative dashboard for monitoring user activity and system events.
 * Displays audit logs, filtering tools, statistical summaries, and export functionality.
 *
 * Parameters:
 * - user (object): the current logged-in user object, used to check admin access.
 * - onSignOut (function): callback function to handle user sign-out.
 *
 * Return value:
 * A React component rendering the admin dashboard with log table, filters, pagination,
 * and CSV export functionality for audit logs.
 */ 

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  RefreshCw,
  Filter,
  Download,
  Search,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Monitor,
  Smartphone,
  Tablet,
  Users,
  Shield,
  Ban,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Admin = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'users'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});

  // User management state
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({});
  const [usersFilters, setUsersFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
  });

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    action: '',
    status: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  const [availableActions, setAvailableActions] = useState([]);

  // Fetch all users for user management tab
  const fetchAllUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      Object.keys(usersFilters).forEach((key) => {
        if (usersFilters[key]) {
          params.append(key, usersFilters[key]);
        }
      });

      const { data } = await axios.get(`${API_URL}/admin/all-users?${params.toString()}`, {
        withCredentials: true,
      });

      setAllUsers(data.users);
      setUsersPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  }, [usersFilters]);

  // Toggle admin role
  const handleToggleAdmin = async (userId, currentlyAdmin, username) => {
    const action = currentlyAdmin ? 'remove admin privileges from' : 'grant admin privileges to';
    if (!window.confirm(`Are you sure you want to ${action} ${username}?`)) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/toggle-admin`,
        { makeAdmin: !currentlyAdmin },
        { withCredentials: true }
      );
      toast.success(`Successfully ${currentlyAdmin ? 'removed admin from' : 'made admin'} ${username}`);
      fetchAllUsers();
    } catch (error) {
      console.error('Error toggling admin:', error);
      toast.error(error.response?.data?.message || 'Failed to update admin status');
    }
  };

  // Toggle user suspension
  const handleToggleSuspension = async (userId, currentlySuspended, username) => {
    const action = currentlySuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} ${username}?`)) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/toggle-suspension`,
        { suspend: !currentlySuspended },
        { withCredentials: true }
      );
      toast.success(`Successfully ${currentlySuspended ? 'unsuspended' : 'suspended'} ${username}`);
      fetchAllUsers();
    } catch (error) {
      console.error('Error toggling suspension:', error);
      toast.error(error.response?.data?.message || 'Failed to update suspension status');
    }
  };

  const handleUsersFilterChange = (key, value) => {
    setUsersFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value,
    }));
  };

  // Defer effect until after functions are declared

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const { data } = await axios.get(`${API_URL}/admin/audit-logs?${params.toString()}`, {
        withCredentials: true,
      });

      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');

      if (error.response?.status === 403) {
        navigate('/calculator');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/stats`, {
        withCredentials: true,
      });
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchAvailableActions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/actions`, {
        withCredentials: true,
      });
      setAvailableActions(data.actions);
    } catch (error) {
      console.error('Error fetching actions:', error);
    }
  }, []);

  useEffect(() => {
    // Check if user is admin
    if (!user?.isAdmin) {
      toast.error('Unauthorized: Admin access required');
      navigate('/calculator');
      return;
    }

    if (activeTab === 'logs') {
      fetchAuditLogs();
      fetchStats();
      fetchAvailableActions();
    } else if (activeTab === 'users') {
      fetchAllUsers();
    }
  }, [filters, usersFilters, activeTab, user, navigate, fetchAuditLogs, fetchStats, fetchAvailableActions, fetchAllUsers]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 when filter changes
    }));
  };

  const handleRefresh = () => {
    fetchAuditLogs();
    fetchStats();
    toast.success('Refreshed successfully');
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Timestamp', 'User', 'Email', 'Device Type', 'Browser', 'OS', 'Action', 'Status', 'Details', 'Input', 'Result', 'IP Address'];
    const csvContent = [
      headers.join(','),
      ...logs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.username || 'N/A',
        log.email || 'N/A',
        log.deviceType || 'N/A',
        log.browser || 'N/A',
        log.os || 'N/A',
        log.action,
        log.status,
        `"${(log.details || '').replace(/"/g, '""')}"`,
        `"${(log.input || '').replace(/"/g, '""')}"`,
        `"${(log.result || '').replace(/"/g, '""')}"`,
        log.ipAddress || 'N/A',
      ].join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Audit logs exported successfully');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-400 bg-green-900/30';
      case 'FAILED':
        return 'text-red-400 bg-red-900/30';
      case 'ERROR':
        return 'text-yellow-400 bg-yellow-900/30';
      default:
        return 'text-gray-400 bg-gray-800/30';
    }
  };

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'text-blue-400 bg-blue-900/30';
    if (action.includes('LOGOUT')) return 'text-purple-400 bg-purple-900/30';
    if (action.includes('SIGNUP')) return 'text-green-400 bg-green-900/30';
    if (action.includes('CALCULATION')) return 'text-orange-400 bg-orange-900/30';
    if (action.includes('ADMIN')) return 'text-pink-400 bg-pink-900/30';
    if (action.includes('PASSWORD')) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-gray-400 bg-gray-800/30';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/calculator')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Calculator
              </button>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">
                Welcome,
                {user?.fullName || user?.username}
              </span>
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              User Management
            </button>
          </div>
        </div>
      </div>

      {/* Logs Tab Content */}
      {activeTab === 'logs' && (
        <>
      {stats && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Logs</p>
                    <p className="text-2xl font-bold">{stats.totalLogs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Successful</p>
                    <p className="text-2xl font-bold">
                      {stats.statusStats.find((s) => s._id === 'SUCCESS')?.count || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Failed</p>
                    <p className="text-2xl font-bold">
                      {stats.statusStats.find((s) => s._id === 'FAILED')?.count || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Errors</p>
                    <p className="text-2xl font-bold">
                      {stats.statusStats.find((s) => s._id === 'ERROR')?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="admin-search" className="block text-sm text-gray-400 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="admin-search"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="User, email, details..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded text-white text-sm"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div>
              <label htmlFor="admin-action" className="block text-sm text-gray-400 mb-1">Action</label>
              <select
                id="admin-action"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
              >
                <option value="">All Actions</option>
                {availableActions.map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="admin-status" className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                id="admin-status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="ERROR">Error</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="admin-start-date" className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input
                type="datetime-local"
                id="admin-start-date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="admin-end-date" className="block text-sm text-gray-400 mb-1">End Date</label>
              <input
                type="datetime-local"
                id="admin-end-date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => setFilters({
                page: 1,
                limit: 50,
                action: '',
                status: '',
                search: '',
                startDate: '',
                endDate: '',
              })}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              Clear Filters
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Device</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Input</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {logs.map((log, index) => (
                    <tr key={log._id || index} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.username || 'Anonymous'}</div>
                            {log.email && (
                              <div className="text-xs text-gray-400">{log.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {log.deviceType === 'Mobile' && <Smartphone className="w-4 h-4 text-blue-400" />}
                          {log.deviceType === 'Tablet' && <Tablet className="w-4 h-4 text-green-400" />}
                          {log.deviceType === 'Desktop' && <Monitor className="w-4 h-4 text-purple-400" />}
                          {!log.deviceType && <Monitor className="w-4 h-4 text-gray-400" />}
                          <div>
                            <div className="font-medium text-xs">{log.deviceType || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">
                              {log.browser && log.os ? `${log.browser} • ${log.os}` : log.browser || log.os || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-xs truncate text-gray-300" title={log.input}>
                          {log.input || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-xs truncate text-gray-300" title={log.result}>
                          {log.result || log.errorMessage || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {log.ipAddress || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-900 px-4 py-3 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing
                {' '}
                {((pagination.page - 1) * pagination.limit) + 1}
                {' '}
                to
                {' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}
                {' '}
                of
                {' '}
                {pagination.total}
                {' '}
                results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-gray-800 rounded text-sm">
                  Page
                  {' '}
                  {pagination.page}
                  {' '}
                  of
                  {' '}
                  {pagination.pages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* User Management Tab Content */}
      {activeTab === 'users' && (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* User Search */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={usersFilters.search}
                      onChange={(e) => handleUsersFilterChange('search', e.target.value)}
                      placeholder="Search by username, email, or full name..."
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setUsersFilters({ page: 1, limit: 20, search: '' })}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <button
                  onClick={fetchAllUsers}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors ml-4"
                  title="Refresh users"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                {usersLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Username</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Full Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Last Login</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {allUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{u.username}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">{u.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{u.fullName || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            {u.isAdmin ? (
                              <span className="flex items-center gap-1 px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs font-medium w-fit">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs font-medium">
                                User
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {u.isSuspended ? (
                              <span className="flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-medium w-fit">
                                <Ban className="w-3 h-3" />
                                Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-medium">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleAdmin(u._id, u.isAdmin, u.username)}
                                disabled={u._id === user?.id}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  u.isAdmin
                                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                    : 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50'
                                }`}
                                title={u._id === user?.id ? 'Cannot modify your own role' : ''}
                              >
                                {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => handleToggleSuspension(u._id, u.isSuspended, u.username)}
                                disabled={u._id === user?.id}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  u.isSuspended
                                    ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                    : 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                                }`}
                                title={u._id === user?.id ? 'Cannot suspend yourself' : ''}
                              >
                                {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination for Users */}
              {usersPagination.pages > 1 && (
                <div className="bg-gray-900 px-4 py-3 border-t border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing
                    {' '}
                    {((usersPagination.page - 1) * usersPagination.limit) + 1}
                    {' '}
                    to
                    {' '}
                    {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)}
                    {' '}
                    of
                    {' '}
                    {usersPagination.total}
                    {' '}
                    users
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUsersFilterChange('page', usersPagination.page - 1)}
                      disabled={usersPagination.page === 1}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-gray-800 rounded text-sm">
                      Page
                      {' '}
                      {usersPagination.page}
                      {' '}
                      of
                      {' '}
                      {usersPagination.pages}
                    </span>
                    <button
                      onClick={() => handleUsersFilterChange('page', usersPagination.page + 1)}
                      disabled={usersPagination.page === usersPagination.pages}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;

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
import { useTheme } from '../contexts/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL;

const Admin = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
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
        return isDark ? 'text-green-400 bg-green-900/30 border-green-500/30' : 'text-green-700 bg-green-100 border-green-300';
      case 'FAILED':
        return isDark ? 'text-red-400 bg-red-900/30 border-red-500/30' : 'text-red-700 bg-red-100 border-red-300';
      case 'ERROR':
        return isDark ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30' : 'text-yellow-700 bg-yellow-100 border-yellow-300';
      default:
        return isDark ? 'text-gray-400 bg-gray-800/30 border-gray-500/30' : 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return isDark ? 'text-blue-400 bg-blue-900/30 border-blue-500/30' : 'text-blue-700 bg-blue-100 border-blue-300';
    if (action.includes('LOGOUT')) return isDark ? 'text-purple-400 bg-purple-900/30 border-purple-500/30' : 'text-purple-700 bg-purple-100 border-purple-300';
    if (action.includes('SIGNUP')) return isDark ? 'text-green-400 bg-green-900/30 border-green-500/30' : 'text-green-700 bg-green-100 border-green-300';
    if (action.includes('CALCULATION')) return isDark ? 'text-orange-400 bg-orange-900/30 border-orange-500/30' : 'text-orange-700 bg-orange-100 border-orange-300';
    if (action.includes('ADMIN')) return isDark ? 'text-pink-400 bg-pink-900/30 border-pink-500/30' : 'text-pink-700 bg-pink-100 border-pink-300';
    if (action.includes('PASSWORD')) return isDark ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30' : 'text-yellow-700 bg-yellow-100 border-yellow-300';
    return isDark ? 'text-gray-400 bg-gray-800/30 border-gray-500/30' : 'text-gray-700 bg-gray-100 border-gray-300';
  };

return (
  <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100'} ${isDark ? 'text-white' : 'text-slate-900'} relative overflow-hidden transition-colors duration-300`}>
    {/* Animated background */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-tl from-cyan-500/20 via-blue-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>

    {/* Header */}
    <div className={`relative z-20 ${isDark ? 'bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border-white/10' : 'bg-gradient-to-r from-white/95 via-indigo-50/95 to-white/95 border-slate-200'} backdrop-blur-xl border-b sticky top-0 transition-colors duration-300`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/calculator')}
              className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10 hover:border-violet-500/50' : 'bg-white/50 hover:bg-white border-slate-200 hover:border-violet-400'} rounded-xl transition-all duration-300 border shadow-lg ${isDark ? 'hover:shadow-violet-500/25' : 'hover:shadow-violet-400/25'}`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Calculator</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-xl shadow-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
              Welcome, {user?.fullName || user?.username}
            </span>
            <button
              onClick={handleRefresh}
              className={`p-2.5 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10 hover:border-violet-500/50' : 'bg-white/50 hover:bg-white border-slate-200 hover:border-violet-400'} rounded-xl transition-all duration-300 border`}
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onSignOut}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/50"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex gap-2 mt-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 font-medium ${
              activeTab === 'logs'
                ? 'border-violet-500 text-violet-400'
                : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`
            }`}
          >
            <Activity className="w-4 h-4" />
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 font-medium ${
              activeTab === 'users'
                ? 'border-violet-500 text-violet-400'
                : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`
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
          <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10 hover:border-violet-500/50' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200 hover:border-violet-400'} backdrop-blur-xl p-6 rounded-2xl border transition-all duration-300 shadow-xl`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-500/20 rounded-xl">
                      <Activity className="w-8 h-8 text-violet-400" />
                    </div>
                    <div>
                      <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium`}>Total Logs</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{stats.totalLogs}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10 hover:border-green-500/50' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200 hover:border-green-400'} backdrop-blur-xl p-6 rounded-2xl border transition-all duration-300 shadow-xl`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium`}>Successful</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {stats.statusStats.find((s) => s._id === 'SUCCESS')?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10 hover:border-red-500/50' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200 hover:border-red-400'} backdrop-blur-xl p-6 rounded-2xl border transition-all duration-300 shadow-xl`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium`}>Failed</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                        {stats.statusStats.find((s) => s._id === 'FAILED')?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10 hover:border-yellow-500/50' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200 hover:border-yellow-400'} backdrop-blur-xl p-6 rounded-2xl border transition-all duration-300 shadow-xl`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <AlertCircle className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                      <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium`}>Errors</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                        {stats.statusStats.find((s) => s._id === 'ERROR')?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-cyan-600/10 rounded-2xl blur-xl"></div>
            <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200'} backdrop-blur-xl p-6 rounded-2xl border shadow-xl transition-colors duration-300`}>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Filter className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Filters</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div>
                  <label htmlFor="admin-search" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium mb-2`}>Search</label>
                  <div className="relative group">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'} group-focus-within:text-violet-400 transition-colors pointer-events-none`} />
                    <input
                      type="text"
                      id="admin-search"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="User, email, details..."
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 text-white placeholder:text-slate-500 border-white/10' : 'bg-white/50 text-slate-900 placeholder:text-slate-400 border-slate-200'} backdrop-blur-xl border focus:border-violet-500/50 focus:outline-none transition-all text-sm shadow-inner`}
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <div>
                  <label htmlFor="admin-action" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium mb-2`}>Action</label>
                  <select
                    id="admin-action"
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 text-white border-white/10' : 'bg-white/50 text-slate-900 border-slate-200'} backdrop-blur-xl border focus:border-violet-500/50 focus:outline-none transition-all text-sm shadow-inner`}
                  >
                    <option value="">All Actions</option>
                    {availableActions.map((action) => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label htmlFor="admin-status" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium mb-2`}>Status</label>
                  <select
                    id="admin-status"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 text-white border-white/10' : 'bg-white/50 text-slate-900 border-slate-200'} backdrop-blur-xl border focus:border-violet-500/50 focus:outline-none transition-all text-sm shadow-inner`}
                  >
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="ERROR">Error</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="admin-start-date" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium mb-2`}>Start Date</label>
                  <input
                    type="datetime-local"
                    id="admin-start-date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 text-white border-white/10' : 'bg-white/50 text-slate-900 border-slate-200'} backdrop-blur-xl border focus:border-violet-500/50 focus:outline-none transition-all text-sm shadow-inner`}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="admin-end-date" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium mb-2`}>End Date</label>
                  <input
                    type="datetime-local"
                    id="admin-end-date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 text-white border-white/10' : 'bg-white/50 text-slate-900 border-slate-200'} backdrop-blur-xl border focus:border-violet-500/50 focus:outline-none transition-all text-sm shadow-inner`}
                  />
                </div>
              </div>

              <div className={`flex justify-between items-center mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
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
                  className={`px-5 py-2.5 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10 hover:border-slate-600' : 'bg-white/50 hover:bg-white border-slate-200 hover:border-slate-300'} rounded-xl text-sm font-medium transition-all duration-300 border`}
                >
                  Clear Filters
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-violet-500/50"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-cyan-600/10 rounded-2xl blur-xl"></div>
            <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200'} backdrop-blur-xl rounded-2xl border overflow-hidden shadow-xl transition-colors duration-300`}>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20' : 'bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20'} rounded-2xl flex items-center justify-center`}>
                      <Activity className="w-8 h-8 text-violet-400" />
                    </div>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No audit logs found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className={`${isDark ? 'bg-slate-950/50' : 'bg-slate-100/50'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <tr>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Timestamp</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>User</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Device</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Action</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Status</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Input</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Result</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>IP Address</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                      {logs.map((log, index) => (
                        <tr key={log._id || index} className={`${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-colors`}>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                              <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                              <div>
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.username || 'Anonymous'}</div>
                                {log.email && (
                                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{log.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              {log.deviceType === 'Mobile' && <Smartphone className="w-4 h-4 text-blue-400" />}
                              {log.deviceType === 'Tablet' && <Tablet className="w-4 h-4 text-green-400" />}
                              {log.deviceType === 'Desktop' && <Monitor className="w-4 h-4 text-violet-400" />}
                              {!log.deviceType && <Monitor className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />}
                              <div>
                                <div className={`font-medium text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.deviceType || 'Unknown'}</div>
                                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {log.browser && log.os ? `${log.browser} • ${log.os}` : log.browser || log.os || 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(log.status)}`}>
                                {log.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="max-w-xs truncate text-slate-300" title={log.input}>
                              {log.input || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className={`max-w-xs truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`} title={log.result}>
                              {log.result || log.errorMessage || '-'}
                            </div>
                          </td>
                          <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                <div className={`${isDark ? 'bg-slate-950/50 border-white/10' : 'bg-slate-100/50 border-slate-200'} backdrop-blur-xl px-6 py-4 border-t flex items-center justify-between transition-colors duration-300`}>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('page', pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-4 py-2 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10' : 'bg-white/50 hover:bg-white border-slate-200'} rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border`}
                    >
                      Previous
                    </button>
                    <span className={`px-4 py-2 ${isDark ? 'bg-slate-950/50 border-white/10' : 'bg-white/50 border-slate-200'} rounded-xl text-sm font-medium border`}>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => handleFilterChange('page', pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className={`px-4 py-2 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10' : 'bg-white/50 hover:bg-white border-slate-200'} rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )}

    {/* User Management Tab Content */}
    {activeTab === 'users' && (
      <>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* User Search */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-cyan-600/10 rounded-2xl blur-xl"></div>
            <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200'} backdrop-blur-xl p-6 rounded-2xl border shadow-xl transition-colors duration-300`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md group">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'} group-focus-within:text-violet-400 transition-colors pointer-events-none`} />
                    <input
                      type="text"
                      value={usersFilters.search}
                      onChange={(e) => handleUsersFilterChange('search', e.target.value)}
                      placeholder="Search by username, email, or full name..."
                      className={`w-full pl-12 pr-4 py-3 rounded-xl ${isDark ? 'bg-slate-800/50 text-white placeholder:text-slate-500 border-white/10' : 'bg-white/50 text-slate-900 placeholder:text-slate-400 border-slate-200'} backdrop-blur-xl border focus:border-violet-500/50 focus:outline-none transition-all text-sm shadow-inner`}
                    />
                  </div>
                  <button
                    onClick={() => setUsersFilters({ page: 1, limit: 20, search: '' })}
                    className={`px-5 py-3 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10' : 'bg-white/50 hover:bg-white border-slate-200'} rounded-xl text-sm font-medium transition-all duration-300 border`}
                  >
                    Clear
                  </button>
                </div>
                <button
                  onClick={fetchAllUsers}
                  className={`p-3 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10 hover:border-violet-500/50' : 'bg-white/50 hover:bg-white border-slate-200 hover:border-violet-400'} rounded-xl transition-all duration-300 ml-4 border`}
                  title="Refresh users"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-cyan-600/10 rounded-2xl blur-xl"></div>
            <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200'} backdrop-blur-xl rounded-2xl border overflow-hidden shadow-xl transition-colors duration-300`}>
              <div className="overflow-x-auto">
                {usersLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20' : 'bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20'} rounded-2xl flex items-center justify-center`}>
                      <Users className="w-8 h-8 text-violet-400" />
                    </div>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No users found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className={`${isDark ? 'bg-slate-950/50 border-white/10' : 'bg-slate-100/50 border-slate-200'} backdrop-blur-xl border-b`}>
                      <tr>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Username</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Email</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Full Name</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Role</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Status</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Last Login</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                      {allUsers.map((u) => (
                        <tr key={u._id} className={`${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-colors`}>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-violet-500/20 rounded-lg">
                                <User className="w-4 h-4 text-violet-400" />
                              </div>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.username}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{u.email}</td>
                          <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{u.fullName || '-'}</td>
                          <td className="px-4 py-4 text-sm">
                            {u.isAdmin ? (
                              <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit border ${isDark ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-violet-100 text-violet-700 border-violet-300'}`}>
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            ) : (
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${isDark ? 'bg-slate-700/50 text-slate-400 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                                User
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {u.isSuspended ? (
                              <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit border ${isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-300'}`}>
                                <Ban className="w-3 h-3" />
                                Suspended
                              </span>
                            ) : (
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300'}`}>
                                Active
                              </span>
                            )}
                          </td>
                          <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleAdmin(u._id, u.isAdmin, u.username)}
                                disabled={u._id === user?.id}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border ${
                                  u.isAdmin
                                    ? isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300'
                                    : isDark ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border-violet-500/30' : 'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-300'
                                }`}
                                title={u._id === user?.id ? 'Cannot modify your own role' : ''}
                              >
                                {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => handleToggleSuspension(u._id, u.isSuspended, u.username)}
                                disabled={u._id === user?.id}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border ${
                                  u.isSuspended
                                    ? isDark ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
                                    : isDark ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300'
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
                <div className={`${isDark ? 'bg-slate-950/50 border-white/10' : 'bg-slate-100/50 border-slate-200'} backdrop-blur-xl px-6 py-4 border-t flex items-center justify-between transition-colors duration-300`}>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Showing {((usersPagination.page - 1) * usersPagination.limit) + 1} to {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of {usersPagination.total} users
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUsersFilterChange('page', usersPagination.page - 1)}
                      disabled={usersPagination.page === 1}
                      className={`px-4 py-2 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10' : 'bg-white/50 hover:bg-white border-slate-200'} rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border`}
                    >
                      Previous
                    </button>
                    <span className={`px-4 py-2 ${isDark ? 'bg-slate-950/50 border-white/10' : 'bg-white/50 border-slate-200'} rounded-xl text-sm font-medium border`}>
                      Page {usersPagination.page} of {usersPagination.pages}
                    </span>
                    <button
                      onClick={() => handleUsersFilterChange('page', usersPagination.page + 1)}
                      disabled={usersPagination.page === usersPagination.pages}
                      className={`px-4 py-2 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10' : 'bg-white/50 hover:bg-white border-slate-200'} rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);
};

export default Admin;

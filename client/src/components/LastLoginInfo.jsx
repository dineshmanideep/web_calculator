/*
 * LastLoginInfo
 *
 * Purpose:
 * Displays user's last login/logout information or welcome message
 * using sessionStorage data, showing it only once per session.
 *
 * Parameters:
 * - darkMode (boolean): toggles between dark and light theme styling
 *
 * Return value:
 * A styled info box with formatted last login/logout timestamps,
 * or a welcome message if it's the first login.
 */
import { useEffect, useState } from 'react';
import {
  Info, X, LogIn, LogOut, Sparkles,
} from 'lucide-react';

export default function LastLoginInfo({ darkMode }) {
  const [loginInfo, setLoginInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get login info from sessionStorage
    const storedInfo = sessionStorage.getItem('loginInfo');
    if (storedInfo) {
      try {
        const info = JSON.parse(storedInfo);
        setLoginInfo(info);
        setIsVisible(true);

        // Clear from sessionStorage after reading (so it only shows once)
        sessionStorage.removeItem('loginInfo');
      } catch (error) {
        console.error('Error parsing login info:', error);
      }
    }
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);

    // Format: "Oct 27, 2025 at 2:30 PM"
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return date.toLocaleString('en-US', options);
  };

  const getTimeSince = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (!isVisible || !loginInfo) return null;

  return (
    <div className="mb-4 animate-fade-in">
      {loginInfo.isFirstLogin ? (
        // First-time login message - NO login/logout info shown
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-2xl blur-xl"></div>
          <div className={`relative ${darkMode ? 'bg-gradient-to-br from-slate-900/90 to-emerald-900/90 border-emerald-500/30' : 'bg-gradient-to-br from-white/90 to-emerald-50/90 border-emerald-400'} backdrop-blur-xl rounded-2xl shadow-2xl border p-5`}>
            <div className="flex items-start gap-4">
              <div className={`${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-200'} p-3 rounded-xl flex-shrink-0`}>
                <Sparkles className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`${darkMode ? 'text-white' : 'text-slate-900'} font-bold text-lg mb-1 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent`}>
                  Welcome to Scientific Calculator!
                </h3>
                <p className={`${darkMode ? 'text-emerald-100' : 'text-emerald-700'} text-sm`}>
                  This is your first time logging in. We're excited to have you here!
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className={`${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors p-1`}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Returning user message - Show previous login/logout info
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-2xl blur-xl"></div>
          <div className={`relative ${darkMode ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-violet-500/30' : 'bg-gradient-to-br from-white/90 to-violet-50/90 border-violet-400'} backdrop-blur-xl rounded-2xl shadow-2xl border p-5`}>
            <div className="flex items-start gap-4">
              <div className={`${darkMode ? 'bg-violet-500/20' : 'bg-violet-200'} p-3 rounded-xl flex-shrink-0`}>
                <Info className={`w-6 h-6 ${darkMode ? 'text-violet-400' : 'text-violet-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`${darkMode ? 'text-white' : 'text-slate-900'} font-bold text-lg mb-3 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent`}>
                  Welcome back!
                </h3>

                <div className="space-y-2">
                  {/* Last Login - Only show if exists */}
                  {loginInfo.lastLogin && (
                    <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-violet-100'} backdrop-blur-sm rounded-xl p-3 border ${darkMode ? 'border-white/10' : 'border-violet-200'}`}>
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-violet-300' : 'text-violet-700'} text-sm font-medium`}>
                        <LogIn className="w-4 h-4" />
                        <span>Previous Login:</span>
                      </div>
                      <div className={`mt-2 ml-6 ${darkMode ? 'text-slate-300' : 'text-slate-700'} text-sm`}>
                        {formatDateTime(loginInfo.lastLogin)}
                        <span className={`${darkMode ? 'text-violet-400' : 'text-violet-600'} ml-2 font-medium`}>
                          ({getTimeSince(loginInfo.lastLogin)})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Last Logout - Only show if exists */}
                  {/* {loginInfo.lastLogout && (
                    <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-violet-100'} backdrop-blur-sm rounded-xl p-3 border ${darkMode ? 'border-white/10' : 'border-violet-200'}`}>
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-violet-300' : 'text-violet-700'} text-sm font-medium`}>
                        <LogOut className="w-4 h-4" />
                        <span>Last Logout:</span>
                      </div>
                      <div className={`mt-2 ml-6 ${darkMode ? 'text-slate-300' : 'text-slate-700'} text-sm`}>
                        {formatDateTime(loginInfo.lastLogout)}
                        <span className={`${darkMode ? 'text-violet-400' : 'text-violet-600'} ml-2 font-medium`}>
                          ({getTimeSince(loginInfo.lastLogout)})
                        </span>
                      </div>
                    </div>
                  )} */}

                  {/* If no previous login/logout info exists (shouldn't happen, but handle it) */}
                  {!loginInfo.lastLogin && !loginInfo.lastLogout && (
                    <p className={`${darkMode ? 'text-violet-200' : 'text-violet-700'} text-sm`}>
                      Welcome back! Good to see you again.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className={`${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors p-1`}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
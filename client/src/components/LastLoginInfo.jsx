/*
 * LastLoginInfo
 *
 * Purpose:
 * Displays user's last login/logout information or welcome message
 * using sessionStorage data, showing it only once per session.
 *
 * Parameters:
 * None (internally fetches from sessionStorage)
 *
 * Return value:
 * A styled info box with formatted last login/logout timestamps,
 * or a welcome message if it's the first login.
 */
import { useEffect, useState } from 'react';
import {
  Info, X, LogIn, LogOut,
} from 'lucide-react';

export default function LastLoginInfo() {
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg border-2 border-green-400 p-4">
          <div className="flex items-start gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                🎉 Welcome to Web Calculator!
              </h3>
              <p className="text-green-50 text-sm">
                This is your first time logging in. We're excited to have you here!
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-green-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Returning user message - Show previous login/logout info
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg border-2 border-blue-400 p-4">
          <div className="flex items-start gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">
                Welcome back! 👋
              </h3>

              <div className="space-y-2">
                {/* Last Login - Only show if exists */}
                {loginInfo.lastLogin && (
                  <div className="bg-black bg-opacity-20 rounded p-2">
                    <div className="flex items-center gap-2 text-blue-100 text-sm">
                      <LogIn className="w-4 h-4" />
                      <span className="font-semibold">Previous Login:</span>
                    </div>
                    <div className="mt-1 ml-6 text-blue-50 text-sm">
                      {formatDateTime(loginInfo.lastLogin)}
                      <span className="text-blue-200 ml-2">
                        (
                        {getTimeSince(loginInfo.lastLogin)}
                        )
                      </span>
                    </div>
                  </div>
                )}

                {/* Last Logout - Only show if exists */}
                {loginInfo.lastLogout && (
                  <div className="bg-black bg-opacity-20 rounded p-2">
                    <div className="flex items-center gap-2 text-blue-100 text-sm">
                      <LogOut className="w-4 h-4" />
                      <span className="font-semibold">Last Logout:</span>
                    </div>
                    <div className="mt-1 ml-6 text-blue-50 text-sm">
                      {formatDateTime(loginInfo.lastLogout)}
                      <span className="text-blue-200 ml-2">
                        (
                        {getTimeSince(loginInfo.lastLogout)}
                        )
                      </span>
                    </div>
                  </div>
                )}

                {/* If no previous login/logout info exists (shouldn't happen, but handle it) */}
                {!loginInfo.lastLogin && !loginInfo.lastLogout && (
                  <p className="text-blue-100 text-sm">
                    Welcome back! Good to see you again.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-blue-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

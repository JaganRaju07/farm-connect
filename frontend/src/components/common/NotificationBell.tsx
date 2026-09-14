// frontend/src/components/common/NotificationBell.tsx
'use client';

import { Bell, X, ShoppingBag, User, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const typeIcons: Record<string, any> = {
  order_placed: ShoppingBag,
  order_confirmed: CheckCircle,
  order_packed: ShoppingBag,
  order_delivered: CheckCircle,
  profile_verified: User,
  default: Bell
};

/**
 * NotificationBell Component
 * 
 * Displays a badge showing the number of unread notifications.
 * When clicked, toggles a dropdown showing a list of recent notifications.
 * Automatically marks all notifications as read when opened.
 */
export default function NotificationBell() {
  const { notifications, unreadCount, isOpen, setIsOpen, markAllRead } = useNotifications();

  const openAndMarkRead = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllRead();
    }
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={openAndMarkRead}
        className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none"
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown on click outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const Icon = typeIcons[notif.type] || typeIcons.default;
                  return (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${
                        !notif.is_read ? 'bg-primary-50/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${
                          !notif.is_read ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notif.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5 break-words">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

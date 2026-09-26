'use client';

import { Bell } from 'lucide-react';

export default function NotificationBell() {
  return (
    <button 
      className="relative p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      aria-label="View notifications"
    >
      <Bell className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}

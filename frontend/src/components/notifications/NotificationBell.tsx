'use client';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  return (
    <button className="relative p-2 hover:bg-gray-100 rounded-lg">
      <Bell className="w-5 h-5 text-gray-700" />
    </button>
  );
}

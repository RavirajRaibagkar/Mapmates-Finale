'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Bell, Check, X, Trophy, MessageCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'connection' | 'message' | 'place_approved' | 'reward' | 'announcement';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    // Try to load from localStorage first
    const stored = localStorage.getItem('mapmates_notifications');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Error parsing stored notifications:', e);
      }
    }

    // Default notifications if nothing stored
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'connection',
        title: 'New Connection Request',
        message: 'Someone wants to connect with you!',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        type: 'place_approved',
        title: 'Place Approved! 🎉',
        message: 'Your submitted place has been approved. You earned 50 Mapos!',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        type: 'reward',
        title: 'Daily Reward',
        message: 'You earned 20 Mapos for your 5-day streak!',
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '4',
        type: 'message',
        title: 'New Message',
        message: 'You have a new message from a friend',
        read: true,
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '5',
        type: 'announcement',
        title: 'Welcome to MapMates!',
        message: 'Start exploring and connecting with fellow travelers. Earn Mapos by playing games and submitting places!',
        read: true,
        created_at: new Date(Date.now() - 259200000).toISOString()
      }
    ];

    setNotifications(mockNotifications);
    localStorage.setItem('mapmates_notifications', JSON.stringify(mockNotifications));
    setLoading(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    // Persist to localStorage
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('mapmates_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    // Persist to localStorage
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('mapmates_notifications', JSON.stringify(updated));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(notif => notif.id !== id);
    setNotifications(updated);
    // Persist to localStorage
    localStorage.setItem('mapmates_notifications', JSON.stringify(updated));
    toast.success('Notification deleted');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'place_approved': return <MapPin className="w-5 h-5 text-purple-500" />;
      case 'reward': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'announcement': return <Bell className="w-5 h-5 text-gray-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <div className="bg-purple-600 text-white rounded-full px-3 py-1 text-sm font-bold">
              {unreadCount} new
            </div>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-lg p-6 ${
                  !notif.read ? 'border-2 border-purple-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{notif.title}</h3>
                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-purple-600 hover:text-purple-700 p-1"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{notif.message}</p>
                    
                    <p className="text-sm text-gray-400">
                      {format(new Date(notif.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

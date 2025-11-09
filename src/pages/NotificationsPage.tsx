import { useEffect, useState } from 'react';
import { supabase, Notification } from '../lib/supabase';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NotificationsPageProps {
  onBack: () => void;
}

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const channel = supabase
        .channel('notifications')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading notifications...</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <CheckCheck size={20} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-6">No notifications yet</p>
            <button
              onClick={onBack}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-md p-6 ${
                  !notification.is_read ? 'border-l-4 border-orange-600' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-4 text-orange-600 hover:text-orange-700 text-sm font-semibold"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onBack}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}

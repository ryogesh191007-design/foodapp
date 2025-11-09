import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase, FoodItem } from './lib/supabase';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import CanteenStaffPage from './pages/CanteenStaffPage';
import { Bell, Menu as MenuIcon, LogOut } from 'lucide-react';

type Page =
  | 'home'
  | 'login'
  | 'menu'
  | 'cart'
  | 'payment-success'
  | 'order-tracking'
  | 'notifications'
  | 'admin'
  | 'canteen-staff';

interface CartItem extends FoodItem {
  quantity: number;
}

function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrderNumber, setLastOrderNumber] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        setCurrentPage('admin');
      } else if (profile.role === 'canteen_staff') {
        setCurrentPage('canteen-staff');
      } else {
        setCurrentPage('menu');
      }
    } else if (!loading && !user) {
      setCurrentPage('home');
    }
  }, [user, profile, loading]);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();

      const channel = supabase
        .channel('user_notifications')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => {
            fetchNotificationCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setNotificationCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const addToCart = (item: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const handleCheckout = async () => {
    if (!user) return;

    try {
      const orderNumber = `ORD${Date.now()}`;
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.05;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            student_id: user.id,
            total_amount: total,
            status: 'preparing',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        food_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            message: `Your order ${orderNumber} has been placed successfully!`,
            is_read: false,
          },
        ]);

      setLastOrderNumber(orderNumber);
      setCart([]);
      setCurrentPage('payment-success');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCart([]);
    setCurrentPage('home');
    setShowMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'home') {
      return <HomePage onOrderNow={() => setCurrentPage('login')} />;
    }
    if (currentPage === 'login') {
      return <LoginPage onBack={() => setCurrentPage('home')} />;
    }
  }

  if (profile?.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (profile?.role === 'canteen_staff') {
    return <CanteenStaffPage onLogout={handleLogout} />;
  }

  const renderStudentNav = () => (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-orange-600">Campus Bites</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('notifications')}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={24} className="text-gray-700" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MenuIcon size={24} className="text-gray-700" />
          </button>
        </div>
      </div>
      {showMenu && (
        <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px]">
          <button
            onClick={() => {
              setCurrentPage('menu');
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
          >
            Menu
          </button>
          <button
            onClick={() => {
              setCurrentPage('order-tracking');
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
          >
            Track Orders
          </button>
          <button
            onClick={() => {
              setCurrentPage('notifications');
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
          >
            Notifications
          </button>
          <div className="border-t my-2"></div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-red-600 flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'payment-success' && renderStudentNav()}

      {currentPage === 'menu' && (
        <MenuPage
          onAddToCart={addToCart}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onViewCart={() => setCurrentPage('cart')}
        />
      )}

      {currentPage === 'cart' && (
        <CartPage
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={handleCheckout}
          onBack={() => setCurrentPage('menu')}
        />
      )}

      {currentPage === 'payment-success' && (
        <PaymentSuccessPage
          orderNumber={lastOrderNumber}
          onTrackOrder={() => setCurrentPage('order-tracking')}
        />
      )}

      {currentPage === 'order-tracking' && (
        <OrderTrackingPage onBack={() => setCurrentPage('menu')} />
      )}

      {currentPage === 'notifications' && (
        <NotificationsPage onBack={() => setCurrentPage('menu')} />
      )}
    </div>
  );
}

export default App;

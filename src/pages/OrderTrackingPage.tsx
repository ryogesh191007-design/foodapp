import { useEffect, useState } from 'react';
import { supabase, Order, OrderItem, FoodItem } from '../lib/supabase';
import { Clock, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface OrderTrackingPageProps {
  onBack: () => void;
}

interface OrderWithItems extends Order {
  items: (OrderItem & { food_item: FoodItem })[];
}

export default function OrderTrackingPage({ onBack }: OrderTrackingPageProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();

      const channel = supabase
        .channel('orders')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `student_id=eq.${user.id}` },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*, food_items(*)')
            .eq('order_id', order.id);

          return {
            ...order,
            items: itemsData?.map(item => ({
              ...item,
              food_item: item.food_items as unknown as FoodItem
            })) || []
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Clock className="text-yellow-500" size={24} />;
      case 'ready':
        return <Package className="text-blue-500" size={24} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Clock className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Track Your Orders</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-xl text-gray-600 mb-6">No orders yet</p>
            <button
              onClick={onBack}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-orange-50 p-4 border-b border-orange-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="text-lg font-bold text-gray-800">{order.order_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="font-semibold text-gray-800">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Order Items:</h3>
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-gray-700">
                        <span>{item.food_item.name} x {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-4 pt-4 flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
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

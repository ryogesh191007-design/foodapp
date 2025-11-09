import { useEffect, useState } from 'react';
import { supabase, Order, OrderItem, FoodItem } from '../lib/supabase';
import { Package, CheckCircle } from 'lucide-react';

interface CanteenStaffPageProps {
  onLogout: () => void;
}

interface OrderWithItems extends Order {
  items: (OrderItem & { food_item: FoodItem })[];
  student_name: string;
}

export default function CanteenStaffPage({ onLogout }: CanteenStaffPageProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('staff_orders')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, profiles(full_name)')
        .in('status', ['preparing', 'ready'])
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
            student_name: (order.profiles as unknown as { full_name: string }).full_name,
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

  const updateOrderStatus = async (orderId: string, status: 'ready' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      const order = orders.find(o => o.id === orderId);
      if (order) {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: order.student_id,
              message: `Your order ${order.order_number} is now ${status === 'ready' ? 'ready for pickup' : status}!`,
              is_read: false
            }
          ]);
      }

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Canteen Staff Panel</h1>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No active orders at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className={`p-4 border-b ${
                  order.status === 'preparing' ? 'bg-yellow-50 border-yellow-100' : 'bg-blue-50 border-blue-100'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="text-xl font-bold text-gray-800">{order.order_number}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-semibold ${
                      order.status === 'preparing' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                    }`}>
                      {order.status === 'preparing' ? 'Preparing' : 'Ready'}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">Student: {order.student_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Items:</h3>
                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{item.food_item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Package size={20} />
                        Mark as Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={20} />
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

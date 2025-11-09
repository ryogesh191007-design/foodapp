import { useEffect, useState } from 'react';
import { supabase, Order, OrderItem, FoodItem } from '../lib/supabase';
import { Package, CheckCircle, Clock } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface OrderWithItems extends Order {
  items: (OrderItem & { food_item: FoodItem })[];
  student_name: string;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin_orders')
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

  const updateOrderStatus = async (orderId: string, status: 'preparing' | 'ready' | 'delivered') => {
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
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const stats = {
    total: orders.length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Package className="text-blue-600" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Preparing</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.preparing}</p>
              </div>
              <Clock className="text-yellow-600" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ready</p>
                <p className="text-3xl font-bold text-blue-600">{stats.ready}</p>
              </div>
              <Package className="text-blue-600" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
            <h2 className="text-xl font-bold text-gray-800">All Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.student_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items.map(item => `${item.food_item.name} x${item.quantity}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as 'preparing' | 'ready' | 'delivered')}
                        className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

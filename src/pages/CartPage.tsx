import { Plus, Minus, Trash2 } from 'lucide-react';
import { FoodItem } from '../lib/supabase';

interface CartItem extends FoodItem {
  quantity: number;
}

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onBack: () => void;
}

export default function CartPage({ cart, onUpdateQuantity, onRemoveItem, onCheckout, onBack }: CartPageProps) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <button
              onClick={onBack}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-lg font-bold text-gray-800 w-24 text-right">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>₹{(total * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{(total * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onBack}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={onCheckout}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

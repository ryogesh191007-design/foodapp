import { useEffect, useState } from 'react';
import { supabase, FoodItem } from '../lib/supabase';
import { ShoppingCart } from 'lucide-react';

interface MenuPageProps {
  onAddToCart: (item: FoodItem) => void;
  cartCount: number;
  onViewCart: () => void;
}

export default function MenuPage({ onAddToCart, cartCount, onViewCart }: MenuPageProps) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('category');

      if (error) throw error;
      setFoodItems(data || []);
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(foodItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
          <button
            onClick={onViewCart}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
          >
            <ShoppingCart size={20} />
            Cart ({cartCount})
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {categories.map(category => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-orange-600 pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems
                .filter(item => item.category === category)
                .map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-orange-600">₹{item.price}</span>
                        {item.is_available ? (
                          <button
                            onClick={() => onAddToCart(item)}
                            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <span className="text-red-600 font-semibold">Not Available</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

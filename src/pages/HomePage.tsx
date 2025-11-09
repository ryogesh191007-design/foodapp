import { Utensils } from 'lucide-react';

interface HomePageProps {
  onOrderNow: () => void;
}

export default function HomePage({ onOrderNow }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-white p-6 rounded-full shadow-lg">
            <Utensils size={80} className="text-orange-600" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Campus Bites</h1>
        <p className="text-xl text-gray-600 mb-8">Your College Food Ordering App</p>
        <button
          onClick={onOrderNow}
          className="bg-orange-600 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-orange-700 transition-colors shadow-lg"
        >
          Order Now
        </button>
      </div>
    </div>
  );
}

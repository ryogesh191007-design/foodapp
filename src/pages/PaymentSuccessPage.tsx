import { CheckCircle } from 'lucide-react';

interface PaymentSuccessPageProps {
  orderNumber: string;
  onTrackOrder: () => void;
}

export default function PaymentSuccessPage({ orderNumber, onTrackOrder }: PaymentSuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle size={80} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-600 mb-2">Order Number</p>
          <p className="text-2xl font-bold text-orange-600">{orderNumber}</p>
        </div>

        <button
          onClick={onTrackOrder}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
        >
          Track Your Order
        </button>
      </div>
    </div>
  );
}

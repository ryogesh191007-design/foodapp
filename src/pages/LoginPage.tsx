import { useState } from 'react';
import { User, ShieldCheck, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onBack: () => void;
}

export default function LoginPage({ onBack }: LoginPageProps) {
  const [mode, setMode] = useState<'select' | 'login' | 'signup'>('select');
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin' | 'canteen_staff'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, fullName, selectedRole);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Select Your Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => {
                setSelectedRole('student');
                setMode('login');
              }}
              className="bg-blue-50 hover:bg-blue-100 p-8 rounded-xl transition-colors border-2 border-blue-200"
            >
              <User size={48} className="text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">Student</h3>
            </button>
            <button
              onClick={() => {
                setSelectedRole('admin');
                setMode('login');
              }}
              className="bg-green-50 hover:bg-green-100 p-8 rounded-xl transition-colors border-2 border-green-200"
            >
              <ShieldCheck size={48} className="text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">Admin</h3>
            </button>
            <button
              onClick={() => {
                setSelectedRole('canteen_staff');
                setMode('login');
              }}
              className="bg-orange-50 hover:bg-orange-100 p-8 rounded-xl transition-colors border-2 border-orange-200"
            >
              <ChefHat size={48} className="text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">Canteen Staff</h3>
            </button>
          </div>
          <button
            onClick={onBack}
            className="mt-6 text-gray-600 hover:text-gray-800 w-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {mode === 'login' ? 'Login' : 'Sign Up'} as {selectedRole.replace('_', ' ')}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-orange-600 hover:text-orange-700"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>

        <button
          onClick={() => setMode('select')}
          className="mt-4 text-gray-600 hover:text-gray-800 w-full"
        >
          Back to Role Selection
        </button>
      </div>
    </div>
  );
}

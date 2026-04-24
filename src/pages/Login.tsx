import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Rocket } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
            <Rocket size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">BuildMate</h1>
        <p className="text-gray-500 mb-8">Connect, Learn, and Build the future together.</p>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          <LogIn size={20} />
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>
        
        <p className="mt-8 text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

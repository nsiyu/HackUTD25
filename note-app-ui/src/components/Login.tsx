import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';
import { authService } from '../services/auth';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.login({ email, password });
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-surface">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-maya rounded-lg flex items-center justify-center text-white hover:bg-maya/90 transition-colors">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </div>
          <span className="text-xl font-medium text-jet dark:text-dark-text">Notable</span>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-jet dark:text-dark-text">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-dark-surface/50 border border-maya/20 rounded-lg focus:outline-none focus:border-maya dark:text-dark-text"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-jet dark:text-dark-text">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-dark-surface/50 border border-maya/20 rounded-lg focus:outline-none focus:border-maya dark:text-dark-text"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-maya text-white font-medium rounded-lg hover:bg-maya/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-jet/70 dark:text-dark-text/70">or sign in with</div>

        <div className="mt-4 flex justify-center gap-4">
          <button className="p-3 bg-white/50 dark:bg-dark-surface/50 rounded-lg hover:bg-maya/10 transition-all">
            <FaGoogle className="text-maya" />
          </button>
          <button className="p-3 bg-white/50 dark:bg-dark-surface/50 rounded-lg hover:bg-maya/10 transition-all">
            <FaFacebook className="text-maya" />
          </button>
          <button className="p-3 bg-white/50 dark:bg-dark-surface/50 rounded-lg hover:bg-maya/10 transition-all">
            <FaTwitter className="text-maya" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

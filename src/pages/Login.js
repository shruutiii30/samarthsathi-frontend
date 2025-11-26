import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ setAuth, setUser }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { mobile, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAuth(true);
      setUser(response.data.user);
      toast.success(t('welcomeBack'));
      navigate('/');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007BFF 0%, #00A859 100%)' }}>
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl" data-testid="login-card">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🤝</div>
          <h1 className="text-3xl font-bold" style={{ color: '#007BFF' }}>SmartSathi</h1>
          <p className="text-sm mt-2" style={{ color: '#00A859' }}>स्मार्ट साथी</p>
          <p className="text-gray-600 mt-2">{t('tagline')}</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('mobile')}</label>
            <Input
              data-testid="login-mobile-input"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876543210"
              required
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('password')}</label>
            <Input
              data-testid="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <Button
            data-testid="login-submit-button"
            type="submit"
            disabled={loading}
            className="w-full text-lg py-6 font-semibold"
            style={{ background: '#007BFF' }}
          >
            {loading ? 'Loading...' : t('login')}
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold" style={{ color: '#007BFF' }} data-testid="go-to-register-link">
            {t('register')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
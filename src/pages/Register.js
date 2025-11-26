import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Register({ setAuth, setUser }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    language: 'hindi',
    gender: 'male'
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAuth(true);
      setUser(response.data.user);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ background: 'linear-gradient(135deg, #00A859 0%, #FFA500 100%)' }}>
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl" data-testid="register-card">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🤝</div>
          <h1 className="text-3xl font-bold" style={{ color: '#007BFF' }}>SmartSathi</h1>
          <p className="text-sm mt-2" style={{ color: '#00A859' }}>स्मार्ट साथी</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('name')}</label>
            <Input
              data-testid="register-name-input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('mobile')}</label>
            <Input
              data-testid="register-mobile-input"
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              placeholder="9876543210"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('password')}</label>
            <Input
              data-testid="register-password-input"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('language')}</label>
            <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
              <SelectTrigger data-testid="register-language-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('gender')}</label>
            <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
              <SelectTrigger data-testid="register-gender-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('male')}</SelectItem>
                <SelectItem value="female">{t('female')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            data-testid="register-submit-button"
            type="submit"
            disabled={loading}
            className="w-full text-lg py-6 font-semibold"
            style={{ background: '#00A859' }}
          >
            {loading ? 'Loading...' : t('register')}
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#007BFF' }} data-testid="go-to-login-link">
            {t('login')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
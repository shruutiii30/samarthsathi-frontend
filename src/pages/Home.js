import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useLanguage } from '../context/LanguageContext';
import { Volume2 } from 'lucide-react';

export default function Home({ user }) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const services = [
    {
      id: 'health-schemes',
      icon: '🫀',
      title: t('healthSchemes'),
      color: '#007BFF',
      image: 'https://images.unsplash.com/photo-1659353888906-adb3e0041693'
    },
    {
      id: 'education-support',
      icon: '🎓',
      title: t('educationSupport'),
      color: '#00A859',
      image: 'https://images.unsplash.com/flagged/photo-1574097656146-0b43b7660cb6'
    },
    {
      id: 'id-services',
      icon: '🆔',
      title: t('idServices'),
      color: '#FFA500',
      image: 'https://images.pexels.com/photos/13657444/pexels-photo-13657444.jpeg'
    },
    {
      id: 'finance-dbt',
      icon: '💰',
      title: t('financeDBT'),
      color: '#007BFF',
      image: 'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg'
    },
    {
      id: 'learning',
      icon: '🎥',
      title: t('learningHub'),
      color: '#00A859',
      image: 'https://images.unsplash.com/photo-1707721690544-781fe6ede937'
    }
  ];

  const speakGreeting = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(t('greeting'));
      utterance.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : language === 'marathi' ? 'mr-IN' : 'en-IN';
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (user && user.language) {
      setLanguage(user.language);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🤝</span>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#007BFF' }}>SmartSathi</h1>
              <p className="text-xs" style={{ color: '#00A859' }}>स्मार्ट साथी</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40" data-testid="language-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hindi">हिंदी</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="marathi">मराठी</SelectItem>
                <SelectItem value="tamil">தமிழ்</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleLogout} variant="outline" data-testid="logout-button">{t('logout')}</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Greeting Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            {t('welcome')}, {user?.name}! 👋
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">{t('greeting')}</p>
          <Button
            data-testid="speak-greeting-button"
            onClick={speakGreeting}
            size="lg"
            className="text-lg px-8 py-6"
            style={{ background: isPlaying ? '#FFA500' : '#007BFF' }}
          >
            <Volume2 className={`mr-2 ${isPlaying ? 'voice-active' : ''}`} />
            {isPlaying ? t('stopVoice') : t('startVoice')}
          </Button>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card
              key={service.id}
              className="service-card overflow-hidden cursor-pointer bg-white border-0"
              onClick={() => service.id === 'learning' ? navigate('/learning') : navigate(`/guide/${service.id}`)}
              data-testid={`service-card-${service.id}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${service.color}dd, transparent)` }} />
                <div className="absolute bottom-4 left-4 text-6xl">{service.icon}</div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: service.color }}>{service.title}</h3>
                <div className="space-y-2 mt-4">
                  {(service.id === 'health-schemes' || service.id === 'education-support' || service.id === 'farmer-schemes') && (
                    <Button 
                      className="w-full" 
                      style={{ background: '#FFA500' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/form/${service.id === 'farmer-schemes' ? 'farmer-schemes' : service.id}`);
                      }}
                      data-testid={`voice-form-${service.id}`}
                    >
                      🎤 Voice Form Assistant
                    </Button>
                  )}
                  <Button className="w-full" style={{ background: service.color }}>
                    {t('viewGuide')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Admin Link */}
        <div className="text-center mt-16">
          <Button
            data-testid="admin-link-button"
            onClick={() => navigate('/admin')}
            variant="outline"
            size="lg"
          >
            {t('admin')}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20 py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">{t('footerText')}</p>
        </div>
      </footer>
    </div>
  );
}
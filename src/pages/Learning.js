import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Learning() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tutorials = [
    {
      id: 'health-schemes',
      title: t('healthSchemes'),
      video: 'https://youtube.com/embed/ukfCiXi0oWM?si=OyOWJLsOMz2w2La8',
      description: 'Learn how to apply for Ayushman Bharat health card'
    },
    {
      id: 'education-support',
      title: t('educationSupport'),
      video: 'https://youtube.com/embed/M8W0PFlrEaU?si=ww-E9DanmIVjHwBP/',
      description: 'Complete scholarship application process'
    },
    {
      id: 'gpay-phonepe',
      title: 'GPay/PhonePe Tutorial',
      video: 'https://youtube.com/embed/-Ougj4el-2g?si=UzEneet2mwwR0Nmp',
      description: 'How to create gpay account and link bank account'
    },
    {
      id: 'mobile-recharge',
      title: 'Mobile Recharge',
      video: 'https://youtube.com/embed/UwXzg3YShzA?si=jDoZAZH5ebMaqj2N',
      description: 'Step-by-step mobile recharge guide'
    },
    {
      id: 'farmer-schemes',
      title: 'PM-Kisan Registration',
      video: 'https://www.youtube.com/embed/9Ihd5EXSuBM?si=gudgrArhiy21pddG',
      description: 'Register for farmer schemes'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-4" data-testid="back-to-home-button">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#007BFF' }}>{t('learningHub')}</h1>
            <p className="text-sm text-gray-600">Video Tutorials & Guides</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="overflow-hidden bg-white" data-testid={`tutorial-card-${tutorial.id}`}>
              <div className="aspect-video bg-gray-200">
                <iframe
                  className="w-full h-full"
                  src={tutorial.video}
                  title={tutorial.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#007BFF' }}>{tutorial.title}</h3>
                <p className="text-gray-600 mb-4">{tutorial.description}</p>
                <Button
                  data-testid={`view-guide-${tutorial.id}`}
                  onClick={() => navigate(`/guide/${tutorial.id}`)}
                  className="w-full"
                  style={{ background: '#00A859' }}
                >
                  📖 {t('viewGuide')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
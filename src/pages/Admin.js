import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Admin() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/admin/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await axios.get(`${API}/admin/export`);
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartsathi-data-${Date.now()}.json`;
      link.click();
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-4" data-testid="back-to-home-admin">
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#007BFF' }}>Admin Dashboard</h1>
              <p className="text-sm text-gray-600">SmartSathi Analytics</p>
            </div>
          </div>
          <Button onClick={exportData} style={{ background: '#00A859' }} data-testid="export-data-button">
            <Download className="mr-2" size={20} />
            Export Data
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-white" data-testid="stat-total-users">
            <div className="text-4xl mb-2" style={{ color: '#007BFF' }}>👥</div>
            <h3 className="text-gray-600 text-sm mb-1">Total Users</h3>
            <p className="text-3xl font-bold" style={{ color: '#007BFF' }}>{analytics?.total_users || 0}</p>
          </Card>
          
          <Card className="p-6 bg-white" data-testid="stat-total-interactions">
            <div className="text-4xl mb-2" style={{ color: '#00A859' }}>📊</div>
            <h3 className="text-gray-600 text-sm mb-1">Total Interactions</h3>
            <p className="text-3xl font-bold" style={{ color: '#00A859' }}>{analytics?.total_interactions || 0}</p>
          </Card>
          
          <Card className="p-6 bg-white" data-testid="stat-avg-time">
            <div className="text-4xl mb-2" style={{ color: '#FFA500' }}>⏱️</div>
            <h3 className="text-gray-600 text-sm mb-1">Avg. Completion Time</h3>
            <p className="text-3xl font-bold" style={{ color: '#FFA500' }}>{analytics?.avg_completion_time || 0}s</p>
          </Card>
          
          <Card className="p-6 bg-white" data-testid="stat-most-language">
            <div className="text-4xl mb-2" style={{ color: '#007BFF' }}>🌐</div>
            <h3 className="text-gray-600 text-sm mb-1">Most Used Language</h3>
            <p className="text-2xl font-bold capitalize" style={{ color: '#007BFF' }}>{analytics?.most_used_language || 'N/A'}</p>
          </Card>
        </div>

        {/* Most Viewed Guides */}
        <Card className="p-8 bg-white mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#007BFF' }}>Most Viewed Guides</h2>
          <div className="space-y-4">
            {analytics?.most_viewed_guides?.length > 0 ? (
              analytics.most_viewed_guides.map((guide, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg" data-testid={`guide-stat-${index}`}>
                  <div>
                    <p className="font-semibold text-lg">{guide.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: '#00A859' }}>{guide.count}</p>
                    <p className="text-sm text-gray-600">views</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No data available yet</p>
            )}
          </div>
        </Card>

        {/* Input Mode Distribution */}
        <Card className="p-8 bg-white">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#007BFF' }}>Common Input Mode</h2>
          <div className="text-center">
            <div className="text-6xl mb-4">
              {analytics?.common_input_mode === 'voice' ? '🎤' : '⌨️'}
            </div>
            <p className="text-3xl font-bold capitalize" style={{ color: '#00A859' }}>
              {analytics?.common_input_mode || 'N/A'}
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
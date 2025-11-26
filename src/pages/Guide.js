import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, ArrowRight, Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { guideData } from '../utils/guideData';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Guide() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceInput, setVoiceInput] = useState('');

  const guide = guideData[topic];
  const steps = guide?.steps || [];
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : language === 'marathi' ? 'mr-IN' : 'en-IN';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setVoiceInput(transcript);
        
        if (transcript.includes('next') || transcript.includes('अगला') || transcript.includes('पुढे')) {
          handleNext();
        } else if (transcript.includes('back') || transcript.includes('पीछे') || transcript.includes('मागे')) {
          handleBack();
        } else if (transcript.includes('submit') || transcript.includes('जमा') || transcript.includes('सबमिट')) {
          handleSubmit();
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    speakStep();
  }, [currentStep, language]);

  const speakStep = () => {
    if ('speechSynthesis' in window && steps[currentStep]) {
      setIsSpeaking(true);
      const text = steps[currentStep][language] || steps[currentStep].english;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : language === 'marathi' ? 'mr-IN' : 'en-IN';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const completionTime = (Date.now() - startTime) / 1000;
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/interactions`, {
        user_id: user.id,
        topic: topic,
        input_mode: isListening ? 'voice' : 'text',
        completion_time: completionTime,
        steps_done: steps.length,
        videos_watched: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Guide completed! Data saved successfully.');
      navigate('/');
    } catch (error) {
      toast.error('Failed to save data');
    }
  };

  if (!guide) {
    return <div className="min-h-screen flex items-center justify-center">Guide not found</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/learning')} className="mr-4" data-testid="back-button">
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#007BFF' }}>{guide.title[language] || guide.title.english}</h1>
              <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <Button
            data-testid="speak-step-button"
            onClick={speakStep}
            variant="outline"
            size="sm"
            className={isSpeaking ? 'voice-active' : ''}
          >
            <Volume2 size={20} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-8" data-testid="progress-bar">
          <Progress value={progress} className="h-3 progress-animate" style={{ backgroundColor: '#E5E7EB' }} />
          <p className="text-center mt-2 text-sm text-gray-600">{Math.round(progress)}% Complete</p>
        </div>

        {/* Step Card */}
        <Card className="p-8 bg-white shadow-xl mb-8" data-testid="step-card">
          <div className="text-center">
            <div className="text-6xl mb-6">📖</div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#007BFF' }}>
              {steps[currentStep][language] || steps[currentStep].english}
            </h2>
            
            {voiceInput && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Voice Input:</p>
                <p className="font-semibold">{voiceInput}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Voice Control */}
        <Card className="p-6 bg-white mb-8">
          <div className="flex justify-center space-x-4">
            <Button
              data-testid="voice-control-button"
              onClick={isListening ? stopListening : startListening}
              size="lg"
              className="text-lg px-8"
              style={{ background: isListening ? '#FFA500' : '#00A859' }}
            >
              {isListening ? <MicOff className="mr-2 voice-active" /> : <Mic className="mr-2" />}
              {isListening ? t('stopVoice') : t('startVoice')}
            </Button>
          </div>
          <p className="text-center mt-4 text-sm text-gray-600">
            Say "Next", "Back", or "Submit" in your language
          </p>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            data-testid="back-step-button"
            onClick={handleBack}
            disabled={currentStep === 0}
            size="lg"
            variant="outline"
          >
            <ArrowLeft className="mr-2" />
            {t('back')}
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              data-testid="submit-button"
              onClick={handleSubmit}
              size="lg"
              style={{ background: '#00A859' }}
            >
              {t('submit')}
            </Button>
          ) : (
            <Button
              data-testid="next-button"
              onClick={handleNext}
              size="lg"
              style={{ background: '#007BFF' }}
            >
              {t('next')}
              <ArrowRight className="ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
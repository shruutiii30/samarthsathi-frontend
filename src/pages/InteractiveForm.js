import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, Mic, MicOff, Volume2, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formTemplates } from '../utils/formTemplates';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function InteractiveForm() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [currentField, setCurrentField] = useState(0);
  const [formData, setFormData] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [startTime] = useState(Date.now());
  const [fieldStartTime, setFieldStartTime] = useState(Date.now());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const inputRef = useRef(null);

  const form = formTemplates[topic];
  const fields = form?.fields || [];
  const progress = ((currentField + 1) / fields.length) * 100;
  const currentFieldData = fields[currentField];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : language === 'marathi' ? 'mr-IN' : 'en-IN';
      
      recognitionInstance.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        handleVoiceInput(spokenText);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [language]);

  // Speak question when field changes
  useEffect(() => {
    if (currentFieldData) {
      setFieldStartTime(Date.now());
      speakQuestion();
    }
  }, [currentField, language]);

  // Speak the current question
  const speakQuestion = () => {
    if ('speechSynthesis' in window && currentFieldData) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      const question = currentFieldData.label[language] || currentFieldData.label.english;
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : language === 'marathi' ? 'mr-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak confirmation
  const speakConfirmation = (value) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const confirmationTexts = {
        hindi: `मैंने सुना ${value}. क्या मैं इसे सेव करूं?`,
        english: `I heard ${value}. Shall I save it?`,
        marathi: `मी ऐकले ${value}. मी ते सेव्ह करू का?`,
        tamil: `நான் கேட்டேன் ${value}. நான் அதை சேமிக்கலாமா?`
      };
      
      const utterance = new SpeechSynthesisUtterance(confirmationTexts[language]);
      utterance.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : language === 'marathi' ? 'mr-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle voice input
  const handleVoiceInput = (spokenText) => {
    const fieldId = currentFieldData.id;
    setFormData({ ...formData, [fieldId]: spokenText });
    setShowConfirmation(true);
    speakConfirmation(spokenText);
  };

  // Start listening
  const startListening = () => {
    if (recognition) {
      setTranscript('');
      setIsListening(true);
      recognition.start();
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Move to next field
  const handleNext = async () => {
    const fieldId = currentFieldData.id;
    const value = formData[fieldId];
    
    if (!value || value.trim() === '') {
      toast.error('Please fill this field before continuing');
      return;
    }

    // Save field response to backend
    await saveFieldResponse(fieldId, value);
    
    if (currentField < fields.length - 1) {
      setCurrentField(currentField + 1);
      setShowConfirmation(false);
      setTranscript('');
    } else {
      // Submit form
      await handleSubmit();
    }
  };

  // Go back to previous field
  const handleBack = () => {
    if (currentField > 0) {
      setCurrentField(currentField - 1);
      setShowConfirmation(false);
      setTranscript('');
    }
  };

  // Save field response
  const saveFieldResponse = async (fieldName, response) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const timeTaken = (Date.now() - fieldStartTime) / 1000;
      
      await axios.post(`${API}/interactions/form-field`, {
        user_id: user.id,
        form_name: topic,
        field_name: fieldName,
        response: response,
        language: language,
        time_taken: timeTaken,
        input_mode: isListening ? 'voice' : 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to save field response:', error);
    }
  };

  // Submit complete form
  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const totalTime = (Date.now() - startTime) / 1000;
      
      await axios.post(`${API}/interactions`, {
        user_id: user.id,
        topic: topic,
        input_mode: 'voice',
        completion_time: totalTime,
        steps_done: fields.length,
        videos_watched: 0,
        field_data: formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Speak success message
      const successMessages = {
        hindi: 'फॉर्म सफलतापूर्वक जमा हो गया! धन्यवाद स्मार्टसाथी का उपयोग करने के लिए।',
        english: 'Form submitted successfully! Thank you for using SmartSathi.',
        marathi: 'फॉर्म यशस्वीरित्या सबमिट झाला! स्मार्टसाथी वापरण्यासाठी धन्यवाद।',
        tamil: 'படிவம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! SmartSathi ஐ பயன்படுத்தியதற்கு நன்றி.'
      };
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(successMessages[language]);
        utterance.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : language === 'marathi' ? 'mr-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
      
      toast.success('Form submitted successfully!');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      toast.error('Failed to submit form');
    }
  };

  // Handle manual input change
  const handleInputChange = (value) => {
    const fieldId = currentFieldData.id;
    setFormData({ ...formData, [fieldId]: value });
  };

  if (!form) {
    return <div className="min-h-screen flex items-center justify-center">Form not found</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-4" data-testid="back-to-home-form">
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#007BFF' }}>
                {form.title[language] || form.title.english}
              </h1>
              <p className="text-sm text-gray-600">Field {currentField + 1} of {fields.length}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-5xl animate-bounce">
              {isSpeaking ? '🗣️' : '🤖'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-4" style={{ backgroundColor: '#E5E7EB' }} />
          <p className="text-center mt-2 text-sm font-semibold" style={{ color: '#007BFF' }}>
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Form Field Card */}
        <Card 
          className="p-8 bg-white shadow-2xl mb-6 transition-all duration-500"
          style={{
            border: `3px solid ${isSpeaking || isListening ? '#00A859' : 'transparent'}`,
            boxShadow: isSpeaking || isListening ? '0 0 30px rgba(0, 168, 89, 0.3)' : ''
          }}
          data-testid="form-field-card"
        >
          <div className="flex items-start space-x-4 mb-6">
            <div className="text-6xl">{currentFieldData.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold" style={{ color: '#007BFF' }}>
                  {currentFieldData.label[language] || currentFieldData.label.english}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={speakQuestion}
                  data-testid="replay-question-button"
                  className={isSpeaking ? 'voice-active' : ''}
                >
                  <Volume2 size={24} style={{ color: '#FFA500' }} />
                </Button>
              </div>

              {/* Input Field */}
              <div className="mt-4">
                {currentFieldData.type === 'textarea' ? (
                  <Textarea
                    ref={inputRef}
                    value={formData[currentFieldData.id] || ''}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={currentFieldData.placeholder[language]}
                    className="text-xl p-4 min-h-32"
                    data-testid="form-input-field"
                    style={{ border: '2px solid #007BFF' }}
                  />
                ) : currentFieldData.type === 'select' ? (
                  <Select
                    value={formData[currentFieldData.id] || ''}
                    onValueChange={(val) => handleInputChange(val)}
                  >
                    <SelectTrigger className="text-xl p-6" data-testid="form-select-field">
                      <SelectValue placeholder={currentFieldData.placeholder?.[language] || 'Select'} />
                    </SelectTrigger>
                    <SelectContent>
                      {currentFieldData.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-lg">
                          {option.label[language] || option.label.english}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    ref={inputRef}
                    type={currentFieldData.type}
                    value={formData[currentFieldData.id] || ''}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={currentFieldData.placeholder[language]}
                    className="text-xl p-6"
                    data-testid="form-input-field"
                    style={{ border: '2px solid #007BFF' }}
                  />
                )}
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-300">
                  <p className="text-sm text-gray-600 mb-1">Voice Input:</p>
                  <p className="text-lg font-semibold" style={{ color: '#00A859' }}>{transcript}</p>
                </div>
              )}

              {/* Confirmation */}
              {showConfirmation && formData[currentFieldData.id] && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center space-x-3">
                  <CheckCircle size={24} style={{ color: '#007BFF' }} />
                  <p className="text-lg" style={{ color: '#007BFF' }}>
                    {language === 'hindi' && 'मैंने सुना: '}
                    {language === 'english' && 'I heard: '}
                    {language === 'marathi' && 'मी ऐकले: '}
                    {language === 'tamil' && 'நான் கேட்டேன்: '}
                    <span className="font-bold">{formData[currentFieldData.id]}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Voice Control */}
        <Card className="p-6 bg-white mb-6">
          <div className="flex justify-center items-center space-x-6">
            <Button
              onClick={isListening ? stopListening : startListening}
              size="lg"
              className="text-lg px-8 py-6"
              style={{ background: isListening ? '#FFA500' : '#00A859' }}
              data-testid="voice-listen-button"
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 voice-active" size={24} />
                  {t('stopVoice')}
                </>
              ) : (
                <>
                  <Mic className="mr-2" size={24} />
                  {t('startVoice')}
                </>
              )}
            </Button>
          </div>
          <p className="text-center mt-4 text-sm text-gray-600">
            {language === 'hindi' && 'माइक पर क्लिक करें और अपना जवाब बोलें'}
            {language === 'english' && 'Click the mic and speak your answer'}
            {language === 'marathi' && 'माइकवर क्लिक करा आणि तुमचे उत्तर बोला'}
            {language === 'tamil' && 'மைக்கை கிளிக் செய்து உங்கள் பதிலைச் சொல்லுங்கள்'}
          </p>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleBack}
            disabled={currentField === 0}
            size="lg"
            variant="outline"
            className="px-8 py-6"
            data-testid="form-back-button"
          >
            <ArrowLeft className="mr-2" />
            {t('back')}
          </Button>

          {currentField === fields.length - 1 ? (
            <Button
              onClick={handleNext}
              size="lg"
              className="px-8 py-6 text-lg"
              style={{ background: '#00A859' }}
              data-testid="form-submit-button"
            >
              {t('submit')}
              <CheckCircle className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              size="lg"
              className="px-8 py-6 text-lg"
              style={{ background: '#007BFF' }}
              data-testid="form-next-button"
            >
              {t('next')}
              <ArrowLeft className="ml-2 rotate-180" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
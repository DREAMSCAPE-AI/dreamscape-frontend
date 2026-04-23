import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, X, Bot, User } from 'lucide-react';

interface LiveChatProps {
  onClose: () => void;
}

const LiveChat = ({ onClose }: LiveChatProps) => {
  const { t } = useTranslation('support');
  const [messages, setMessages] = useState([
    { type: 'bot', content: t('liveChat.greeting'), timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { type: 'user', content: input, timestamp: new Date().toISOString() }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', content: t('liveChat.autoResponse'), timestamp: new Date().toISOString() }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-lg overflow-hidden z-50">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">{t('liveChat.title')}</h3>
              <p className="text-sm text-white/80">{t('liveChat.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-orange-100' : 'bg-gray-100'}`}>
              {msg.type === 'user' ? <User className="w-5 h-5 text-orange-500" /> : <Bot className="w-5 h-5 text-gray-600" />}
            </div>
            <div className={`max-w-[70%] rounded-lg p-3 ${msg.type === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-70 mt-1 block">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('liveChat.placeholder')}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <button onClick={handleSend} className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;

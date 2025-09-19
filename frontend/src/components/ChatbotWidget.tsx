import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  theme?: 'light' | 'kerala';
  size?: 'small' | 'medium';
  className?: string;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ theme = 'kerala', size = 'small', className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sizeCfg = size === 'small' ? { h: 'h-56' } : { h: 'h-80' };

  useEffect(() => {
    setMessages([{ id: 'welcome', type: 'bot', content: "Hello! I'm your AI travel assistant. Ask me about budgets, activities, or local tips!", timestamp: new Date() }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type, content, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const msg = inputValue.trim();
    setInputValue('');
    addMessage(msg, 'user');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simple canned responses; can be extended to call ML endpoints or backend
      if (/budget|cost|price/i.test(msg)) {
        addMessage('To predict costs, make sure you set the trip location, days, and group size. Then use Predict Costs in Trip Overview.', 'bot');
      } else if (/activity|plan|do/i.test(msg)) {
        addMessage('Try adding activities in Trip Overview. You can also mark them Confirmed/Pending.', 'bot');
      } else if (/member|group/i.test(msg)) {
        addMessage('Use Travel Group to add/remove members and adjust roles.', 'bot');
      } else {
        addMessage("I'm here to help you plan your trip smartly. Ask me about expense planning, activities, or travel tips.", 'bot');
      }
    }, 800);
  };

  return (
    <div className={`rounded-2xl border ${theme === 'kerala' ? 'border-[hsl(180,20%,80%)] bg-[hsl(45,20%,98%)]' : 'border-gray-200 bg-white'} ${className}`}>
      <div className={`${theme === 'kerala' ? 'bg-gradient-to-r from-[hsl(15,85%,55%)] to-[hsl(25,80%,65%)]' : 'bg-blue-600'} text-white rounded-t-2xl p-2 px-3 text-sm font-semibold`}>
        Travel Assistant
      </div>
      <div ref={scrollRef} className={`${sizeCfg.h} overflow-y-auto p-3 space-y-2`}>
        {messages.map(m => (
          <div key={m.id} className={`max-w-[85%] ${m.type === 'user' ? 'ml-auto' : ''}`}>
            <div className={`px-3 py-2 text-sm rounded-xl shadow ${m.type === 'user' ? (theme === 'kerala' ? 'bg-[hsl(15,85%,55%)] text-white' : 'bg-blue-600 text-white') : (theme === 'kerala' ? 'bg-[hsl(40,35%,92%)] text-[hsl(25,50%,15%)]' : 'bg-gray-100 text-gray-900')}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="px-3 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 inline-block">Typing…</div>
        )}
      </div>
      <div className={`p-2 border-t ${theme === 'kerala' ? 'border-[hsl(180,20%,80%)]' : 'border-gray-200'}`}>
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Ask something..."
            className={`flex-1 px-3 py-2 text-sm ${theme === 'kerala' ? 'bg-gray-800 text-white rounded-full border border-[hsl(180,20%,80%)] focus:outline-none' : 'border rounded-md'}`}
          />
          <button onClick={handleSend} className={`${theme === 'kerala' ? 'bg-gradient-to-r from-[hsl(15,85%,55%)] to-[hsl(25,80%,65%)]' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-full px-3 text-sm`}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotWidget;

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
  apiUrl?: string; // optional backend URL for chatBot.py
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ theme = 'kerala', size = 'small', className = '', apiUrl }) => {
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

    const tryPost = async (url: string) => {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 3500);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg }),
          signal: ac.signal
        });
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();
        const reply = data.reply || data.message || data.text || JSON.stringify(data);
        return reply as string;
      } finally {
        clearTimeout(t);
      }
    };

    setIsTyping(true);
    try {
      const env = (import.meta as any).env || {};
      const candidates = [
        apiUrl,
        env?.VITE_CHATBOT_API,
        (env?.VITE_ML_API ? `${env.VITE_ML_API.replace(/\/$/, '')}/chatbot/query` : undefined),
        `${window.location.origin}/chatbot/query`
      ].filter(Boolean) as string[];

      let replied = false;
      for (const url of candidates) {
        try {
          const reply = await tryPost(url);
          addMessage(reply, 'bot');
          replied = true;
          break;
        } catch { /* try next */ }
      }

      if (!replied) {
        // Silent fallback responses based on intent
        if (/budget|cost|price/i.test(msg)) {
          addMessage('Budget tip: keep receipts using Scan bills. Set destination, days and people to plan.', 'bot');
        } else if (/activity|plan|do/i.test(msg)) {
          addMessage('Try “Suggested nearby” to add places to your plan for the day.', 'bot');
        } else if (/member|group/i.test(msg)) {
          addMessage('Use Travel Group to add or remove members.', 'bot');
        } else {
          addMessage('Got it! I will connect to the chatbot backend automatically when available.', 'bot');
        }
      }
    } finally {
      setIsTyping(false);
    }
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

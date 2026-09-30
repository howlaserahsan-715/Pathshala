import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'স্বাগতম! আমি আপনার "পাঠশালা" এআই টিউটর। বিসিএস, ব্যাংক জব কিংবা সরকারি চাকরির যেকোনো বিষয়ের কঠিন ডাউট, গণিতের শর্টকাট অথবা ব্যাকরণ সংক্রান্ত প্রশ্ন আমাকে নির্দ্বিধায় জিজ্ঞেস করতে পারেন।',
      timestamp: 'এখন'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'সমাস সহজে চেনার টেকনিক কী?',
    'সুদকষার জটিল অংকের সহজ সূত্র কী?',
    'সংবিধানের ৭০ অনুচ্ছেদ কেন বিতর্কিত?',
    'Subject-Verb Agreement এর প্রধান নিয়মগুলো কী?',
    'মাথাপিছু আয় ও জিডিপির পার্থক্য কী?',
  ];

  const handleSend = async (textToSend = input) => {
    const query = textToSend.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `আপনার প্রশ্নটির জন্য ধন্যবাদ! "${query}" বিষয়টি বিসিএস প্রিলিমিনারি ও লিখিত উভয় অংশের জন্যই গুরুত্বপূর্ণ। নিয়মিত রিভিশন ও মডেল টেস্ট প্র্যাকটিস অব্যাহত রাখুন।`,
        timestamp: 'এখন',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      audioEngine.stopSpeaking();
      setSpeakingId(null);
    } else {
      audioEngine.stopSpeaking();
      setSpeakingId(id);
      audioEngine.speakBangla(
        text.slice(0, 1000),
        1.0,
        () => setSpeakingId(null),
        () => setSpeakingId(null)
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    audioEngine.stopSpeaking();
    setSpeakingId(null);
    setMessages([
      {
        id: 'init-clean',
        sender: 'ai',
        text: 'চ্যাট হিস্টোরি ক্লিয়ার করা হয়েছে। নতুন কোনো প্রশ্ন থাকলে লিখুন!',
        timestamp: 'এখন'
      }
    ]);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                পাঠশালা এআই টিউটর
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                অনলাইন
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              বিসিএস, প্রাইমারি ও ব্যাংক পরীক্ষার যেকোনো বিষয়ের ডাউট সলভার
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="চ্যাট মুছুন"
          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  isAi
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-700 dark:bg-slate-600 text-white'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isAi
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                      : 'bg-indigo-600 text-white rounded-tr-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Sub Action Bar */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                  isAi ? 'justify-start' : 'justify-end'
                }`}>
                  <span>{msg.timestamp}</span>
                  {isAi && (
                    <>
                      <button
                        onClick={() => toggleSpeak(msg.id, msg.text)}
                        className="hover:text-indigo-600 flex items-center gap-1 transition"
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                        <span>{speakingId === msg.id ? 'থামান' : 'শুনুন'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-indigo-600 flex items-center gap-1 transition"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>এআই উত্তর বিশ্লেষণ করছে...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Composer Input */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 sm:p-2.5 flex items-center gap-2 shadow-xs shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="আপনার প্রশ্ন বা দ্বিধা লিখুন (যেমন: সমাসের নিয়ম, শতকরা শর্টকাট)..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">পাঠান</span>
        </button>
      </div>
    </div>
  );
};

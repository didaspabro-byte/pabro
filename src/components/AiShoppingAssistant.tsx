import React, { useState, useRef, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  ShoppingBag,
  Eye,
  RefreshCw,
  Mic,
  MicOff,
  Truck,
  ChevronRight,
  Gift,
  Zap,
  Sliders,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiShoppingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onOpenTrackOrder: () => void;
}

export default function AiShoppingAssistant({
  isOpen,
  onClose,
  products,
  cart,
  onAddToCart,
  onQuickView,
  onOpenTrackOrder,
}: AiShoppingAssistantProps) {
  const { formatPrice } = useCurrency();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "Hello! I'm **Aura**, your personal AI Shopping Advisor. How can I assist your shopping experience today? Ask me for gift ideas, product comparisons, budget picks, or delivery tracking!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Handle Speech Recognition setup if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
            console.warn('Microphone access not allowed or permission denied.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          products,
          cart,
        }),
      });

      const data = await res.json();
      const replyContent =
        data.reply || "I'm having trouble retrieving details right now, but feel free to browse our collection!";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content:
            "I ran into an issue connecting to my intelligence network. Please try again or ask me something else!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCartClick = (p: Product) => {
    onAddToCart(p);
    setAddedItemsMap((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItemsMap((prev) => ({ ...prev, [p.id]: false }));
    }, 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content:
          "Conversation reset! I'm Aura, your AI Shopping Advisor. What products or gifts can I help you find today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to parse text with markdown and [PRODUCT:id] embeds
  const renderFormattedMessage = (content: string) => {
    // Regex for [PRODUCT:prod_id] or [PRODUCT:1]
    const productTagRegex = /\[PRODUCT:([a-zA-Z0-9_-]+)\]/g;

    // Split text into lines or parts
    const parts = content.split(productTagRegex);

    // Extract product IDs referenced
    const matches: string[] = [];
    let match;
    const regexClone = new RegExp(productTagRegex);
    while ((match = regexClone.exec(content)) !== null) {
      if (match[1]) matches.push(match[1]);
    }

    // Filter products from catalog that matched
    const embeddedProducts = matches
      .map((id) => products.find((p) => p.id === id || p.id.toLowerCase() === id.toLowerCase()))
      .filter((p): p is Product => Boolean(p));

    // Simple text renderer with basic markdown bolding
    const renderMarkdownText = (text: string) => {
      const cleanText = text.replace(/\[PRODUCT:[a-zA-Z0-9_-]+\]/g, '');
      const lines = cleanText.split('\n');

      return lines.map((line, lineIdx) => {
        // Process bolding **text**
        const boldParts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={lineIdx} className={line.trim().startsWith('•') ? 'pl-2 my-0.5' : 'my-1'}>
            {boldParts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-extrabold text-slate-900 dark:text-white">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </div>
        );
      });
    };

    return (
      <div className="space-y-3">
        <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
          {renderMarkdownText(content)}
        </div>

        {/* Embedded Interactive Product Cards */}
        {embeddedProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Featured Items:
            </span>
            {embeddedProducts.map((p) => {
              const isJustAdded = addedItemsMap[p.id];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <img
                    src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    className="h-12 w-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80';
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {p.name}
                    </h5>
                    <p className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onQuickView(p)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-bold"
                      title="Quick View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCartClick(p)}
                      className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 transition-all shadow-sm ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3 w-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const quickPrompts = [
    { icon: Gift, label: '🎁 Gift ideas under $150', query: 'Show me great gift recommendations under $150' },
    { icon: Zap, label: '⚡ Top tech & workspace', query: 'What are the best minimalist tech and workspace items?' },
    { icon: Sliders, label: '🎧 Audio & headphones', query: 'Compare the available headphones and audio devices' },
    { icon: Truck, label: '📦 How to track my order?', query: 'How do I check my order status and delivery updates?' },
  ];

  if (!isOpen) return null;

  return (
    <div
      id="ai-shopping-assistant-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col font-sans transition-all animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <Sparkles className="h-5 w-5 animate-pulse text-indigo-300" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black tracking-tight text-white">Aura AI Advisor</h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Gemini 3.6
              </span>
            </div>
            <p className="text-[10px] text-slate-300">Personal Shopping Stylist & Catalog Guide</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Chat"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`max-w-[82%] space-y-1 ${isUser ? 'items-end text-right' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-3xl shadow-sm text-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  ) : (
                    renderFormattedMessage(msg.content)
                  )}
                </div>
                <span className="block text-[9px] text-slate-400 px-1">{msg.timestamp}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-3xl rounded-tl-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 block">
          Quick Shopping Inquiries
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qp.query)}
              className="shrink-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-3 py-1.5 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {recognitionRef.current && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-indigo-600'
              }`}
              title={isListening ? 'Listening...' : 'Voice Search'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Ask Aura about products, gifts, specs...'}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

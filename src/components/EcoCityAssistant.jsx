import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { sendEcoCityChatMessage } from '../services/ecoCityChatService';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Sprout,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function EcoCityAssistant() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ecocity_assistant_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentLang = i18n.language?.startsWith('hi') ? 'hi' : 'en';

  // 5 Prescribed Suggested Prompts
  const suggestedPrompts = currentLang === 'hi'
    ? [
        "इकोसिटी हब क्या है?",
        "कार्बन फुटप्रिंट की गणना कैसे करें?",
        "ग्रीन स्कोर कैसे बढ़ाएं?",
        "पादप स्वास्थ्य परीक्षण के बारे में बताएं",
        "जलवायु परिवर्तन को सरल शब्दों में समझाएं"
      ]
    : [
        "What is EcoCity Hub?",
        "How do I calculate my carbon footprint?",
        "How can I improve my Green Score?",
        "Tell me about plant health checking.",
        "Explain climate change."
      ];

  // Save history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('ecocity_assistant_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll to bottom on message updates or typing state
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Initial welcome message prescribed by requirements
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeContent = currentLang === 'hi'
        ? `नमस्ते! मैं **इकोसिटी असिस्टेंट (EcoCity Assistant)** हूँ 🌱\n\nमैं आपको इकोसिटी हब के फीचर्स समझने, पर्यावरणीय अवधारणाओं को जानने और आपके रोजमर्रा के सवालों के जवाब देने के लिए यहाँ हूँ।\n\nआप मुझसे **English, Hindi (हिंदी), या Hinglish** में बात कर सकते हैं। आप क्या जानना चाहते हैं?`
        : `Hi! I'm **EcoCity Assistant** 🌱\n\nI'm here to help you explore EcoCity Hub, understand environmental concepts, and answer your everyday questions.\n\nYou can talk to me in **English, Hindi, or Hinglish**. What would you like to know?`;

      const initialMessage = {
        id: 'welcome-msg',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMessage]);
    }
  }, [currentLang, messages.length]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    setInputValue('');
    setLastFailedMessage(null);

    const userMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const userContext = {
        userName: user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : null),
        city: user?.user_metadata?.city || 'Jaipur',
        state: user?.user_metadata?.state || 'Rajasthan',
        isDemo: Boolean(user?.user_metadata?.is_demo)
      };

      const response = await sendEcoCityChatMessage({
        message: text,
        history: newMessages.map(m => ({ role: m.role, content: m.content })),
        language: currentLang,
        userContext
      });

      const assistantMessage = {
        id: 'bot-' + (Date.now() + 1),
        role: 'assistant',
        content: response.reply,
        source: response.source,
        model: response.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat processing error:', err);
      setLastFailedMessage(text);
      const errorMessage = {
        id: 'err-' + (Date.now() + 1),
        role: 'assistant',
        content: currentLang === 'hi'
          ? 'क्षमा करें, संदेश प्रोसेस करने में समस्या आई। कृपया पुनः प्रयास करें।'
          : "I'm having trouble connecting to the service right now. Please check your connection and try again.",
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    sessionStorage.removeItem('ecocity_assistant_history');
    setMessages([]);
    setShowClearConfirm(false);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parses markdown links like [Title](/path) to internal router pills
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Split by markdown link pattern [text](url)
    const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);

    return parts.map((part, index) => {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const linkText = match[1];
        const linkUrl = match[2];

        // Internal app route
        if (linkUrl.startsWith('/')) {
          return (
            <button
              key={index}
              onClick={() => {
                navigate(linkUrl);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 my-0.5 mx-1 rounded-lg text-xs font-semibold bg-eco-100 hover:bg-eco-200 dark:bg-eco-900/60 dark:hover:bg-eco-800 text-eco-950 dark:text-eco-100 transition-colors border border-eco-300 dark:border-eco-700 shadow-xs"
            >
              <span>{linkText}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          );
        }

        return (
          <a
            key={index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-eco-700 dark:text-eco-300 underline font-medium"
          >
            {linkText}
          </a>
        );
      }

      // Format bold text **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        const bMatch = bPart.match(/^\*\*([^*]+)\*\*$/);
        if (bMatch) {
          return <strong key={`${index}-${bIdx}`} className="font-bold text-stone-900 dark:text-stone-100">{bMatch[1]}</strong>;
        }
        return bPart;
      });
    });
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open EcoCity Assistant"
            className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-eco-950 via-eco-900 to-eco-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-eco-300/40 focus:outline-none"
          >
            {/* Live pulsing online indicator */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-dark-bg"></span>
            </span>

            <Sprout className="w-7 h-7 sm:w-8 sm:h-8 text-eco-200 group-hover:rotate-12 transition-transform" />

            {/* Hover Tooltip (Desktop) */}
            <span className="hidden md:inline-block absolute right-full mr-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900/90 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              EcoCity Assistant 🌱 • Ask me anything!
            </span>
          </button>
        </div>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[420px] sm:max-w-[calc(100vw-2.5rem)] h-[100dvh] sm:h-[630px] sm:max-h-[85vh] bg-white dark:bg-dark-card rounded-none sm:rounded-3xl shadow-2xl flex flex-col border border-eco-200 dark:border-dark-border overflow-hidden transition-all duration-300">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-eco-950 via-eco-900 to-eco-800 text-white px-4 py-3.5 flex items-center justify-between border-b border-eco-700/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-eco-800 border border-eco-600/40 flex items-center justify-center shadow-inner">
                <Sprout className="w-5 h-5 text-emerald-300" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-eco-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">EcoCity Assistant</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-eco-300 font-medium">
                  Official AI Guide • English & हिंदी
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear Chat Button */}
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 rounded-lg text-eco-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear Conversation"
                aria-label="Clear Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-eco-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clear Confirmation Prompt */}
          {showClearConfirm && (
            <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shrink-0">
              <span>Start a new conversation?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="px-2.5 py-1 rounded-md font-bold bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 rounded-md text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-eco-50/50 dark:bg-dark-bg/60">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-eco-900 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Sprout className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`relative px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                        isAssistant
                          ? msg.isError
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-sm'
                            : 'bg-white dark:bg-dark-card text-stone-800 dark:text-dark-text border border-eco-200 dark:border-dark-border rounded-tl-sm'
                          : 'bg-eco-900 text-white rounded-tr-sm'
                      }`}
                    >
                      {renderFormattedContent(msg.content)}

                      {/* Error retry option */}
                      {msg.isError && lastFailedMessage && (
                        <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
                          <span className="text-[11px] text-rose-600 dark:text-rose-400">Request could not be delivered</span>
                          <button
                            onClick={() => handleSendMessage(lastFailedMessage)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        </div>
                      )}

                      {/* Bottom status and copy option */}
                      {isAssistant && !msg.isError && (
                        <div className="mt-2 pt-2 border-t border-eco-100 dark:border-dark-border/60 flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-400">
                          <span className="italic">
                            {msg.model || 'EcoCity AI'}
                          </span>
                          <button
                            onClick={() => handleCopy(msg.content, index)}
                            className="inline-flex items-center gap-1 hover:text-eco-700 dark:hover:text-eco-300"
                            title="Copy reply"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-eco-200 dark:bg-eco-800 text-eco-900 dark:text-eco-100 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Animation */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-eco-900 text-emerald-300 flex items-center justify-center shrink-0">
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-eco-600 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-eco-600 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-eco-600 animate-bounce"></span>
                  <span className="text-xs text-stone-500 dark:text-dark-muted ml-2">EcoCity Assistant is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Clickable Prompts (Prescribed by Section 4.3) */}
          <div className="p-2.5 bg-white dark:bg-dark-card border-t border-eco-100 dark:border-dark-border/80 shrink-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-1 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-eco-600" />
              <span>Suggested Prompts</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestedPrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(promptText)}
                  disabled={isTyping}
                  className="shrink-0 text-xs px-2.5 py-1.5 rounded-full bg-eco-100/70 dark:bg-dark-bg text-eco-950 dark:text-dark-text border border-eco-200 dark:border-dark-border hover:bg-eco-200 dark:hover:bg-eco-900/40 hover:border-eco-400 transition-all font-medium whitespace-nowrap active:scale-95 disabled:opacity-50 shadow-xs"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Area */}
          <div className="p-3 bg-white dark:bg-dark-card border-t border-eco-200 dark:border-dark-border shrink-0">
            <div className="relative flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentLang === 'hi' ? "इकोसिटी असिस्टेंट से कुछ भी पूछें..." : "Ask EcoCity Assistant in English, हिंदी, or Hinglish..."}
                disabled={isTyping}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-eco-50 dark:bg-dark-bg border border-eco-200 dark:border-dark-border text-xs sm:text-sm text-stone-900 dark:text-dark-text placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-eco-500 transition-all disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-1.5 p-2 rounded-xl bg-eco-900 hover:bg-eco-950 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                title="Send Message"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-dark-muted px-2 pt-1.5">
              <span>Press Enter to send</span>
              <span>English • Hindi • Hinglish</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}

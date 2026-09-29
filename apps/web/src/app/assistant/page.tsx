'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send, Snowflake, BookOpen, ExternalLink, RefreshCw,
  MessageSquare, Lightbulb, Search, Loader2, User
} from 'lucide-react';
import { assistantApi } from '@/lib/api';

const SUGGESTED_QUESTIONS = [
  'What research was conducted during the 44th Indian Antarctic Expedition?',
  'What is the purpose of Bharati Research Station?',
  'Which expeditions studied Antarctic oceanography?',
  'What climate datasets are available from NCPOR?',
  'How is India contributing to polar science globally?',
  'What species were discovered near Prydz Bay?',
];

interface Source {
  index: number;
  document_id: string;
  document_title: string;
  page_number?: number;
  source_url?: string;
  chunk_text: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  latency_ms?: number;
  chunks_used?: number;
  model?: string;
  timestamp: Date;
}

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialQ) {
      handleSend(initialQ);
    }
  }, []);

  const handleSend = async (q?: string) => {
    const question = q || input.trim();
    if (!question || loading) return;

    setInput('');
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await assistantApi.query(question, sessionId);
      const data = res.data;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        latency_ms: data.latency_ms,
        chunks_used: data.chunks_used,
        model: data.model,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error processing your question. Please try again or check your connection to the API server.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-polar-frost flex flex-col pt-16">
      {/* Header */}
      <div className="bg-polar-navy border-b border-white/8 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-polar-cyan to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Snowflake size={24} className="text-white" />
            </div>
            <div>
              <div className="section-label-dark section-label mb-1">
                <MessageSquare size={12} />
                RAG-powered · NCPOR Knowledge Base
              </div>
              <h1 className="font-display font-bold text-3xl text-white">Ask Polar AI</h1>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AI Active
            </div>
          </div>
          <p className="text-white/50 mt-3 max-w-2xl">
            Explore NCPOR&apos;s scientific knowledge using natural language. Answers are grounded in expedition reports, publications, and research papers.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col gap-4">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-polar-navy rounded-2xl flex items-center justify-center mb-5">
              <MessageSquare size={28} className="text-polar-cyan" />
            </div>
            <h2 className="font-display font-bold text-2xl text-polar-navy mb-2">
              Ask about Indian Polar Research
            </h2>
            <p className="text-slate-500 text-center max-w-md mb-8">
              Ask any question about NCPOR&apos;s expeditions, research stations, datasets, or scientific findings. I&apos;ll search the knowledge base and provide cited answers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="flex items-start gap-3 p-4 bg-white hover:bg-polar-frost border border-slate-200 hover:border-polar-cyan/30 rounded-xl text-left text-sm text-slate-600 hover:text-polar-navy transition-all group"
                >
                  <Lightbulb size={14} className="text-polar-cyan mt-0.5 shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex-1 space-y-6 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-polar-navy'
                    : 'bg-gradient-to-br from-polar-cyan to-teal-400'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Snowflake size={14} className="text-white" />
                  }
                </div>

                <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                  {/* Message bubble */}
                  <div className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none text-slate-700">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="w-full bg-white border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <BookOpen size={12} />
                        Sources ({msg.sources.length})
                      </div>
                      <div className="space-y-2">
                        {msg.sources.map((source) => (
                          <div key={source.index} className="citation-box">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-polar-cyan text-white text-xs font-bold rounded mr-2">
                                  {source.index}
                                </span>
                                <span className="font-semibold text-polar-navy text-sm">
                                  {source.document_title}
                                </span>
                                {source.page_number && (
                                  <span className="text-slate-400 text-xs ml-2">
                                    Page {source.page_number}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 shrink-0">
                                {source.document_id && (
                                  <Link
                                    href={`/repository/${source.document_id}`}
                                    className="text-xs text-polar-cyan hover:underline flex items-center gap-1"
                                  >
                                    View <ExternalLink size={10} />
                                  </Link>
                                )}
                                {source.source_url && (
                                  <a
                                    href={source.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-400 hover:text-polar-cyan flex items-center gap-1"
                                  >
                                    Original <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                              {source.chunk_text}
                            </p>
                          </div>
                        ))}
                      </div>

                      {msg.latency_ms && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
                          <span>⏱ {msg.latency_ms}ms</span>
                          {msg.chunks_used && <span>📄 {msg.chunks_used} chunks</span>}
                          {msg.model && <span>🤖 {msg.model}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-polar-cyan to-teal-400 flex items-center justify-center shrink-0">
                  <Snowflake size={14} className="text-white" />
                </div>
                <div className="chat-message-ai">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    Searching knowledge base and generating answer...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-3">
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-1">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 bg-polar-frost border border-slate-200 hover:border-polar-cyan/40 text-slate-500 hover:text-polar-navy rounded-full transition-all"
                >
                  {q.slice(0, 50)}...
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about polar expeditions, research stations, datasets, or scientific findings..."
              rows={1}
              className="flex-1 resize-none outline-none text-sm text-slate-700 placeholder-slate-400 leading-relaxed py-2 px-2 min-h-[40px] max-h-[120px]"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center w-10 h-10 bg-polar-cyan hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all shrink-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-2">
            <p className="text-xs text-slate-400">
              Answers grounded in NCPOR knowledge repository · Press Enter to send
            </p>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RefreshCw size={10} /> New chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="animate-spin text-polar-cyan" size={24} />
            <span>Loading Polar AI Assistant...</span>
          </div>
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}

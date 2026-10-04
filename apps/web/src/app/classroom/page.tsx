'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play, BookOpen, HelpCircle, CheckCircle, XCircle,
  MessageSquare, ArrowRight, Clock, Snowflake, RefreshCw
} from 'lucide-react';
import { classroomApi } from '@/lib/api';

interface Topic {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category?: string;
  hero_image_url?: string;
  reading_time_minutes?: number;
  order_index: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  difficulty: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  climate: 'from-rose-500 to-orange-400',
  glaciology: 'from-sky-500 to-blue-600',
  oceanography: 'from-teal-500 to-cyan-600',
  expeditions: 'from-amber-500 to-yellow-500',
  atmospheric: 'from-purple-500 to-indigo-600',
  biology: 'from-green-500 to-emerald-600',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  climate: '🌡️',
  glaciology: '🏔️',
  oceanography: '🌊',
  expeditions: '🚢',
  atmospheric: '🌌',
  biology: '🦭',
};

export default function ClassroomPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizTopic, setQuizTopic] = useState<Topic | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    classroomApi.listTopics()
      .then(r => setTopics(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startQuiz = async (topic: Topic) => {
    try {
      const res = await classroomApi.getQuiz(topic.slug);
      setQuiz(res.data);
      setQuizTopic(topic);
      setAnswers({});
      setSubmitted(false);
    } catch (e) {
      console.error(e);
    }
  };

  const score = submitted
    ? quiz.filter(q => answers[q.id] === q.correct_answer_index).length
    : 0;

  return (
    <div className="min-h-screen bg-polar-frost pt-16">
      {/* Header */}
      <div className="py-16" style={{ background: '#0a1628' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="section-label-dark section-label mb-4">
            <BookOpen size={12} />
            Polar Classroom
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-3">
            Learn the Science of the Poles
          </h1>
          <p className="text-white/60 text-xl max-w-2xl">
            Educational content on glaciology, oceanography, climate change, and India&apos;s polar expeditions. Complete with quizzes and AI explanations.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-8 py-12">
        {/* Topics Grid */}
        {!quizTopic && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-64">
                    <div className="h-32 skeleton rounded-t-xl" />
                    <div className="p-5 space-y-2">
                      <div className="w-3/4 h-5 skeleton" />
                      <div className="w-full h-4 skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic) => {
                  const gradient = CATEGORY_COLORS[topic.category || ''] || 'from-polar-navy to-polar-navy-700';
                  const emoji = CATEGORY_EMOJIS[topic.category || ''] || '❄️';

                  return (
                    <div key={topic.id} className="card overflow-hidden group hover-lift flex flex-col">
                      {/* Hero */}
                      <div className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden`}>
                        {topic.hero_image_url && (
                          <img
                            src={topic.hero_image_url}
                            alt={topic.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <div className="text-4xl mb-1">{emoji}</div>
                        </div>
                        {topic.reading_time_minutes && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            <Clock size={10} />
                            {topic.reading_time_minutes} min read
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <h2 className="font-display font-bold text-xl text-polar-navy mb-2 group-hover:text-polar-cyan transition-colors">
                          {topic.title}
                        </h2>
                        {topic.subtitle && (
                          <p className="text-slate-500 text-sm mb-4 line-clamp-2">{topic.subtitle}</p>
                        )}

                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                          <Link
                            href={`/classroom/${topic.slug}`}
                            className="flex-1 h-10 flex items-center justify-center gap-2 px-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-sky-500/20"
                            style={{ color: '#ffffff' }}
                          >
                            <Play size={13} className="text-white fill-white shrink-0" />
                            <span style={{ color: '#ffffff' }}>Learn</span>
                          </Link>
                          <button
                            onClick={() => startQuiz(topic)}
                            className="flex-1 h-10 flex items-center justify-center gap-1.5 px-3 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-700 border border-sky-200/80 rounded-xl text-xs font-bold transition-all"
                            style={{ color: '#0369a1' }}
                          >
                            <HelpCircle size={14} className="text-sky-600 shrink-0" />
                            <span style={{ color: '#0369a1' }}>Quiz</span>
                          </button>
                          <Link
                            href={`/assistant?q=${encodeURIComponent('Tell me about ' + topic.title + ' in polar regions')}`}
                            className="h-10 w-10 shrink-0 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 rounded-xl transition-all"
                            style={{ color: '#475569' }}
                            title="Ask AI"
                          >
                            <MessageSquare size={14} className="text-slate-600 shrink-0" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Quiz Mode */}
        {quizTopic && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold text-polar-cyan uppercase tracking-widest mb-1">Quiz</div>
                <h2 className="font-display font-bold text-2xl text-polar-navy">{quizTopic.title}</h2>
              </div>
              <button
                onClick={() => setQuizTopic(null)}
                className="btn-ghost border border-slate-200 text-sm"
              >
                Back to Topics
              </button>
            </div>

            {!submitted ? (
              <div className="space-y-5">
                {quiz.map((q, qi) => (
                  <div key={q.id} className="card p-6">
                    <div className="font-display font-bold text-polar-navy mb-4">
                      <span className="text-polar-cyan mr-2">Q{qi + 1}.</span>
                      {q.question}
                    </div>
                    <div className="space-y-2.5">
                      {q.options.map((option, oi) => (
                        <button
                          key={oi}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm ${
                            answers[q.id] === oi
                              ? 'border-polar-cyan bg-polar-cyan/8 text-polar-navy font-semibold'
                              : 'border-slate-200 hover:border-polar-cyan/40 text-slate-600'
                          }`}
                        >
                          <span className="font-bold mr-2 text-polar-cyan">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(answers).length < quiz.length}
                  className="btn-primary w-full py-4 text-base justify-center disabled:opacity-50"
                >
                  Submit Answers ({Object.keys(answers).length}/{quiz.length} answered)
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Score card */}
                <div className={`card p-8 text-center border-2 ${
                  score >= quiz.length * 0.8 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                }`}>
                  <div className="text-5xl mb-4">
                    {score >= quiz.length * 0.8 ? '🎉' : score >= quiz.length * 0.6 ? '👍' : '📚'}
                  </div>
                  <div className="font-display font-bold text-3xl text-polar-navy mb-1">
                    Your Score: {score}/{quiz.length}
                  </div>
                  <div className="text-slate-500 mb-6">
                    {score === quiz.length ? 'Perfect! Outstanding knowledge!' :
                     score >= quiz.length * 0.8 ? 'Excellent! Great understanding.' :
                     score >= quiz.length * 0.6 ? 'Good! Keep exploring.' :
                     'Keep learning! You\'ll get there.'}
                  </div>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => { setAnswers({}); setSubmitted(false); }}
                      className="btn-secondary"
                    >
                      <RefreshCw size={14} />
                      Retry
                    </button>
                    <Link href={`/classroom/${quizTopic.slug}`} className="btn-primary">
                      <BookOpen size={14} />
                      Study Topic
                    </Link>
                    <Link
                      href={`/assistant?q=${encodeURIComponent('Explain ' + quizTopic.title + ' in detail')}`}
                      className="btn-ghost border border-slate-200"
                    >
                      <MessageSquare size={14} />
                      Ask AI
                    </Link>
                  </div>
                </div>

                {/* Answers review */}
                <div className="space-y-4">
                  {quiz.map((q, qi) => {
                    const userAnswer = answers[q.id];
                    const isCorrect = userAnswer === q.correct_answer_index;
                    return (
                      <div key={q.id} className={`card p-5 border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-400'}`}>
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect
                            ? <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                            : <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                          }
                          <div className="font-semibold text-polar-navy text-sm">
                            Q{qi + 1}. {q.question}
                          </div>
                        </div>
                        <div className="ml-7 space-y-1.5">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={`text-sm px-3 py-2 rounded-lg ${
                                oi === q.correct_answer_index
                                  ? 'bg-green-100 text-green-800 font-semibold'
                                  : oi === userAnswer && !isCorrect
                                  ? 'bg-red-100 text-red-700'
                                  : 'text-slate-500'
                              }`}
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                            </div>
                          ))}
                          {q.explanation && (
                            <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg">
                              💡 {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

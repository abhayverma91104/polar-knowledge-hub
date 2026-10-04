'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  BookOpen, Clock, ArrowLeft, CheckCircle2,
  XCircle, Award, RotateCcw, ChevronRight, HelpCircle, MessageSquare
} from 'lucide-react';
import { classroomApi } from '@/lib/api';

interface QuizItem {
  id?: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

interface TopicDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  content: string;
  reading_time_minutes: number;
  quizzes?: QuizItem[];
}

export default function TopicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    classroomApi.getTopic(resolvedParams.slug)
      .then((res) => {
        setTopic(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load topic:', err);
        setLoading(false);
      });
  }, [resolvedParams.slug]);

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    if (!topic?.quizzes) return 0;
    let correct = 0;
    topic.quizzes.forEach((q, i) => {
      if (userAnswers[i] === q.correct_answer_index) correct++;
    });
    return correct;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#006194] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant font-mono text-sm">Preparing educational module...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center max-w-md p-8 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-md">
          <h2 className="text-xl font-bold text-on-surface mb-2">Lesson Not Found</h2>
          <p className="text-on-surface-variant text-sm mb-6">The requested classroom topic could not be located.</p>
          <Link
            href="/classroom"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Classroom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-surface text-on-surface transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-[#006194] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/classroom" className="hover:text-[#006194] transition-colors">Classroom</Link>
          <span>/</span>
          <span className="text-[#006194] dark:text-sky-400 capitalize font-mono">{topic.category}</span>
        </div>

        {/* Topic Header Card */}
        <div className="p-8 sm:p-10 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm mb-8 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#cce5ff] text-[#004b73] dark:bg-sky-950 dark:text-sky-300 text-xs font-bold uppercase tracking-wider font-mono">
              {topic.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono">
              <Clock size={13} />
              <span>{topic.reading_time_minutes} min read</span>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface mb-4 leading-tight">
            {topic.title}
          </h1>

          <p className="text-on-surface-variant text-base leading-relaxed">
            {topic.subtitle}
          </p>
        </div>

        {/* Lesson Markdown Content */}
        <div className="p-8 sm:p-10 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm mb-8 max-w-none transition-colors">
          <div className="text-on-surface text-base leading-relaxed space-y-6">
            {topic.content ? (
              topic.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-on-surface-variant/70 italic">Curriculum content for this topic is being synchronized with the NCPOR education wing.</p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[#bfc7d2]/30 dark:border-white/10 flex items-center justify-between">
            <Link
              href={`/assistant?q=Explain ${encodeURIComponent(topic.title)} for high school students`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#006194] dark:text-sky-400 hover:underline transition-colors"
            >
              <MessageSquare size={14} /> Ask Polar AI to explain this in simpler terms
            </Link>
          </div>
        </div>

        {/* Interactive Lesson Quiz */}
        {topic.quizzes && topic.quizzes.length > 0 && (
          <div className="p-8 sm:p-10 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 bg-white dark:bg-[#0a1628] shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display font-bold text-xl text-on-surface flex items-center gap-2">
                  <HelpCircle size={20} className="text-[#006194] dark:text-sky-400" />
                  <span>Module Knowledge Check</span>
                </h2>
                <p className="text-on-surface-variant text-xs mt-1">Test your understanding with these practice questions.</p>
              </div>

              {showResults && (
                <div className="px-4 py-2 rounded-xl bg-[#cce5ff] text-[#004b73] dark:bg-sky-950 dark:text-sky-300 border border-[#006194]/30 text-xs font-bold font-mono">
                  Score: {calculateScore()} / {topic.quizzes.length}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {topic.quizzes.map((q, qIdx) => (
                <div key={qIdx} className="p-5 rounded-xl border border-[#bfc7d2]/30 dark:border-white/10 bg-[#ebf5ff] dark:bg-[#0c1c30]">
                  <p className="text-on-surface font-semibold text-sm mb-4">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[qIdx] === optIdx;
                      const isCorrect = optIdx === q.correct_answer_index;
                      let btnClasses = isSelected
                        ? 'bg-[#cce5ff] dark:bg-sky-950/60 border-[#006194] text-[#006194] dark:text-sky-300'
                        : 'bg-white/80 dark:bg-white/5 border-[#bfc7d2]/40 dark:border-white/10 text-on-surface hover:bg-[#ebf5ff] dark:hover:bg-white/10';

                      if (showResults) {
                        if (isCorrect) {
                          btnClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300';
                        } else if (isSelected && !isCorrect) {
                          btnClasses = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={showResults}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`w-full text-left p-3.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${btnClasses}`}
                        >
                          <span>{opt}</span>
                          {showResults && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                          {showResults && isSelected && !isCorrect && <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="mt-3 p-3 rounded-lg bg-white/70 dark:bg-white/5 border border-[#bfc7d2]/30 dark:border-white/10 text-xs text-on-surface-variant">
                      <span className="font-bold text-[#006194] dark:text-sky-400">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#bfc7d2]/30 dark:border-white/10 flex items-center justify-between">
              {!showResults ? (
                <button
                  disabled={Object.keys(userAnswers).length === 0}
                  onClick={() => setShowResults(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] disabled:opacity-40 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setShowResults(false);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#bfc7d2]/50 dark:border-white/15 text-on-surface text-xs font-semibold hover:bg-[#ebf5ff] dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} /> Retake Quiz
                </button>
              )}

              <Link
                href="/classroom"
                className="text-xs text-on-surface-variant hover:text-[#006194] transition-colors"
              >
                Back to All Lessons →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

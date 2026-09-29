'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  GraduationCap, BookOpen, Clock, ArrowLeft, CheckCircle2,
  XCircle, Award, RotateCcw, ChevronRight, Snowflake
} from 'lucide-react';
import { classroomApi } from '@/lib/api';

interface QuizItem {
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
      .catch(() => {
        // Fallback default
        setTopic({
          id: '1',
          slug: resolvedParams.slug,
          title: 'Glaciers & Ice Sheets: The Frozen Archives',
          subtitle: 'Understanding the mass balance and ancient climate records of the poles',
          category: 'glaciology',
          reading_time_minutes: 8,
          content: `## What Are Glaciers?

Glaciers are massive rivers of compacted ice that form over thousands of years. They cover approximately 10% of Earth's land surface and store nearly 69% of the world's freshwater.

### The Antarctic Ice Sheet
The Antarctic Ice Sheet is the largest single mass of ice on Earth, covering 14 million km². If completely melted, it holds enough freshwater to raise global sea levels by approximately 58 meters.

### How Indian Polar Scientists Study Glaciers
Researchers from NCPOR at Bharati and Maitri stations utilize:
1. **Differential GPS Networks**: Measuring surface ice velocity (moving 1 to 10 meters per year).
2. **Deep Ice Core Coring**: Extracting ancient cylindrical ice samples trapping ancient atmospheric gases.
3. **Ground Penetrating Radar (GPR)**: Mapping subglacial topography and bedrock depth beneath hundreds of meters of ice.`,
          quizzes: [
            {
              question: 'Approximately what percentage of the world’s freshwater is stored in glaciers and ice sheets?',
              options: ['25%', '50%', '69%', '90%'],
              correct_answer_index: 2,
              explanation: 'Glaciers and ice sheets hold approximately 69% of Earth’s freshwater, with the majority located in the Antarctic Ice Sheet.',
            },
            {
              question: 'If the entire Antarctic Ice Sheet were to melt, how much would global sea levels rise?',
              options: ['5 meters', '18 meters', '58 meters', '120 meters'],
              correct_answer_index: 2,
              explanation: 'The volume of ice in Antarctica would raise global sea levels by approximately 58 meters.',
            },
            {
              question: 'What instrument is used by glaciologists to map the rock topography hidden beneath deep ice?',
              options: ['Barometer', 'Ground Penetrating Radar (GPR)', 'Pyranometer', 'Anemometer'],
              correct_answer_index: 1,
              explanation: 'Ground Penetrating Radar sends electromagnetic pulses that reflect off subglacial bedrock, revealing the ice thickness and topography.',
            },
          ],
        });
        setLoading(false);
      });
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060e1c] flex items-center justify-center pt-20">
        <div className="text-center text-slate-400">
          <Snowflake size={32} className="text-cyan-400 animate-spin-slow mx-auto mb-3" />
          <p>Loading Classroom Topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) return null;

  const score = Object.entries(userAnswers).filter(
    ([qIdx, ansIdx]) => topic.quizzes && topic.quizzes[Number(qIdx)].correct_answer_index === ansIdx
  ).length;

  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/classroom"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 mb-8 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Polar Classroom</span>
        </Link>

        {/* Topic Header */}
        <div className="p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0c2242] via-[#081528] to-[#040914] shadow-2xl mb-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
            <GraduationCap size={15} />
            <span>Interactive Learning Module · {topic.category}</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4 leading-tight">
            {topic.title}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light mb-6">
            {topic.subtitle}
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-cyan-400" />
              <span>{topic.reading_time_minutes} min read</span>
            </div>
            <div>·</div>
            <div>{topic.quizzes?.length || 0} Quiz Questions</div>
          </div>
        </div>

        {/* Topic Article Content */}
        <article className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 mb-12">
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
            {topic.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={i} className="font-display font-bold text-2xl text-white pt-4 pb-2 border-b border-white/10">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={i} className="font-display font-bold text-xl text-cyan-300 pt-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              return (
                <p key={i} className="text-base text-slate-300 font-light leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </article>

        {/* Interactive Knowledge Quiz */}
        {topic.quizzes && topic.quizzes.length > 0 && (
          <div className="p-8 sm:p-10 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0a1b32] to-[#040810] shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Award size={20} className="text-cyan-400" />
                <h2 className="font-display font-bold text-xl text-white">
                  Knowledge Check Quiz
                </h2>
              </div>
              {showResults && (
                <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                  Score: {score} / {topic.quizzes.length}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {topic.quizzes.map((quiz, qIdx) => {
                const selectedOption = userAnswers[qIdx];
                return (
                  <div key={qIdx} className="space-y-3">
                    <p className="font-semibold text-sm sm:text-base text-white">
                      {qIdx + 1}. {quiz.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {quiz.options.map((option, optIdx) => {
                        let btnStyle = 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10';
                        if (selectedOption === optIdx) {
                          btnStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-200';
                        }
                        if (showResults) {
                          if (optIdx === quiz.correct_answer_index) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-semibold';
                          } else if (selectedOption === optIdx && selectedOption !== quiz.correct_answer_index) {
                            btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-200';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={showResults}
                            onClick={() => setUserAnswers({ ...userAnswers, [qIdx]: optIdx })}
                            className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all ${btnStyle}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-300 mt-2">
                        <span className="font-bold text-cyan-400">Explanation: </span>
                        {quiz.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              {!showResults ? (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(userAnswers).length < topic.quizzes.length}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all ml-auto"
                >
                  Submit Quiz Answers
                </button>
              ) : (
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setShowResults(false);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors ml-auto"
                >
                  <RotateCcw size={14} />
                  <span>Try Again</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

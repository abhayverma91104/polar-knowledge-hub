'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, FileText, Link as LinkIcon, Camera, Share2, Video,
  MessageCircle, BookOpen, HelpCircle, Loader2, Check, Edit3,
  AlertCircle, Sparkles, ChevronDown, Database, Globe
} from 'lucide-react';
import { documentsApi, expeditionsApi, contentApi, assistantApi } from '@/lib/api';
import { MarkdownRenderer } from '@/components/markdown-renderer';

const CONTENT_TYPES = [
  { id: 'summary', label: 'Scientific Summary', icon: FileText, description: '150-200 word summary', color: 'text-blue-500 bg-blue-50' },
  { id: 'article', label: 'Public Article', icon: Globe, description: '~500 word article', color: 'text-emerald-500 bg-emerald-50' },
  { id: 'student', label: 'Student Explanation', icon: BookOpen, description: 'Simple school-level explanation', color: 'text-purple-500 bg-purple-50' },
  { id: 'linkedin', label: 'LinkedIn Post', icon: Share2, description: 'Professional social post', color: 'text-sky-600 bg-sky-50' },
  { id: 'twitter', label: 'X / Tweet Thread', icon: MessageCircle, description: 'Thread of 3-4 tweets', color: 'text-slate-700 bg-slate-50' },
  { id: 'instagram', label: 'Instagram Caption', icon: Camera, description: 'Caption with hashtags', color: 'text-pink-500 bg-pink-50' },
  { id: 'youtube', label: 'YouTube Description', icon: Video, description: 'Title, description, tags', color: 'text-red-500 bg-red-50' },
  { id: 'quiz', label: 'Quiz Questions', icon: HelpCircle, description: '5 MCQs with answers', color: 'text-amber-500 bg-amber-50' },
];

interface Document {
  id: string;
  title: string;
  document_type: string;
  year?: number;
}

interface Expedition {
  id: string;
  title: string;
  number: number;
  year: number;
}

interface AIStatus {
  ai_active: boolean;
  has_key: boolean;
  status: string;
  model?: string;
  embed_model?: string;
  provider?: string;
}

export default function ContentStudioPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [selectedSourceType, setSelectedSourceType] = useState<'document' | 'expedition'>('document');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedExpId, setSelectedExpId] = useState('');
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['summary']);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'bengali' | 'tamil'>('english');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Record<string, { content: string; id: string; status: string }>>({});
  const [error, setError] = useState('');
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    documentsApi.list({ status: 'approved', page_size: 50 }).then(r => setDocuments(r.data.items)).catch(() => {});
    expeditionsApi.list().then(r => setExpeditions(r.data)).catch(() => {});
    assistantApi.status()
      .then(r => setAiStatus(r.data))
      .catch(() => setAiStatus({ ai_active: false, has_key: false, status: 'disconnected' }))
      .finally(() => setStatusLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedDocId && !selectedExpId) {
      setError('Please select a source document or expedition');
      return;
    }
    if (selectedContentTypes.length === 0) {
      setError('Please select at least one content type');
      return;
    }
    setError('');
    setGenerating(true);
    setResults({});

    for (const contentType of selectedContentTypes) {
      try {
        const res = await contentApi.generate({
          content_type: contentType,
          source_document_id: selectedSourceType === 'document' ? selectedDocId : undefined,
          source_expedition_id: selectedSourceType === 'expedition' ? selectedExpId : undefined,
          language: selectedLanguage,
        });
        setResults(prev => ({
          ...prev,
          [contentType]: { content: res.data.content, id: res.data.id, status: 'draft' },
        }));
      } catch (e: unknown) {
        const err = e as { response?: { data?: { detail?: string } }; message?: string };
        setResults(prev => ({
          ...prev,
          [contentType]: {
            content: `Error generating ${contentType}: ${err.response?.data?.detail || err.message}`,
            id: '',
            status: 'error',
          },
        }));
      }
    }
    setGenerating(false);
  };

  const handleApprove = async (contentType: string, action: 'approved' | 'rejected') => {
    const result = results[contentType];
    if (!result?.id) return;
    try {
      await contentApi.approve(result.id, action);
      setResults(prev => ({
        ...prev,
        [contentType]: { ...prev[contentType], status: action },
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleContentType = (id: string) => {
    setSelectedContentTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const sourceTitle = selectedSourceType === 'document'
    ? documents.find(d => d.id === selectedDocId)?.title
    : expeditions.find(e => e.id === selectedExpId)?.title;

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-32 sm:pt-36 transition-colors">
      {/* Header */}
      <div className="py-14 bg-gradient-to-b from-[#ebf5ff] to-surface dark:from-[#0a1628] dark:to-[#06111F] border-b border-[#bfc7d2]/40 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dff0ff] dark:bg-white/10 text-[#00685f] dark:text-teal-300 font-mono text-xs font-semibold uppercase tracking-wider mb-4 border border-[#bfc7d2]/40 dark:border-white/10">
                <Sparkles size={12} />
                NCPOR Public Science Dissemination · Outreach Studio & AI Translator
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#001e2e] dark:text-white mb-3">
                From Research to Outreach
              </h1>
              <p className="text-[#3f4850] dark:text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Transform scientific knowledge into accessible multilingual public content — articles, social posts, parliamentary briefs, and educational explainers.
              </p>
            </div>
            {statusLoading ? (
              <div className="flex items-center gap-2 text-xs text-[#707881] bg-white/60 dark:bg-white/5 border border-[#bfc7d2]/40 dark:border-white/10 px-3.5 py-1.5 rounded-full">
                <Loader2 size={12} className="animate-spin text-[#006194]" />
                Checking Gemini...
              </div>
            ) : aiStatus?.has_key ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Gemini Connected ({aiStatus.model || 'gemini-flash-lite'})
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Gemini API Key Required · Demo Mode
              </div>
            )}
          </div>

          {!statusLoading && aiStatus && !aiStatus.has_key && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 mt-4">
              <span className="text-amber-500">⚠️</span>
              <span>
                <strong>Gemini API Key Missing:</strong> Operating in offline demo mode. Add <code className="bg-black/10 dark:bg-black/40 px-1.5 py-0.5 rounded text-[#001e2e] dark:text-white">GEMINI_API_KEY</code> in <code className="bg-black/10 dark:bg-black/40 px-1.5 py-0.5 rounded text-[#001e2e] dark:text-white">apps/api/.env</code> to generate with live Google Gemini.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Step 1: Source */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
              <h2 className="font-display font-bold text-lg text-[#001e2e] dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#006194] rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                Select Source
              </h2>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedSourceType('document')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    selectedSourceType === 'document'
                      ? 'bg-[#cce5ff] dark:bg-sky-950 border-[#006194] text-[#004b73] dark:text-sky-300'
                      : 'border-[#bfc7d2]/50 dark:border-white/10 text-[#707881] dark:text-slate-400 hover:border-[#006194]'
                  }`}
                >
                  <FileText size={14} className="inline mr-1" />
                  Document
                </button>
                <button
                  onClick={() => setSelectedSourceType('expedition')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    selectedSourceType === 'expedition'
                      ? 'bg-[#cce5ff] dark:bg-sky-950 border-[#006194] text-[#004b73] dark:text-sky-300'
                      : 'border-[#bfc7d2]/50 dark:border-white/10 text-[#707881] dark:text-slate-400 hover:border-[#006194]'
                  }`}
                >
                  <Globe size={14} className="inline mr-1" />
                  Expedition
                </button>
              </div>

              {selectedSourceType === 'document' ? (
                <div>
                  <label className="block text-xs font-mono font-semibold text-[#707881] uppercase tracking-wider mb-2">
                    Select Document
                  </label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    className="input w-full text-sm"
                  >
                    <option value="">— Choose a document —</option>
                    {documents.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title.slice(0, 60)}{doc.title.length > 60 ? '...' : ''} ({doc.year || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Expedition
                  </label>
                  <select
                    value={selectedExpId}
                    onChange={(e) => setSelectedExpId(e.target.value)}
                    className="input w-full text-sm"
                  >
                    <option value="">— Choose an expedition —</option>
                    {expeditions.map(exp => (
                      <option key={exp.id} value={exp.id}>
                        {exp.number}. {exp.title} ({exp.year})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sourceTitle && (
                <div className="mt-3 p-3 bg-polar-frost border border-polar-cyan/20 rounded-lg">
                  <div className="text-xs text-polar-cyan font-semibold mb-1">Selected source:</div>
                  <div className="text-sm text-polar-navy font-medium line-clamp-2">{sourceTitle}</div>
                </div>
              )}
            </div>

            {/* Step 2: Choose Language (Multilingual Support) */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-polar-navy mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-polar-cyan rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                Translation Language
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'english', label: 'English', native: 'English' },
                  { id: 'hindi', label: 'Hindi', native: 'हिंदी' },
                  { id: 'bengali', label: 'Bengali', native: 'বাংলা' },
                  { id: 'tamil', label: 'Tamil', native: 'தமிழ்' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedLanguage === lang.id
                        ? 'bg-[#006194] text-white border-[#006194] shadow-sm'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{lang.label}</div>
                    <div className={`text-[11px] ${selectedLanguage === lang.id ? 'text-sky-200' : 'text-slate-400'}`}>
                      {lang.native}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Content Types */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-polar-navy mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-polar-cyan rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                Select Output Types
              </h2>
              <div className="space-y-2">
                {CONTENT_TYPES.map((ct) => {
                  const Icon = ct.icon;
                  const selected = selectedContentTypes.includes(ct.id);
                  return (
                    <button
                      key={ct.id}
                      onClick={() => toggleContentType(ct.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selected
                          ? 'border-polar-cyan/40 bg-polar-cyan/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ct.color}`}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-polar-navy">{ct.label}</div>
                        <div className="text-xs text-slate-400">{ct.description}</div>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-polar-cyan border-polar-cyan' : 'border-slate-300'
                      }`}>
                        {selected && <Check size={10} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-3">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={generating || (!selectedDocId && !selectedExpId)}
                className="btn-primary w-full py-4 text-base justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating with {aiStatus?.has_key ? (aiStatus.model || 'Gemini') : 'Demo Engine'}...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    {aiStatus?.has_key ? 'Generate with Google Gemini' : 'Generate Content (Demo Mode)'}
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 text-center mt-2 flex items-center justify-center gap-1.5">
                {aiStatus?.has_key ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live Gemini synthesis · Human review recommended
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Cached demo templates · Add API key for live generation
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-5">
            {Object.keys(results).length === 0 && !generating && (
              <div className="card p-16 text-center">
                <Sparkles size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-polar-navy mb-2">
                  Ready to Generate
                </h3>
                <p className="text-slate-500">
                  Select a source and content types, then click Generate. AI will transform research into accessible content.
                </p>
              </div>
            )}

            {/* Loading placeholders */}
            {generating && selectedContentTypes.filter(t => !results[t]).map((type) => (
              <div key={type} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-24 h-4 skeleton" />
                  <Loader2 size={16} className="text-polar-cyan animate-spin ml-auto" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 skeleton" />
                  <div className="w-5/6 h-3 skeleton" />
                  <div className="w-4/6 h-3 skeleton" />
                </div>
              </div>
            ))}

            {/* Generated results */}
            {CONTENT_TYPES.filter(ct => results[ct.id]).map((ct) => {
              const result = results[ct.id];
              const Icon = ct.icon;

              return (
                <div key={ct.id} className={`card p-6 ${result.status === 'error' ? 'border-red-200' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ct.color}`}>
                        <Icon size={15} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-polar-navy">{ct.label}</h3>
                        {sourceTitle && (
                          <p className="text-xs text-slate-400">Based on: {sourceTitle.slice(0, 50)}...</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.status === 'approved' && (
                        <span className="badge badge-success text-xs">Approved</span>
                      )}
                      {result.status === 'rejected' && (
                        <span className="badge badge-danger text-xs">Rejected</span>
                      )}
                      {result.status === 'draft' && (
                        <span className="badge badge-warning text-xs">Pending Review</span>
                      )}
                    </div>
                  </div>

                  {/* AI Warning */}
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-xs text-amber-700">
                    <AlertCircle size={12} />
                    AI-generated — human review required before official publication
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4 max-h-96 overflow-y-auto">
                    <MarkdownRenderer content={result.content} />
                  </div>

                  {result.status === 'draft' && result.id && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(ct.id, 'approved')}
                        className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprove(ct.id, 'rejected')}
                        className="px-4 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => navigator.clipboard?.writeText(result.content)}
                        className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  )}

                  {result.status === 'approved' && (
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <Check size={14} className="text-emerald-600" />
                        Approved &amp; Saved to NCPOR Database
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText(result.content)}
                        className="px-3.5 py-1.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        Copy Approved Text
                      </button>
                    </div>
                  )}

                  {result.status === 'rejected' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                      <AlertCircle size={14} className="text-red-500 shrink-0" />
                      Rejected — Flagged and excluded from official outreach publications.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

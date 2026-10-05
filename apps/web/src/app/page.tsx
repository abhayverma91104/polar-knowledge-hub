'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass, ArrowRight, Database, MessageSquare, BookOpen,
  Search, Download, ExternalLink, Sparkles, Send, Check, Copy,
  FileText, Shield, Layers, Radio, Globe, ChevronRight, X
} from 'lucide-react';
import { PolarTelemetry } from '@/components/polar-telemetry';

export default function HomePage() {
  const router = useRouter();

  // Explorer station selection state
  const [selectedStation, setSelectedStation] = useState<'bharati' | 'maitri' | 'dakshin' | 'himadri' | 'himansh'>('bharati');
  const [activeRegionTab, setActiveRegionTab] = useState<'antarctic' | 'arctic' | 'himalayas'>('antarctic');

  // Polar AI Console query state
  const [aiQuery, setAiQuery] = useState('Correlate this with summer sea-surface salinity anomalies in Prydz Bay');
  const [citationCopied, setCitationCopied] = useState(false);

  // Outreach Studio state
  const [sourceDoc, setSourceDoc] = useState('NCPOR-Pub-2024: Arctic Halogen Fluxes');
  const [targetFormat, setTargetFormat] = useState<'parliament' | 'school' | 'press' | 'visual'>('parliament');
  const [targetLang, setTargetLang] = useState<'hindi' | 'english' | 'bengali' | 'tamil'>('hindi');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Proposal modal state
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  // Archive search state
  const [archiveSearch, setArchiveSearch] = useState('');

  const stationProfiles = {
    bharati: {
      name: 'Bharati Research Station',
      id: 'ID-ANT-02',
      year: 'COMMISSIONED 2012',
      location: 'Larsemann Hills, Antarctica (69°24\'S, 76°11\'E)',
      description: 'India’s third Antarctic research facility and active overwintering base. Located in the Larsemann Hills along the Ingrid Christensen Coast of East Antarctica, Bharati supports comprehensive oceanography, glaciological coring, and atmospheric telemetry.',
      winterCap: '47 Scientists / Crew',
      thermal: 'Double-Skin Prefab Containers',
      satcom: 'C-Band Telemetry (128 Mbps)',
      harbour: 'Prydz Bay / Ice Shelf',
      rawUrl: '/stations?id=bharati',
      reportUrl: '/repository?q=Bharati',
    },
    maitri: {
      name: 'Maitri Research Station',
      id: 'ID-ANT-01',
      year: 'COMMISSIONED 1989',
      location: 'Schirmacher Oasis, Antarctica (70°45\'S, 11°44\'E)',
      description: 'India’s second permanent Antarctic research station situated on rocky ice-free terrain adjacent to Lake Priyadarshini. A frontline observatory for atmospheric science, geomagnetism, biology, and glaciology.',
      winterCap: '25 Scientists / Crew',
      thermal: 'Rigid Insulated Steel Shelters',
      satcom: 'Inmarsat / Ku-Band Link (32 Mbps)',
      harbour: 'Schirmacher Ice Shelf (100km north)',
      rawUrl: '/stations?id=maitri',
      reportUrl: '/repository?q=Maitri',
    },
    dakshin: {
      name: 'Dakshin Gangotri Historical Base',
      id: 'ID-ANT-HIST',
      year: 'COMMISSIONED 1983',
      location: 'Dakshin Gangotri Glacier, Antarctica (70°05\'S, 12°00\'E)',
      description: 'India’s historic first permanent base in Antarctica. Now functioning as an unmanned glaciological tracking site and historical monument under the Antarctic Treaty.',
      winterCap: 'Historical Memorial / Automated Site',
      thermal: 'Sub-ice Wooden Structure',
      satcom: 'Satellite Argos Relay',
      harbour: 'Princess Astrid Coast',
      rawUrl: '/stations',
      reportUrl: '/repository?q=Dakshin+Gangotri',
    },
    himadri: {
      name: 'Himadri Arctic Station',
      id: 'ID-ARC-01',
      year: 'COMMISSIONED 2008',
      location: 'Ny-Ålesund, Svalbard (78°55\'N, 11°56\'E)',
      description: 'India’s Arctic research station located 1,200 km from the North Pole in the International Arctic Research base at Ny-Ålesund, focused on aerosol physics, glacial dynamics, and Kongsfjorden fjord monitoring.',
      winterCap: '8 Visiting Scientists',
      thermal: 'Nordic Low-Loss Timber Frame',
      satcom: 'Svalbard Fiber Optics (Gigabit)',
      harbour: 'Kongsfjorden Harbor',
      rawUrl: '/stations?id=himadri',
      reportUrl: '/repository?q=Himadri',
    },
    himansh: {
      name: 'Himansh Glaciological Station',
      id: 'ID-HIM-01',
      year: 'COMMISSIONED 2016',
      location: 'Chandra Basin, Spiti Valley, Himalayas (32°24\'N, 77°37\'E)',
      description: 'India’s remote high-altitude glaciological research observatory situated at 4,080m elevation in the Western Himalayas. Dedicated to monitoring Himalayan cryosphere changes, glacier mass balance, and runoff hydrology.',
      winterCap: '12 Glaciologists / Climbers',
      thermal: 'High-Altitude Insulated Alpine Enclosure',
      satcom: 'ISRO Satellite Uplink Terminal',
      harbour: 'Manali / Kaza Overland Route',
      rawUrl: '/stations?id=himansh',
      reportUrl: '/repository?q=Himansh',
    },
  };

  const currentStation = stationProfiles[selectedStation as keyof typeof stationProfiles] || stationProfiles.bharati;

  const handleCopyCitation = () => {
    const bibtex = `@article{ncpor_benthic_2024,
  title={Benthic Community Structure and Epifaunal Sponge Decline in Prydz Bay Coast},
  author={Sharma, Amita and Roy, S. K. and Tiwari, Anoop},
  journal={Journal of Polar Science & Cryospheric Research},
  volume={41},
  pages={819--834},
  year={2024},
  doi={10.2112/ncpor.ocean.2024.819}
}`;
    navigator.clipboard.writeText(bibtex);
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2500);
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuery.trim()) {
      router.push(`/assistant?q=${encodeURIComponent(aiQuery.trim())}`);
    }
  };

  const handleArchiveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/repository?q=${encodeURIComponent(archiveSearch.trim())}`);
  };

  const contentStudioPreviews: Record<string, { title: string; body: string; metric: string }> = {
    hindi: {
      title: 'आर्कटिक महासागर में हैलोजन गैसों का प्रभाव और भारतीय मानसून से इसका सीधा संबंध',
      body: 'राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र (एनसीपीओआर) के हिमाद्रि स्टेशन (स्वालबार्ड) द्वारा जुटाए गए 2024 के आंकड़ों से ज्ञात होता है कि ब्रोमीन और आयोडीन के चक्रों में आए बदलाव आर्कटिक की समुद्री बर्फ के क्षरण को तेज कर रहे हैं। यह प्रक्रिया ऊपरी वायुमंडल में जेट धाराओं को प्रभावित करती है, जिससे भारतीय ग्रीष्मकालीन मानसून के पूर्वानुमान मॉडल को अधिक सटीक बनाने में मदद मिलती है।',
      metric: 'मुख्य निष्कर्ष: मानसून टेलीकनेक्शन पुष्टि (+14% मॉडल सटीकता)',
    },
    english: {
      title: 'Impact of Arctic Halogen Fluxes on Sea Ice Loss and Indian Monsoon Teleconnections',
      body: 'Continuous in-situ observations from NCPOR’s Himadri Station at Ny-Ålesund, Svalbard reveal accelerated photolytic release of reactive bromine and iodine. These boundary layer halogens drive rapid tropospheric ozone depletion events, altering mid-latitude planetary Rossby wave packets and modulating Indian summer monsoon predictability.',
      metric: 'Key Metric: Monsoon Teleconnection Confirmed (+14% Model Accuracy)',
    },
    bengali: {
      title: 'আর্কটিক মহাসাগরে হ্যালোজেন গ্যাসের প্রভাব এবং ভারতীয় বর্ষার সাথে এর সম্পর্ক',
      body: 'এনসিপিওআর-এর হিমাদ্রি স্টেশন (স্বালবার্ড) থেকে সংগৃহীত তথ্য প্রমাণ করে যে বায়ুমণ্ডলীয় ব্রোমিন ও আয়োডিন রাসায়নিক ক্ষয় প্রক্রিয়াকে দ্রুত করছে। এর ফলে জেট বায়ুর প্রবাহ পরিবর্তিত হয়ে ভারতীয় গ্রীষ্মকালীন মৌসুমি বায়ুর গতিপথ এবং পূর্বাভাসের নির্ভুলতাকে উল্লেখযোগ্যভাবে প্রভাবিত করে।',
      metric: 'মূল তথ্য: মৌসুমি বায়ু টেলিকানেকশন নিশ্চিত (+১৪% পূর্বাভাস নির্ভুলতা)',
    },
    tamil: {
      title: 'ஆர்க்டிக் ஹாலஜன் வாயுக்களின் தாக்கம் மற்றும் இந்திய பருவமழை உடனான நேரடி தொடர்பு',
      body: 'என்சிபிஓஆர்-இன் ஹிமாத்ரி நிலையத்தின் (ஸ்வால்பார்ட்) சமீபத்திய ஆய்வுகள், வளிமண்டல ப்ரோமின் மற்றும் அயோடின் சுழற்சிகள் கடல் பனி உருகுதலை விரைவுபடுத்துவதை உறுதி செய்கின்றன. இது இந்திய தென்மேற்கு பருவமழை சுழற்சிகளில் கணிசமான தாக்கத்தை ஏற்படுத்துகிறது.',
      metric: 'முக்கிய கண்டுபிடிப்பு: பருவமழை தொலைதொடர்பு உறுதிப்படுத்தப்பட்டது (+14% துல்லியம்)',
    },
  };

  const previewContent = contentStudioPreviews[targetLang] || contentStudioPreviews.hindi;

  return (
    <div className="w-full bg-[#f6faff] dark:bg-[#06111F] text-[#001e2e] dark:text-slate-100 font-sans transition-colors pt-24 sm:pt-28">

      {/* ─── SECTION 1: POLAR HERO WITH PANORAMIC EXPEDITION BACKDROP ─── */}
      <section className="relative w-full overflow-hidden bg-[#f6faff] dark:bg-[#06111F] -mt-24 sm:-mt-28 pt-28 pb-12 sm:pb-16 border-b border-[#bfc7d2]/40 dark:border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            alt="Antarctic Scientific Expedition"
            src="/images/polar-hero-bg.jpg"
            className="w-full h-full object-cover object-center filter brightness-75 contrast-125 dark:brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f6faff] via-[#f6faff]/80 to-[#f6faff]/50 dark:from-[#06111F] dark:via-[#06111F]/80 dark:to-[#06111F]/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f6faff] via-[#f6faff]/70 to-transparent dark:from-[#06111F] dark:via-[#06111F]/70 dark:to-transparent" />
          {/* Auroral glow vector accents */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[#41617e]/15 dark:bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#007bb9]/15 dark:bg-teal-500/10 blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 pt-4">
          {/* 44th IAE Telemetry Pill */}
          <div className="flex items-center gap-2 self-start">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md rounded-full shadow-sm border border-[#bfc7d2]/50 dark:border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#00685f] animate-ping" />
              <span className="w-2 h-2 rounded-full bg-[#00685f] -ml-4" />
              <span className="font-mono text-[10px] sm:text-[11px] text-[#00685f] dark:text-teal-300 font-bold uppercase tracking-wider">
                MISSION TELEMETRY ACTIVE
              </span>
              <span className="text-[#707881] text-xs">/</span>
              <span className="font-mono text-[10px] sm:text-[11px] text-[#001e2e] dark:text-white font-medium">
                44th Indian Antarctic Expedition (2024–25)
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] text-[#006194] dark:text-sky-300 px-1.5 py-0.5 bg-[#cce5ff] dark:bg-sky-950/80 rounded font-semibold">
                VOYAGE SECURE
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="flex flex-col max-w-4xl gap-2">
            <span className="font-mono text-xs sm:text-sm text-[#006194] dark:text-sky-400 font-bold tracking-widest uppercase">
              National Centre for Polar and Ocean Research
            </span>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#001e2e] dark:text-white leading-[1.08] drop-shadow-sm">
              Explore India’s <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006194] via-[#0284c7] to-[#008378] dark:from-sky-400 dark:via-cyan-300 dark:to-teal-300">
                Polar Science
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#3f4850] dark:text-slate-300 max-w-2xl pt-1 leading-relaxed">
              The sovereign telemetry portal, paleoclimate data bank, and cryospheric repository spanning the Larsemann Hills, Schirmacher Oasis, Svalbard fjord systems, and the High Himalayas.
            </p>
          </div>

          {/* High-Latitude Coordinate Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl pt-2">
            <Link
              href="/stations?id=bharati"
              className="bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md p-3 rounded-lg flex flex-col shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all group"
            >
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Antarctica</span>
                <span className="w-2 h-2 rounded-full bg-[#00685f]" />
              </div>
              <span className="font-mono text-sm sm:text-base text-[#001e2e] dark:text-white font-bold mt-1 group-hover:text-[#006194] transition-colors">
                69°24&apos;S · 76°11&apos;E
              </span>
              <span className="font-sans text-[11px] text-[#41617e] dark:text-slate-400">Bharati / Maitri Nodes</span>
            </Link>

            <Link
              href="/stations?id=himadri"
              className="bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md p-3 rounded-lg flex flex-col shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all group"
            >
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Arctic</span>
                <span className="w-2 h-2 rounded-full bg-[#006194]" />
              </div>
              <span className="font-mono text-sm sm:text-base text-[#001e2e] dark:text-white font-bold mt-1 group-hover:text-[#006194] transition-colors">
                78°55&apos;N · 11°56&apos;E
              </span>
              <span className="font-sans text-[11px] text-[#41617e] dark:text-slate-400">Himadri · Ny-Ålesund</span>
            </Link>

            <Link
              href="/repository?q=Southern+Ocean"
              className="bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md p-3 rounded-lg flex flex-col shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all group"
            >
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Southern Ocean</span>
                <span className="w-2 h-2 rounded-full bg-[#008378]" />
              </div>
              <span className="font-mono text-sm sm:text-base text-[#001e2e] dark:text-white font-bold mt-1 group-hover:text-[#006194] transition-colors">
                40°00&apos;S — 65°00&apos;S
              </span>
              <span className="font-sans text-[11px] text-[#41617e] dark:text-slate-400">Hydrographic Transects</span>
            </Link>

            <Link
              href="/stations?id=himansh"
              className="bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md p-3 rounded-lg flex flex-col shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all group"
            >
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Himalayas</span>
                <span className="w-2 h-2 rounded-full bg-[#41617e]" />
              </div>
              <span className="font-mono text-sm sm:text-base text-[#001e2e] dark:text-white font-bold mt-1 group-hover:text-[#006194] transition-colors">
                4,080m AMSL
              </span>
              <span className="font-sans text-[11px] text-[#41617e] dark:text-slate-400">Himansh · Spiti Valley</span>
            </Link>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#stations-explorer"
              className="px-5 py-2.5 bg-[#007bb9] hover:bg-[#006194] text-white font-semibold text-sm rounded-lg flex items-center gap-2 shadow-md transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Polar Science</span>
            </a>
            <Link
              href="/expeditions"
              className="px-5 py-2.5 bg-white/90 dark:bg-white/10 hover:bg-[#d4ebff] dark:hover:bg-white/20 text-[#001e2e] dark:text-white font-semibold text-sm rounded-lg flex items-center gap-2 shadow-sm border border-[#bfc7d2]/50 dark:border-white/10 transition-all"
            >
              <Layers className="w-4 h-4 text-[#006194] dark:text-sky-400" />
              <span>View Expeditions</span>
            </Link>
            <a
              href="#polar-ai-console"
              className="px-5 py-2.5 bg-[#ebf5ff] dark:bg-[#0a1628] hover:bg-[#dff0ff] dark:hover:bg-white/15 text-[#41617e] dark:text-sky-300 font-semibold text-sm rounded-lg flex items-center gap-2 shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#00685f] dark:text-teal-300" />
              <span>Ask Polar AI</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: POLAR SCIENCE AT A GLANCE (METRIC PODS) ─── */}
      <section className="w-full bg-white dark:bg-[#081525] py-12 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs text-[#41617e] dark:text-sky-400 font-bold uppercase tracking-widest block">
                National Cryospheric Matrix
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white">
                Polar Science at a Glance
              </h2>
            </div>
            <span className="font-mono text-xs text-[#707881] dark:text-slate-400">
              Synchronized with MoES Central Polar Gateway · Q1 2025
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Metric 1 */}
            <div className="bg-[#dff0ff]/60 dark:bg-white/5 p-4 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/30 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400 font-mono text-[11px] uppercase font-semibold">
                <span>Endurance</span>
                <Radio className="w-4 h-4 text-[#006194] dark:text-sky-400" />
              </div>
              <div className="my-3">
                <div className="font-display text-3xl sm:text-4xl text-[#001e2e] dark:text-white font-bold tracking-tight">40+</div>
                <span className="text-sm font-semibold text-[#006194] dark:text-sky-300 block">Years of Continuous Research</span>
              </div>
              <span className="text-xs text-[#3f4850] dark:text-slate-400">Since Dakshin Gangotri (1981) baseline.</span>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#dff0ff]/60 dark:bg-white/5 p-4 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/30 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400 font-mono text-[11px] uppercase font-semibold">
                <span>Missions</span>
                <Layers className="w-4 h-4 text-[#41617e] dark:text-sky-300" />
              </div>
              <div className="my-3">
                <div className="font-display text-3xl sm:text-4xl text-[#001e2e] dark:text-white font-bold tracking-tight">44</div>
                <span className="text-sm font-semibold text-[#41617e] dark:text-sky-300 block">Antarctic Expeditions</span>
              </div>
              <span className="text-xs text-[#3f4850] dark:text-slate-400">Latest overwintering team deployed Jan 2025.</span>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#dff0ff]/60 dark:bg-white/5 p-4 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/30 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400 font-mono text-[11px] uppercase font-semibold">
                <span>Active Stations</span>
                <Globe className="w-4 h-4 text-[#00685f] dark:text-teal-400" />
              </div>
              <div className="my-3">
                <div className="font-display text-3xl sm:text-4xl text-[#001e2e] dark:text-white font-bold tracking-tight">3+1</div>
                <span className="text-sm font-semibold text-[#00685f] dark:text-teal-300 block">Stations & High Post</span>
              </div>
              <span className="text-xs text-[#3f4850] dark:text-slate-400">Bharati, Maitri, Himadri + Himansh Post.</span>
            </div>

            {/* Metric 4 */}
            <div className="bg-[#dff0ff]/60 dark:bg-white/5 p-4 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/30 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400 font-mono text-[11px] uppercase font-semibold">
                <span>Peer Publications</span>
                <FileText className="w-4 h-4 text-[#006194] dark:text-sky-400" />
              </div>
              <div className="my-3">
                <div className="font-display text-3xl sm:text-4xl text-[#001e2e] dark:text-white font-bold tracking-tight">1,240+</div>
                <span className="text-sm font-semibold text-[#006194] dark:text-sky-300 block">Scopus/WOS Publications</span>
              </div>
              <span className="text-xs text-[#3f4850] dark:text-slate-400">Indexed in Polar Knowledge Data Commons.</span>
            </div>

            {/* Metric 5 */}
            <div className="bg-[#dff0ff]/60 dark:bg-white/5 p-4 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/30 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-[#707881] dark:text-slate-400 font-mono text-[11px] uppercase font-semibold">
                <span>Biomes Covered</span>
                <Compass className="w-4 h-4 text-[#41617e] dark:text-teal-300" />
              </div>
              <div className="my-3">
                <div className="font-display text-3xl sm:text-4xl text-[#001e2e] dark:text-white font-bold tracking-tight">4</div>
                <span className="text-sm font-semibold text-[#41617e] dark:text-teal-300 block">Extreme Polar Regimes</span>
              </div>
              <span className="text-xs text-[#3f4850] dark:text-slate-400">Antarctica, Arctic, Himalayas, South Ocean.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: LIVE POLAR STATION TELEMETRY ─── */}
      <section className="w-full bg-[#f6faff] dark:bg-[#06111F] py-14 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PolarTelemetry />
        </div>
      </section>

      {/* ─── SECTION 4: INTERACTIVE POLAR EXPLORER (GEOSPATIAL CANVAS) ─── */}
      <section className="w-full bg-white dark:bg-[#081525] py-14 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors" id="stations-explorer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-[#006194] dark:text-sky-400 font-bold uppercase tracking-widest block">
                Sovereign Spatial Telemetry
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white">
                Interactive Polar Explorer
              </h2>
            </div>
            {/* Region selector tabs */}
            <div className="flex items-center gap-1.5 font-mono text-xs bg-[#ebf5ff] dark:bg-white/10 p-1 rounded-lg border border-[#bfc7d2]/40 dark:border-white/10">
              <button
                onClick={() => { setActiveRegionTab('antarctic'); setSelectedStation('bharati'); }}
                className={`px-3 py-1.5 rounded font-medium transition-all ${
                  activeRegionTab === 'antarctic'
                    ? 'bg-white dark:bg-[#007bb9] text-[#006194] dark:text-white shadow-sm font-semibold'
                    : 'text-[#707881] dark:text-slate-300 hover:text-[#001e2e]'
                }`}
              >
                Antarctic (East)
              </button>
              <button
                onClick={() => { setActiveRegionTab('arctic'); setSelectedStation('himadri'); }}
                className={`px-3 py-1.5 rounded font-medium transition-all ${
                  activeRegionTab === 'arctic'
                    ? 'bg-white dark:bg-[#007bb9] text-[#006194] dark:text-white shadow-sm font-semibold'
                    : 'text-[#707881] dark:text-slate-300 hover:text-[#001e2e]'
                }`}
              >
                Arctic (Svalbard)
              </button>
              <button
                onClick={() => { setActiveRegionTab('himalayas'); setSelectedStation('himansh'); }}
                className={`px-3 py-1.5 rounded font-medium transition-all ${
                  activeRegionTab === 'himalayas'
                    ? 'bg-white dark:bg-[#007bb9] text-[#006194] dark:text-white shadow-sm font-semibold'
                    : 'text-[#707881] dark:text-slate-300 hover:text-[#001e2e]'
                }`}
              >
                Third Pole (Himalayas)
              </button>
            </div>
          </div>

          {/* Map & Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Interactive Map Area (8 cols) */}
            <div className="lg:col-span-8 bg-[#dff0ff]/70 dark:bg-white/5 rounded-xl p-4 flex flex-col relative overflow-hidden shadow-sm border border-[#bfc7d2]/50 dark:border-white/10 min-h-[440px]">
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={
                    activeRegionTab === 'arctic'
                      ? '/images/himadri-arctic.jpg'
                      : activeRegionTab === 'himalayas'
                      ? '/images/himansh-himalayas.jpg'
                      : '/images/antarctica-landscape.jpg'
                  }
                  alt={
                    activeRegionTab === 'arctic'
                      ? 'Himadri Arctic Research Station in Ny-Ålesund, Svalbard'
                      : activeRegionTab === 'himalayas'
                      ? 'Himansh High-Altitude Observatory in Spiti Valley, Himalayas'
                      : 'Bharati and Maitri Indian Antarctic Research Stations'
                  }
                  className="w-full h-full object-cover filter brightness-80 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f6faff] via-[#f6faff]/20 to-transparent dark:from-[#081525] dark:via-[#081525]/30 dark:to-transparent" />
              </div>

              {/* Map UI Overlay */}
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md rounded font-mono text-[11px] text-[#41617e] dark:text-sky-300 font-bold border border-[#bfc7d2]/40 dark:border-white/10">
                    {activeRegionTab === 'arctic'
                      ? 'SECTOR: SVALBARD_HIGH_ARCTIC_79N'
                      : activeRegionTab === 'himalayas'
                      ? 'SECTOR: CHANDRA_BASIN_THIRD_POLE_4080M'
                      : 'SECTOR: EAST_ANTARCTICA_POLAR_CONTINENT'}
                  </span>
                  <div className="flex items-center gap-1 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md p-1 rounded border border-[#bfc7d2]/40 dark:border-white/10">
                    <Link
                      href="/explore"
                      title="Open full interactive GIS map"
                      className="px-2.5 py-1 text-xs font-mono font-semibold text-[#006194] dark:text-sky-300 hover:bg-[#ebf5ff] dark:hover:bg-white/10 rounded flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" /> Full GIS View
                    </Link>
                  </div>
                </div>

                {/* Pin Markers Over Map */}
                <div className="relative w-full h-64 my-auto">
                  {activeRegionTab === 'antarctic' ? (
                    <>
                      {/* Pin: Bharati */}
                      <button
                        onClick={() => setSelectedStation('bharati')}
                        className={`absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-transform ${
                          selectedStation === 'bharati' ? 'scale-110 z-20' : 'opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-[#00685f] ring-4 ring-[#00685f]/40 animate-pulse" />
                        <div className="mt-1 px-2.5 py-1 bg-white/95 dark:bg-[#0a1628]/95 rounded text-center shadow-lg border border-[#00685f]/30">
                          <span className="font-mono text-xs text-[#00685f] dark:text-teal-300 font-bold block">
                            BHARATI
                          </span>
                          <span className="font-mono text-[9px] text-[#707881] dark:text-slate-400">
                            69°24&apos;S, 76°11&apos;E
                          </span>
                        </div>
                      </button>

                      {/* Pin: Maitri */}
                      <button
                        onClick={() => setSelectedStation('maitri')}
                        className={`absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-transform ${
                          selectedStation === 'maitri' ? 'scale-110 z-20' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-[#006194] ring-2 ring-white/60" />
                        <div className="mt-1 px-2 py-0.5 bg-white/95 dark:bg-[#0a1628]/95 rounded text-center shadow-md border border-[#006194]/30">
                          <span className="font-mono text-[11px] text-[#006194] dark:text-sky-300 font-bold block">
                            MAITRI
                          </span>
                          <span className="font-mono text-[9px] text-[#707881] dark:text-slate-400">
                            70°45&apos;S, 11°44&apos;E
                          </span>
                        </div>
                      </button>

                      {/* Pin: Dakshin Gangotri */}
                      <button
                        onClick={() => setSelectedStation('dakshin')}
                        className={`absolute bottom-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-transform ${
                          selectedStation === 'dakshin' ? 'scale-110 z-20' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full bg-[#707881]" />
                        <div className="mt-1 px-2 py-0.5 bg-white/90 dark:bg-[#0a1628]/90 rounded text-center shadow-sm">
                          <span className="font-mono text-[10px] text-[#707881] dark:text-slate-300 block">
                            DAKSHIN GANGOTRI (1983)
                          </span>
                        </div>
                      </button>
                    </>
                  ) : activeRegionTab === 'arctic' ? (
                    <>
                      {/* Pin: Himadri */}
                      <button
                        onClick={() => setSelectedStation('himadri')}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group scale-110 z-20"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#006194] ring-4 ring-[#006194]/40 animate-pulse" />
                        <div className="mt-1 px-3 py-1 bg-white/95 dark:bg-[#0a1628]/95 rounded text-center shadow-lg border border-[#006194]/30">
                          <span className="font-mono text-xs text-[#006194] dark:text-sky-300 font-bold block">
                            HIMADRI BASE
                          </span>
                          <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">
                            78°55&apos;N, 11°56&apos;E · Ny-Ålesund, Svalbard
                          </span>
                        </div>
                      </button>

                      {/* Pin: IndARC Mooring */}
                      <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-85">
                        <div className="w-3 h-3 rounded-full bg-[#00685f] ring-2 ring-white/60" />
                        <div className="mt-1 px-2 py-0.5 bg-white/90 dark:bg-[#0a1628]/90 rounded text-center shadow-sm border border-[#00685f]/30">
                          <span className="font-mono text-[10px] text-[#00685f] dark:text-teal-300 font-semibold block">
                            IndARC MOORING
                          </span>
                          <span className="font-mono text-[9px] text-[#707881] dark:text-slate-400">
                            Kongsfjorden Fjord
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Pin: Himansh */}
                      <button
                        onClick={() => setSelectedStation('himansh')}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group scale-110 z-20"
                      >
                        <div className="w-4 h-4 rounded-full bg-purple-600 ring-4 ring-purple-500/40 animate-pulse" />
                        <div className="mt-1 px-3 py-1 bg-white/95 dark:bg-[#0a1628]/95 rounded text-center shadow-lg border border-purple-500/30">
                          <span className="font-mono text-xs text-purple-700 dark:text-purple-300 font-bold block">
                            HIMANSH OBSERVATORY
                          </span>
                          <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">
                            32°24&apos;N, 77°37&apos;E · Chandra Basin (4,080m)
                          </span>
                        </div>
                      </button>

                      {/* Pin: Bara Shigri / Sutri Dhaka Glacier Post */}
                      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-85">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-white/60" />
                        <div className="mt-1 px-2 py-0.5 bg-white/90 dark:bg-[#0a1628]/90 rounded text-center shadow-sm border border-indigo-500/30">
                          <span className="font-mono text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold block">
                            SUTRI DHAKA POST
                          </span>
                          <span className="font-mono text-[9px] text-[#707881] dark:text-slate-400">
                            Glacier Mass Balance
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Map Footer Info */}
                <div className="flex items-center justify-between font-mono text-[11px] text-[#3f4850] dark:text-slate-300 bg-white/85 dark:bg-[#0a1628]/85 backdrop-blur-md p-2 px-3 rounded border border-[#bfc7d2]/30 dark:border-white/10">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#00685f] dark:text-teal-400" />
                    Cartographic Projection: Polar Stereographic (WGS84)
                  </span>
                  <span>Grid Extent: 1,840 km²</span>
                </div>
              </div>
            </div>

            {/* Side Station Inspector Card (4 cols) */}
            <div className="lg:col-span-4 bg-[#dff0ff]/50 dark:bg-white/5 p-5 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#00685f] dark:text-teal-300 uppercase font-bold tracking-wider">
                    STATION PROFILE: {currentStation.id}
                  </span>
                  <span className="px-2 py-0.5 bg-[#cce5ff] dark:bg-sky-950 text-[#004b73] dark:text-sky-300 font-mono text-[10px] rounded font-bold">
                    {currentStation.year}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#001e2e] dark:text-white">
                  {currentStation.name}
                </h3>
                <span className="font-mono text-[11px] text-[#707881] dark:text-slate-400 -mt-2">
                  {currentStation.location}
                </span>

                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed">
                  {currentStation.description}
                </p>

                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between py-1.5 bg-white dark:bg-white/5 px-3 rounded border border-[#bfc7d2]/30 dark:border-white/5 font-mono text-xs">
                    <span className="text-[#707881] dark:text-slate-400">Wintering Capacity</span>
                    <span className="text-[#001e2e] dark:text-white font-semibold">{currentStation.winterCap}</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-white dark:bg-white/5 px-3 rounded border border-[#bfc7d2]/30 dark:border-white/5 font-mono text-xs">
                    <span className="text-[#707881] dark:text-slate-400">Thermal Envelope</span>
                    <span className="text-[#001e2e] dark:text-white font-semibold">{currentStation.thermal}</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-white dark:bg-white/5 px-3 rounded border border-[#bfc7d2]/30 dark:border-white/5 font-mono text-xs">
                    <span className="text-[#707881] dark:text-slate-400">Primary SatCom Link</span>
                    <span className="text-[#001e2e] dark:text-white font-semibold">{currentStation.satcom}</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-white dark:bg-white/5 px-3 rounded border border-[#bfc7d2]/30 dark:border-white/5 font-mono text-xs">
                    <span className="text-[#707881] dark:text-slate-400">Nearest Harbour</span>
                    <span className="text-[#001e2e] dark:text-white font-semibold">{currentStation.harbour}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href={currentStation.rawUrl}
                  className="w-full py-2 bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Access Raw Base Telemetry</span>
                </Link>
                <Link
                  href={currentStation.reportUrl}
                  className="w-full py-2 bg-white dark:bg-white/10 hover:bg-[#ebf5ff] dark:hover:bg-white/20 text-[#001e2e] dark:text-white font-medium text-xs text-center rounded border border-[#bfc7d2]/40 dark:border-white/10 transition-colors"
                >
                  Download Station Schematics & DOI Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: INDIA'S POLAR EXPEDITIONS ─── */}
      <section className="w-full bg-[#f6faff] dark:bg-[#06111F] py-14 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors" id="expeditions-registry">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-[#41617e] dark:text-sky-400 font-bold uppercase tracking-widest block">
                National Logistical Operations
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white">
                India&apos;s Polar Expeditions
              </h2>
            </div>
            <Link
              href="/expeditions"
              className="font-mono text-xs font-semibold text-[#006194] dark:text-sky-300 flex items-center gap-1.5 hover:underline"
            >
              <span>Complete Expedition Catalog (1981–2025)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 44th IAE */}
            <div className="bg-white dark:bg-[#0a1628] rounded-xl p-5 flex flex-col justify-between shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#cce5ff] dark:bg-sky-950 text-[#004b73] dark:text-sky-300 font-mono text-[10px] rounded font-bold">
                    ONGOING MISSION
                  </span>
                  <span className="font-mono text-xs text-[#707881] font-bold">IAE-44</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#001e2e] dark:text-white pt-1">
                  44th Indian Antarctic Expedition
                </h3>
                <span className="font-mono text-[11px] text-[#006194] dark:text-sky-400">
                  Dec 2024 – Apr 2025 · Vessel: MV Vasiliy Golovnin
                </span>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed pt-1">
                  Drilling deep coastal ice cores in Queen Maud Land, deployment of automated aerosol samplers at Bharati, and overwinter relief handover at Maitri station.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    Glaciology
                  </span>
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    Paleoclimate
                  </span>
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    48 Scientists
                  </span>
                </div>
              </div>
              <div className="pt-5 flex items-center justify-between border-t border-[#bfc7d2]/20 dark:border-white/5 mt-4">
                <span className="font-mono text-[11px] text-[#707881] dark:text-slate-400">
                  Lead: Dr. S. K. Roy (NCPOR)
                </span>
                <Link
                  href="/expeditions"
                  className="px-3 py-1 bg-[#ebf5ff] dark:bg-white/10 hover:bg-[#d4ebff] dark:hover:bg-white/20 text-[#006194] dark:text-sky-300 font-mono text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  <span>Voyage Log</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 17th ISE (Arctic) */}
            <div className="bg-white dark:bg-[#0a1628] rounded-xl p-5 flex flex-col justify-between shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#cce5ff] dark:bg-sky-950 text-[#004b73] dark:text-sky-300 font-mono text-[10px] rounded font-bold">
                    COMPLETED PHASE
                  </span>
                  <span className="font-mono text-xs text-[#707881] font-bold">ISE-17</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#001e2e] dark:text-white pt-1">
                  17th Indian Arctic Expedition
                </h3>
                <span className="font-mono text-[11px] text-[#006194] dark:text-sky-400">
                  Summer & Winter 2024 · Ny-Ålesund, Svalbard
                </span>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed pt-1">
                  Long-term Kongsfjorden fjord monitoring using the moored IndARC underwater observatory, biological characterization of Arctic cryoconite holes, and atmospheric halogens.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    Marine Biology
                  </span>
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    Mooring Array
                  </span>
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    IndARC
                  </span>
                </div>
              </div>
              <div className="pt-5 flex items-center justify-between border-t border-[#bfc7d2]/20 dark:border-white/5 mt-4">
                <span className="font-mono text-[11px] text-[#707881] dark:text-slate-400">
                  Lead: Dr. B. N. Goswami
                </span>
                <Link
                  href="/repository?q=IndARC"
                  className="px-3 py-1 bg-[#ebf5ff] dark:bg-white/10 hover:bg-[#d4ebff] dark:hover:bg-white/20 text-[#006194] dark:text-sky-300 font-mono text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  <span>View Data</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 12th SOE (Southern Ocean) */}
            <div className="bg-white dark:bg-[#0a1628] rounded-xl p-5 flex flex-col justify-between shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#89f5e7]/30 dark:bg-teal-950 text-[#005049] dark:text-teal-300 font-mono text-[10px] rounded font-bold">
                    DATA SYNTHESIS
                  </span>
                  <span className="font-mono text-xs text-[#707881] font-bold">SOE-12</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#001e2e] dark:text-white pt-1">
                  12th Southern Ocean Expedition
                </h3>
                <span className="font-mono text-[11px] text-[#006194] dark:text-sky-400">
                  Indian Ocean Sector · Sub-Tropical to Polar Front
                </span>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed pt-1">
                  Hydrographic profiling along 57°30&apos;E transect, biogeochemical carbon sequestration assessment in the Antarctic Circumpolar Current, and krill biomass acoustic mapping.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    CTD Profiling
                  </span>
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    Carbon Pump
                  </span>
                  <span className="px-2 py-0.5 bg-[#ebf5ff] dark:bg-white/5 text-[#001e2e] dark:text-slate-300 font-mono text-[10px] rounded">
                    ORV Sagar Kanya
                  </span>
                </div>
              </div>
              <div className="pt-5 flex items-center justify-between border-t border-[#bfc7d2]/20 dark:border-white/5 mt-4">
                <span className="font-mono text-[11px] text-[#707881] dark:text-slate-400">
                  Lead: Dr. Anoop Tiwari
                </span>
                <Link
                  href="/repository?q=Southern+Ocean"
                  className="px-3 py-1 bg-[#ebf5ff] dark:bg-white/10 hover:bg-[#d4ebff] dark:hover:bg-white/20 text-[#006194] dark:text-sky-300 font-mono text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  <span>Cruise Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: POLAR CLASSROOM (CRYOSPHERE MODULES) ─── */}
      <section className="w-full bg-white dark:bg-[#081525] py-14 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-[#00685f] dark:text-teal-400 font-bold uppercase tracking-widest block">
                Educational & Research Curriculum
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white">
                Polar Classroom
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#3f4850] dark:text-slate-400 max-w-md">
              Open-access peer-reviewed modules for postgraduates, climate scientists, and competitive research fellows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Module 1: Ice Cores */}
            <div className="bg-[#dff0ff]/50 dark:bg-white/5 p-5 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#cce5ff] dark:bg-sky-950 text-[#004b73] dark:text-sky-300 font-mono text-[10px] rounded font-bold">
                    PALEOCLIMATOLOGY
                  </span>
                  <span className="font-mono text-xs text-[#707881] font-bold">MODULE 01</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#001e2e] dark:text-white pt-1">
                  Ice Cores: Climate Archives
                </h3>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed">
                  Explore how atmospheric gas bubbles trapped within Antarctic ice sheets for 800,000 years reveal historical CO₂ variations, volcanic signatures, and paleothermometry via δ¹⁸O and δD isotope ratios.
                </p>
                <div className="bg-white dark:bg-white/5 p-3 rounded border border-[#bfc7d2]/30 dark:border-white/5 mt-2">
                  <span className="font-mono text-[10px] text-[#00685f] dark:text-teal-400 block font-bold">PRIMARY METRIC:</span>
                  <span className="font-mono text-xs text-[#001e2e] dark:text-white font-semibold">δ¹⁸O fractionation / CH₄ orbital pacing</span>
                </div>
              </div>
              <div className="pt-4 grid grid-cols-3 gap-2">
                <Link
                  href="/classroom/glaciers"
                  className="py-1.5 bg-[#007bb9] hover:bg-[#006194] text-white font-mono text-xs font-semibold rounded text-center transition-colors"
                >
                  Learn
                </Link>
                <Link
                  href="/classroom"
                  className="py-1.5 bg-white dark:bg-white/10 hover:bg-[#ebf5ff] text-[#001e2e] dark:text-white font-mono text-xs font-semibold rounded text-center border border-[#bfc7d2]/40 dark:border-white/10 transition-colors"
                >
                  Quiz
                </Link>
                <Link
                  href="/assistant?q=Explain+Ice+Cores+and+Paleoclimate"
                  className="py-1.5 bg-[#ebf5ff] dark:bg-white/5 hover:bg-[#d4ebff] text-[#41617e] dark:text-sky-300 font-mono text-xs font-semibold rounded text-center transition-colors"
                >
                  Ask AI
                </Link>
              </div>
            </div>

            {/* Module 2: Southern Ocean Biological Pump */}
            <div className="bg-[#dff0ff]/50 dark:bg-white/5 p-5 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#89f5e7]/30 dark:bg-teal-950 text-[#005049] dark:text-teal-300 font-mono text-[10px] rounded font-bold">
                    BIOGEOCHEMISTRY
                  </span>
                  <span className="font-mono text-xs text-[#707881] font-bold">MODULE 02</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#001e2e] dark:text-white pt-1">
                  Southern Ocean Biological Pump
                </h3>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed">
                  Investigate the carbon sequestration machinery of the Antarctic Circumpolar Current: High-Nutrient Low-Chlorophyll (HNLC) dynamics, iron limitation, diatom blooms, and particulate organic carbon drawdown.
                </p>
                <div className="bg-white dark:bg-white/5 p-3 rounded border border-[#bfc7d2]/30 dark:border-white/5 mt-2">
                  <span className="font-mono text-[10px] text-[#00685f] dark:text-teal-400 block font-bold">PRIMARY METRIC:</span>
                  <span className="font-mono text-xs text-[#001e2e] dark:text-white font-semibold">C_flux: ~3.2 Pg C/year sink rate</span>
                </div>
              </div>
              <div className="pt-4 grid grid-cols-3 gap-2">
                <Link
                  href="/classroom/polar-oceans"
                  className="py-1.5 bg-[#007bb9] hover:bg-[#006194] text-white font-mono text-xs font-semibold rounded text-center transition-colors"
                >
                  Learn
                </Link>
                <Link
                  href="/classroom"
                  className="py-1.5 bg-white dark:bg-white/10 hover:bg-[#ebf5ff] text-[#001e2e] dark:text-white font-mono text-xs font-semibold rounded text-center border border-[#bfc7d2]/40 dark:border-white/10 transition-colors"
                >
                  Quiz
                </Link>
                <Link
                  href="/assistant?q=Southern+Ocean+Biological+Pump+Carbon+Flux"
                  className="py-1.5 bg-[#ebf5ff] dark:bg-white/5 hover:bg-[#d4ebff] text-[#41617e] dark:text-sky-300 font-mono text-xs font-semibold rounded text-center transition-colors"
                >
                  Ask AI
                </Link>
              </div>
            </div>

            {/* Module 3: Arctic Amplification */}
            <div className="bg-[#dff0ff]/50 dark:bg-white/5 p-5 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#cce5ff] dark:bg-sky-950 text-[#004b73] dark:text-sky-300 font-mono text-[10px] rounded font-bold">
                    ATMOSPHERIC DYNAMICS
                  </span>
                  <span className="font-mono text-xs text-[#707881] font-bold">MODULE 03</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#001e2e] dark:text-white pt-1">
                  Arctic Amplification & Monsoons
                </h3>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed">
                  Examine the direct teleconnection between Arctic sea-ice diminution in the Barents-Kara Sea, Rossby wave modulation, mid-latitude jet stream meanders, and Indian Summer Monsoon variability.
                </p>
                <div className="bg-white dark:bg-white/5 p-3 rounded border border-[#bfc7d2]/30 dark:border-white/5 mt-2">
                  <span className="font-mono text-[10px] text-[#00685f] dark:text-teal-400 block font-bold">PRIMARY METRIC:</span>
                  <span className="font-mono text-xs text-[#001e2e] dark:text-white font-semibold">Albedo feedback / QBO teleconnection</span>
                </div>
              </div>
              <div className="pt-4 grid grid-cols-3 gap-2">
                <Link
                  href="/classroom/climate-change"
                  className="py-1.5 bg-[#007bb9] hover:bg-[#006194] text-white font-mono text-xs font-semibold rounded text-center transition-colors"
                >
                  Learn
                </Link>
                <Link
                  href="/classroom"
                  className="py-1.5 bg-white dark:bg-white/10 hover:bg-[#ebf5ff] text-[#001e2e] dark:text-white font-mono text-xs font-semibold rounded text-center border border-[#bfc7d2]/40 dark:border-white/10 transition-colors"
                >
                  Quiz
                </Link>
                <Link
                  href="/assistant?q=Arctic+Amplification+Indian+Monsoon"
                  className="py-1.5 bg-[#ebf5ff] dark:bg-white/5 hover:bg-[#d4ebff] text-[#41617e] dark:text-sky-300 font-mono text-xs font-semibold rounded text-center transition-colors"
                >
                  Ask AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: POLAR AI RESEARCH ASSISTANT (DUAL-PANE SCIENTIFIC CONSOLE) ─── */}
      <section className="w-full bg-[#f6faff] dark:bg-[#06111F] py-14 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors" id="polar-ai-console">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[#00685f] dark:text-teal-400 font-mono text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span className="uppercase tracking-widest">NCPOR RAG-Grounded Polar LLM</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white">
                Polar AI Research Assistant
              </h2>
            </div>
            <span className="font-mono text-xs text-[#707881] dark:text-slate-400">
              Engine: NCPOR-CryoBERT v4 · 4.8M Indexed Tokens
            </span>
          </div>

          {/* Dual Console Frame */}
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#0a1628] rounded-xl overflow-hidden shadow-lg border border-[#bfc7d2]/40 dark:border-white/10">
            {/* Left: Query & Live Synthesized Response (8 cols) */}
            <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-[#bfc7d2]/30 dark:border-white/10">
              {/* Scientist Prompt Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#007bb9] flex items-center justify-center shrink-0 text-white shadow-sm">
                  <Database className="w-4 h-4" />
                </div>
                <div className="bg-[#ebf5ff] dark:bg-white/10 p-3.5 rounded-xl max-w-xl border border-[#bfc7d2]/30 dark:border-white/5">
                  <span className="font-mono text-[10px] text-[#006194] dark:text-sky-300 font-bold block uppercase">
                    DR. AMITA SHARMA (BENTHIC ECOLOGY DIVISION)
                  </span>
                  <p className="text-sm text-[#001e2e] dark:text-white pt-1 leading-relaxed">
                    &ldquo;What are the documented shifts in Prydz Bay macrobenthic fauna biomass between 2015 and 2024 expeditions adjacent to the Bharati station shoreline?&rdquo;
                  </p>
                </div>
              </div>

              {/* AI Synthesized Response Container */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00685f] flex items-center justify-center shrink-0 text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-[#f6faff] dark:bg-white/5 p-4 rounded-xl w-full flex flex-col gap-3 border border-[#bfc7d2]/40 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#00685f] dark:text-teal-300 font-bold">
                      SYNTHESIZED GROUNDED FINDINGS (98.4% CONFIDENCE)
                    </span>
                    <span className="font-mono text-[11px] text-[#707881] dark:text-slate-400">
                      4 Peer Citations
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#001e2e] dark:text-slate-200 leading-relaxed">
                    Analysis of 6 benthic grab surveys conducted across 14 stations in Prydz Bay (40m–220m depth) demonstrates an average 18.2% decline in epifaunal sponge spicule mats, compensated by an upward migration of motile polychaetes and ophiuroids (<span className="font-mono text-[#006194] dark:text-sky-300 font-semibold">Ophionotus victoriae</span>), directly correlated with reduced fast-ice permanence.
                  </p>

                  {/* Data Matrix Table */}
                  <div className="w-full overflow-x-auto rounded border border-[#bfc7d2]/30 dark:border-white/10 mt-1">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="bg-[#ebf5ff] dark:bg-white/10 text-[#41617e] dark:text-slate-300 font-bold">
                          <th className="p-2">Taxa Group</th>
                          <th className="p-2">2015 Baseline (g/m²)</th>
                          <th className="p-2">2024 Resurvey (g/m²)</th>
                          <th className="p-2">Δ Biomass</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#bfc7d2]/20 dark:divide-white/5 text-[#001e2e] dark:text-slate-200">
                        <tr className="hover:bg-[#ebf5ff]/40 dark:hover:bg-white/5">
                          <td className="p-2 font-medium">Porifera (Hexactinellida)</td>
                          <td className="p-2">142.4 ± 12</td>
                          <td className="p-2">116.5 ± 9</td>
                          <td className="p-2 text-rose-600 dark:text-rose-400 font-bold">-18.2%</td>
                        </tr>
                        <tr className="hover:bg-[#ebf5ff]/40 dark:hover:bg-white/5">
                          <td className="p-2 font-medium">Ophiuroidea (Brittle Stars)</td>
                          <td className="p-2">38.1 ± 4</td>
                          <td className="p-2">49.8 ± 6</td>
                          <td className="p-2 text-[#00685f] dark:text-teal-400 font-bold">+30.7%</td>
                        </tr>
                        <tr className="hover:bg-[#ebf5ff]/40 dark:hover:bg-white/5">
                          <td className="p-2 font-medium">Polychaeta (Sedentary)</td>
                          <td className="p-2">24.6 ± 3</td>
                          <td className="p-2">28.9 ± 2</td>
                          <td className="p-2 text-[#00685f] dark:text-teal-400 font-bold">+17.4%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Terminal Input Box */}
                  <form onSubmit={handleAiSubmit} className="mt-2 flex items-center gap-2 bg-white dark:bg-[#06111F] p-1.5 rounded-lg border border-[#bfc7d2]/50 dark:border-white/10 focus-within:ring-2 focus-within:ring-[#006194]">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask follow-up glaciological or biological telemetry query..."
                      className="bg-transparent w-full text-xs sm:text-sm text-[#001e2e] dark:text-white placeholder:text-[#707881] focus:outline-none px-2"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#006194] hover:bg-[#007bb9] text-white font-mono text-xs font-semibold rounded-md flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
                    >
                      <span>Query</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right: Grounded Evidence Drawer (4 cols) */}
            <div className="lg:col-span-4 bg-[#ebf5ff]/50 dark:bg-white/5 p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-[#00685f] dark:text-teal-400 uppercase font-bold tracking-widest">
                  Ground Truth DOIs (MoES / NCPOR)
                </span>
                <div className="flex flex-col gap-2 pt-1">
                  {/* Source 1 */}
                  <div className="bg-white dark:bg-[#0a1628] p-3 rounded-lg flex flex-col gap-0.5 border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
                    <span className="font-mono text-[10px] text-[#006194] dark:text-sky-300 font-bold">NCPOR-DATA-2024-0081</span>
                    <span className="text-xs text-[#001e2e] dark:text-white font-semibold">Benthic Community Structure of Prydz Bay Coast</span>
                    <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">doi:10.2112/ncpor.ocean.2024.819</span>
                  </div>

                  {/* Source 2 */}
                  <div className="bg-white dark:bg-[#0a1628] p-3 rounded-lg flex flex-col gap-0.5 border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
                    <span className="font-mono text-[10px] text-[#006194] dark:text-sky-300 font-bold">IAE-41-REP-VOL4</span>
                    <span className="text-xs text-[#001e2e] dark:text-white font-semibold">Overwinter Hydrographic Casts: Larsemann Hills</span>
                    <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">doi:10.5670/oceanrep.2022.04</span>
                  </div>

                  {/* Source 3 */}
                  <div className="bg-white dark:bg-[#0a1628] p-3 rounded-lg flex flex-col gap-0.5 border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
                    <span className="font-mono text-[10px] text-[#006194] dark:text-sky-300 font-bold">SCAR-ANT-TAXA-99</span>
                    <span className="text-xs text-[#001e2e] dark:text-white font-semibold">Southern Ocean Biogeography Register (2023)</span>
                    <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">doi:10.1016/j.dsr2.2023.105281</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleCopyCitation}
                  className="w-full p-2.5 bg-white dark:bg-[#0a1628] hover:bg-[#d4ebff] dark:hover:bg-white/10 rounded-lg flex items-center justify-between border border-[#bfc7d2]/40 dark:border-white/10 font-mono text-xs text-[#3f4850] dark:text-slate-200 transition-colors shadow-sm"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    {citationCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#006194]" />}
                    {citationCopied ? 'BibTeX Copied!' : 'Export Scientific Citation (BibTeX)'}
                  </span>
                  <Download className="w-4 h-4 text-[#006194] dark:text-sky-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: OUTREACH STUDIO & AI TRANSLATOR ─── */}
      <section className="w-full bg-white dark:bg-[#081525] py-14 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-[#41617e] dark:text-sky-400 font-bold uppercase tracking-widest block">
                NCPOR Public Science Dissemination
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white">
                Outreach Studio & AI Translator
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#3f4850] dark:text-slate-400 max-w-md">
              Transform complex cryospheric publications into multilingual press communiqués, parliamentary briefs, and educational graphics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Configuration Controls (5 cols) */}
            <div className="lg:col-span-5 bg-[#dff0ff]/50 dark:bg-white/5 p-5 rounded-xl flex flex-col gap-4 border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] text-[#707881] dark:text-slate-400 uppercase font-semibold">
                  Select Source Scientific Dataset / Paper
                </label>
                <select
                  value={sourceDoc}
                  onChange={(e) => setSourceDoc(e.target.value)}
                  className="p-2.5 bg-white dark:bg-[#0a1628] rounded-lg font-mono text-xs text-[#001e2e] dark:text-white border border-[#bfc7d2]/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#006194]"
                >
                  <option value="NCPOR-Pub-2024: Arctic Halogen Fluxes">NCPOR-Pub-2024: Arctic Halogen Fluxes</option>
                  <option value="44th IAE: Dronning Maud Land Ice Core Stratigraphy">44th IAE: Dronning Maud Land Ice Core Stratigraphy</option>
                  <option value="IndARC Fjord Mooring Decadal Hydrography">IndARC Fjord Mooring Decadal Hydrography</option>
                  <option value="Chhota Shigri Mass Balance 2013-2024">Chhota Shigri Mass Balance 2013-2024</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] text-[#707881] dark:text-slate-400 uppercase font-semibold">
                  Target Audience & Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTargetFormat('parliament')}
                    className={`p-2.5 rounded-lg font-mono text-xs text-left font-semibold transition-all border ${
                      targetFormat === 'parliament'
                        ? 'bg-[#007bb9] text-white border-[#007bb9] shadow-sm'
                        : 'bg-white dark:bg-white/10 text-[#001e2e] dark:text-white border-[#bfc7d2]/40 dark:border-white/10'
                    }`}
                  >
                    Parliament Brief
                  </button>
                  <button
                    onClick={() => setTargetFormat('school')}
                    className={`p-2.5 rounded-lg font-mono text-xs text-left font-semibold transition-all border ${
                      targetFormat === 'school'
                        ? 'bg-[#007bb9] text-white border-[#007bb9] shadow-sm'
                        : 'bg-white dark:bg-white/10 text-[#001e2e] dark:text-white border-[#bfc7d2]/40 dark:border-white/10'
                    }`}
                  >
                    School Explainer
                  </button>
                  <button
                    onClick={() => setTargetFormat('press')}
                    className={`p-2.5 rounded-lg font-mono text-xs text-left font-semibold transition-all border ${
                      targetFormat === 'press'
                        ? 'bg-[#007bb9] text-white border-[#007bb9] shadow-sm'
                        : 'bg-white dark:bg-white/10 text-[#001e2e] dark:text-white border-[#bfc7d2]/40 dark:border-white/10'
                    }`}
                  >
                    Press Communiqué
                  </button>
                  <button
                    onClick={() => setTargetFormat('visual')}
                    className={`p-2.5 rounded-lg font-mono text-xs text-left font-semibold transition-all border ${
                      targetFormat === 'visual'
                        ? 'bg-[#007bb9] text-white border-[#007bb9] shadow-sm'
                        : 'bg-white dark:bg-white/10 text-[#001e2e] dark:text-white border-[#bfc7d2]/40 dark:border-white/10'
                    }`}
                  >
                    Science Visual Card
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] text-[#707881] dark:text-slate-400 uppercase font-semibold">
                  Translation Language
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'hindi', label: 'Hindi (हिंदी)' },
                    { id: 'english', label: 'English' },
                    { id: 'bengali', label: 'Bengali (বাংলা)' },
                    { id: 'tamil', label: 'Tamil (தமிழ்)' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setTargetLang(lang.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
                        targetLang === lang.id
                          ? 'bg-[#006194] text-white font-bold shadow-sm'
                          : 'bg-white dark:bg-white/10 text-[#3f4850] dark:text-slate-300 border border-[#bfc7d2]/40 dark:border-white/10 hover:bg-[#ebf5ff]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSynthesizing(true);
                  setTimeout(() => setIsSynthesizing(false), 800);
                }}
                className="w-full py-2.5 bg-[#41617e] hover:bg-[#006194] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Translation & Assets'}</span>
              </button>
            </div>

            {/* Generated Preview Card (7 cols) */}
            <div className="lg:col-span-7 bg-[#dff0ff]/50 dark:bg-white/5 p-5 rounded-xl flex flex-col justify-between border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00685f]" />
                    <span className="font-mono text-xs text-[#00685f] dark:text-teal-300 font-bold uppercase">
                      PREVIEW: {targetLang.toUpperCase()} {targetFormat.toUpperCase()} SUMMARY BRIEF
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">
                    DocID: MoES-POLAR-2025-{targetLang.toUpperCase()}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#0a1628] p-5 rounded-xl flex flex-col gap-3 border border-[#bfc7d2]/30 dark:border-white/10 shadow-sm">
                  <h4 className="font-display text-base sm:text-lg font-bold text-[#001e2e] dark:text-white leading-snug">
                    {previewContent.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#3f4850] dark:text-slate-300 leading-relaxed">
                    {previewContent.body}
                  </p>
                  <div className="p-3 bg-[#ebf5ff] dark:bg-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono text-xs border border-[#bfc7d2]/30 dark:border-white/5">
                    <span className="text-[#006194] dark:text-sky-300 font-semibold">{previewContent.metric}</span>
                    <span className="text-[#707881] dark:text-slate-400">अनुमोदित: एनसीपीओआर वैज्ञानिक समिति</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#bfc7d2]/20 dark:border-white/5 mt-4">
                <span className="font-mono text-xs text-[#707881] dark:text-slate-400">
                  Ready for Official PIB & MoES Release
                </span>
                <div className="flex gap-2">
                  <Link
                    href="/content-studio"
                    className="px-4 py-1.5 bg-white dark:bg-white/10 hover:bg-[#ebf5ff] dark:hover:bg-white/20 text-[#001e2e] dark:text-white font-mono text-xs font-semibold rounded-lg border border-[#bfc7d2]/40 dark:border-white/10 transition-colors"
                  >
                    Refine
                  </Link>
                  <Link
                    href="/media"
                    className="px-4 py-1.5 bg-[#006194] hover:bg-[#007bb9] text-white font-mono text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Publish to Media Hub</span>
                    <Send className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: POLAR DIGITAL ARCHIVE (DOI REPOSITORY) ─── */}
      <section className="w-full bg-[#f6faff] dark:bg-[#06111F] py-14 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-[#41617e] dark:text-sky-400 font-bold uppercase tracking-widest block">
                Open Scientific Data Commons
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white">
                Polar Digital Archive
              </h2>
            </div>
            {/* Search and filter bar */}
            <form onSubmit={handleArchiveSearch} className="flex items-center gap-2 bg-white dark:bg-[#0a1628] px-3.5 py-1.5 rounded-full border border-[#bfc7d2]/50 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-[#006194]">
              <Search className="w-4 h-4 text-[#707881]" />
              <input
                type="text"
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                placeholder="Filter datasets by discipline, year, base..."
                className="bg-transparent text-xs text-[#001e2e] dark:text-white placeholder:text-[#707881] focus:outline-none w-52 sm:w-64"
              />
            </form>
          </div>

          {/* Dataset Cards Mosaic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Dataset 1 */}
            <div className="bg-white dark:bg-[#0a1628] p-5 rounded-xl flex flex-col justify-between shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#cce5ff] dark:bg-sky-950 text-[#004b73] dark:text-sky-300 font-mono text-[10px] rounded font-bold">
                    ICE CORES
                  </span>
                  <span className="font-mono text-xs text-[#707881]">NetCDF · 4.2 GB</span>
                </div>
                <h3 className="font-display text-base font-bold text-[#001e2e] dark:text-white pt-1">
                  Central Dronning Maud Land Ice Core Stratigraphy
                </h3>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed">
                  High-resolution electrical conductivity, stable water isotopes (δ¹⁸O, δD), and microparticle concentration across 160m deep core representing the past 2,400 years.
                </p>
                <div className="p-2 bg-[#ebf5ff] dark:bg-white/5 rounded font-mono text-[11px] text-[#00685f] dark:text-teal-300 mt-2">
                  doi:10.5067/NCPOR/ANT-IC-2023-019
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-[#bfc7d2]/20 dark:border-white/5 mt-4">
                <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">CC BY-NC 4.0 Open</span>
                <Link
                  href="/repository?q=Dronning+Maud+Land"
                  className="px-3 py-1 bg-[#ebf5ff] dark:bg-white/10 hover:bg-[#d4ebff] dark:hover:bg-white/20 text-[#006194] dark:text-sky-300 font-mono text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </Link>
              </div>
            </div>

            {/* Dataset 2 */}
            <div className="bg-white dark:bg-[#0a1628] p-5 rounded-xl flex flex-col justify-between shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#cde5ff] dark:bg-sky-950 text-[#001d32] dark:text-sky-300 font-mono text-[10px] rounded font-bold">
                    OCEANOGRAPHY
                  </span>
                  <span className="font-mono text-xs text-[#707881]">CSV / GeoTIFF · 1.8 GB</span>
                </div>
                <h3 className="font-display text-base font-bold text-[#001e2e] dark:text-white pt-1">
                  IndARC Underwater Mooring CTD Time-Series
                </h3>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed">
                  Decadal continuous recording of water temperature, salinity, turbidity, and dissolved oxygen at 192m depth inside Kongsfjorden, Ny-Ålesund, Arctic.
                </p>
                <div className="p-2 bg-[#ebf5ff] dark:bg-white/5 rounded font-mono text-[11px] text-[#00685f] dark:text-teal-300 mt-2">
                  doi:10.5067/NCPOR/ARC-MOOR-2024-002
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-[#bfc7d2]/20 dark:border-white/5 mt-4">
                <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">CC BY-NC 4.0 Open</span>
                <Link
                  href="/repository?q=IndARC"
                  className="px-3 py-1 bg-[#ebf5ff] dark:bg-white/10 hover:bg-[#d4ebff] dark:hover:bg-white/20 text-[#006194] dark:text-sky-300 font-mono text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </Link>
              </div>
            </div>

            {/* Dataset 3 */}
            <div className="bg-white dark:bg-[#0a1628] p-5 rounded-xl flex flex-col justify-between shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 hover:border-[#006194] transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#89f5e7]/30 dark:bg-teal-950 text-[#005049] dark:text-teal-300 font-mono text-[10px] rounded font-bold">
                    GLACIOLOGY
                  </span>
                  <span className="font-mono text-xs text-[#707881]">GeoPackage · 850 MB</span>
                </div>
                <h3 className="font-display text-base font-bold text-[#001e2e] dark:text-white pt-1">
                  Chhota Shigri & Bara Shigri Mass Balance Atlas
                </h3>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 leading-relaxed">
                  Annual glaciological mass balance, stake ablation measurements, differential DGPS terminus elevations, and discharge runoff from Himansh Station post (2013–2024).
                </p>
                <div className="p-2 bg-[#ebf5ff] dark:bg-white/5 rounded font-mono text-[11px] text-[#00685f] dark:text-teal-300 mt-2">
                  doi:10.5067/NCPOR/HIM-GLAC-2024-098
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-[#bfc7d2]/20 dark:border-white/5 mt-4">
                <span className="font-mono text-[10px] text-[#707881] dark:text-slate-400">CC BY-NC 4.0 Open</span>
                <Link
                  href="/repository?q=Shigri"
                  className="px-3 py-1 bg-[#ebf5ff] dark:bg-white/10 hover:bg-[#d4ebff] dark:hover:bg-white/20 text-[#006194] dark:text-sky-300 font-mono text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: FIELD OPERATIONS MEDIA (BENTO GALLERY) ─── */}
      <section className="w-full bg-white dark:bg-[#081525] py-14 border-b border-[#bfc7d2]/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-[#41617e] dark:text-sky-400 font-bold uppercase tracking-widest block">
                Documentary Archives
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white">
                Field Operations Media
              </h2>
            </div>
            <Link
              href="/media"
              className="font-mono text-xs font-semibold text-[#006194] dark:text-sky-300 flex items-center gap-1.5 hover:underline"
            >
              <span>Explore High-Res Gallery Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bento Big Card (2 cols) */}
            <div className="md:col-span-2 relative rounded-xl overflow-hidden min-h-[320px] shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 group">
              <img
                src="/images/ice-core-science.jpg"
                alt="Ice Coring Rig Deployment"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06111F] via-[#06111F]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 flex flex-col text-white">
                <span className="font-mono text-[10px] text-teal-300 uppercase font-bold tracking-wider">
                  Field Operation · Queen Maud Land
                </span>
                <span className="font-display text-xl sm:text-2xl font-bold">
                  Sub-Glacial Ice Coring Rig Deployment
                </span>
                <span className="text-xs text-slate-300">
                  44th IAE Glaciological Field Camp
                </span>
              </div>
            </div>

            {/* Bento Side Card (1 col) */}
            <div className="relative rounded-xl overflow-hidden min-h-[320px] shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 group">
              <img
                src="/images/expedition-ship.jpg"
                alt="MV Vasiliy Golovnin in Prydz Bay"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06111F] via-[#06111F]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 flex flex-col text-white">
                <span className="font-mono text-[10px] text-sky-300 uppercase font-bold tracking-wider">
                  Logistics Vessel
                </span>
                <span className="font-display text-lg font-bold">
                  Icebreaker Transit in Prydz Bay
                </span>
                <span className="text-xs text-slate-300">
                  Annual Supply & Fuel Conveyance
                </span>
              </div>
            </div>

            {/* Bento Small Bottom 1 */}
            <div className="relative rounded-xl overflow-hidden min-h-[220px] shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 group">
              <img
                src="/images/bharati-station.jpg"
                alt="Himansh Station Spiti"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06111F] via-[#06111F]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 flex flex-col text-white">
                <span className="font-mono text-[10px] text-teal-300 uppercase font-bold tracking-wider">
                  Third Pole Post
                </span>
                <span className="font-display text-base font-bold">
                  Himansh Meteorological Mast
                </span>
              </div>
            </div>

            {/* Bento Small Bottom 2 */}
            <div className="relative rounded-xl overflow-hidden min-h-[220px] shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 group">
              <img
                src="/images/himadri-arctic.jpg"
                alt="Himadri Ny-Ålesund"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06111F] via-[#06111F]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 flex flex-col text-white">
                <span className="font-mono text-[10px] text-sky-300 uppercase font-bold tracking-wider">
                  Arctic Settlement
                </span>
                <span className="font-display text-base font-bold">
                  Himadri Base at Ny-Ålesund
                </span>
              </div>
            </div>

            {/* Bento Small Bottom 3 */}
            <div className="relative rounded-xl overflow-hidden min-h-[220px] shadow-sm border border-[#bfc7d2]/40 dark:border-white/10 group">
              <img
                src="/images/ocean-research.jpg"
                alt="CTD Water Column Recovery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06111F] via-[#06111F]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 flex flex-col text-white">
                <span className="font-mono text-[10px] text-teal-300 uppercase font-bold tracking-wider">
                  Deep Hydrography
                </span>
                <span className="font-display text-base font-bold">
                  CTD Water Column Recovery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 11: CALL FOR PROPOSALS BANNER ─── */}
      <section className="w-full bg-[#f6faff] dark:bg-[#06111F] py-14 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-[#dff0ff] via-[#d4ebff] to-[#ebf5ff] dark:from-[#0a1628] dark:via-[#10243a] dark:to-[#0a1628] rounded-2xl p-6 sm:p-10 overflow-hidden shadow-lg border border-[#bfc7d2]/40 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Glowing Auroral Accents */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#006194]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#00685f]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col max-w-2xl gap-2">
              <div className="flex items-center gap-2 text-[#00685f] dark:text-teal-400 font-mono text-xs font-bold">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="uppercase tracking-widest">MINISTRY OF EARTH SCIENCES · NATIONAL CALL</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#001e2e] dark:text-white leading-tight">
                Call for Research Proposals: <br className="hidden sm:inline" />
                45th Antarctic & 18th Arctic Expeditions
              </h2>
              <p className="text-sm text-[#3f4850] dark:text-slate-300 leading-relaxed pt-1">
                NCPOR invites peer-reviewed scientific projects from Indian universities, IITs, CSIR labs, and premier institutions for physical oceanography, microbial ecology, glaciology, and space weather instrumentation.
              </p>
              <div className="flex items-center gap-3 pt-2 font-mono text-xs text-[#707881] dark:text-slate-400">
                <span>Deadline: 31 May 2025</span>
                <span>·</span>
                <span className="text-[#00685f] dark:text-teal-300 font-semibold">Full Logistical Support Provided</span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => setProposalModalOpen(true)}
                className="px-6 py-3 bg-[#007bb9] hover:bg-[#006194] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Submit Scientific Proposal</span>
              </button>
              <a
                href="https://ncpor.res.in"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/90 dark:bg-white/10 hover:bg-white text-[#001e2e] dark:text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 border border-[#bfc7d2]/40 dark:border-white/10 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download MoES Guidelines (PDF)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SCIENTIFIC PROPOSAL MODAL ─── */}
      {proposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0a1628] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#bfc7d2]/50 dark:border-white/15 relative">
            <button
              onClick={() => { setProposalModalOpen(false); setProposalSubmitted(false); }}
              className="absolute top-4 right-4 p-1.5 text-[#707881] hover:text-[#001e2e] dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {proposalSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#001e2e] dark:text-white">
                  Proposal Draft Registered!
                </h3>
                <p className="text-xs text-[#3f4850] dark:text-slate-300 max-w-md">
                  Your project preliminary draft has been logged under NCPOR Reference <strong>MOES/IAE-45/2025/PROP-812</strong>. An official confirmation email with submission checklist has been dispatched to your institutional mail.
                </p>
                <button
                  onClick={() => setProposalModalOpen(false)}
                  className="mt-4 px-6 py-2 bg-[#006194] text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <span className="font-mono text-xs text-[#00685f] font-bold uppercase tracking-wider block">
                    NCPOR Expedition Proposal Portal
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#001e2e] dark:text-white">
                    Submit Proposal Draft (45th IAE / 18th ISE)
                  </h3>
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); setProposalSubmitted(true); }}
                  className="flex flex-col gap-3 font-sans text-xs"
                >
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-[#707881] uppercase font-semibold">Project Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sub-ice microbial metabolomics in Princess Astrid Coast"
                      className="p-2.5 rounded-lg border border-[#bfc7d2]/50 dark:border-white/10 bg-[#f6faff] dark:bg-white/5 text-[#001e2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006194]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[11px] text-[#707881] uppercase font-semibold">Primary Discipline</label>
                      <select className="p-2.5 rounded-lg border border-[#bfc7d2]/50 dark:border-white/10 bg-[#f6faff] dark:bg-white/5 text-[#001e2e] dark:text-white">
                        <option>Glaciology & Ice Coring</option>
                        <option>Atmospheric Physics & Aerosols</option>
                        <option>Oceanography & Biogeochemistry</option>
                        <option>Polar Biology & Genomics</option>
                        <option>Space Weather & Geomagnetism</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[11px] text-[#707881] uppercase font-semibold">Target Expedition</label>
                      <select className="p-2.5 rounded-lg border border-[#bfc7d2]/50 dark:border-white/10 bg-[#f6faff] dark:bg-white/5 text-[#001e2e] dark:text-white">
                        <option>45th Indian Antarctic Expedition</option>
                        <option>18th Indian Arctic Expedition</option>
                        <option>13th Southern Ocean Expedition</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[11px] text-[#707881] uppercase font-semibold">Principal Investigator</label>
                      <input
                        required
                        type="text"
                        placeholder="Dr. Full Name"
                        className="p-2.5 rounded-lg border border-[#bfc7d2]/50 dark:border-white/10 bg-[#f6faff] dark:bg-white/5 text-[#001e2e] dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[11px] text-[#707881] uppercase font-semibold">Institution / University</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. IIT Kharagpur / CSIR-NIO"
                        className="p-2.5 rounded-lg border border-[#bfc7d2]/50 dark:border-white/10 bg-[#f6faff] dark:bg-white/5 text-[#001e2e] dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[11px] text-[#707881] uppercase font-semibold">Executive Abstract (Max 300 words)</label>
                    <textarea
                      rows={3}
                      placeholder="Outline scientific objectives, sampling methodology, and field instrument cargo requirements..."
                      className="p-2.5 rounded-lg border border-[#bfc7d2]/50 dark:border-white/10 bg-[#f6faff] dark:bg-white/5 text-[#001e2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006194]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setProposalModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-[#007bb9] hover:bg-[#006194] text-white font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Proposal Draft</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

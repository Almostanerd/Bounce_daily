import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REVIEWS } from './data/reviews';

const BREAKDOWN = [
  { id: 'fees', label: 'Hidden Fees, 45-Day Deposit Lock & Payout Delays', count: 35, pct: 41.2, votes: 279, color: 'bg-rose-500' },
  { id: 'hardware', label: 'Broken Parts, Missing Side Stand & Slow Repairs', count: 17, pct: 20.0, votes: 62, color: 'bg-amber-400' },
  { id: 'neg_gen', label: 'General Bad Experience (Unspecified)', count: 11, pct: 12.9, votes: 18, color: 'bg-slate-400' },
  { id: 'battery', label: 'No Batteries at Stations & Low Real Range (20–25 km)', count: 8, pct: 9.4, votes: 25, color: 'bg-orange-400' },
  { id: 'app', label: 'App Buffering, Frequent Updates & Hidden Pricing', count: 8, pct: 9.4, votes: 26, color: 'bg-indigo-400' },
  { id: 'support', label: 'Unreachable Support, Hub Queues & Night Breakdowns', count: 6, pct: 7.1, votes: 21, color: 'bg-purple-400' }
];

const INITIAL_LOGS = [
  {
    id: 1,
    plate: 'KA-01-EV-1904',
    hub: 'HSR Sector 2',
    status: 'PASS',
    soc: 94,
    faults: ['No Side Stand'],
    note: 'Exempt from return penalty'
  },
  {
    id: 2,
    plate: 'KA-01-EV-7721',
    hub: 'Electronic City',
    status: 'HOLD',
    soc: 62,
    faults: ['Brake Slack'],
    note: 'Sent to mechanic bay before handover'
  }
];

function BounceYellowScooter({ riding = false, bounce = false, dark = true, style = { width: '96px', height: '64px' } }) {
  return (
    <motion.svg
      viewBox="0 0 220 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ ...style, flexShrink: 0 }}
      animate={
        bounce
          ? { y: [0, -10, 0], rotate: [0, -2, 0] }
          : riding
          ? { y: [0, -2.5, 0] }
          : {}
      }
      transition={{
        repeat: Infinity,
        duration: bounce ? 0.85 : 0.45,
        ease: 'easeInOut'
      }}
    >
      <ellipse cx="110" cy="126" rx="78" ry="6" fill={dark ? '#000000' : '#CBD5E1'} opacity={dark ? '0.45' : '0.6'} />

      <g>
        <circle cx="54" cy="104" r="21" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <circle cx="54" cy="104" r="11" fill="#64748B" />
        <circle cx="54" cy="104" r="4" fill="#0F172A" />
      </g>

      <g>
        <circle cx="168" cy="104" r="21" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <circle cx="168" cy="104" r="11" fill="#64748B" />
        <circle cx="168" cy="104" r="4" fill="#0F172A" />
      </g>

      <path
        d="M34 86 C36 66, 56 58, 86 58 L108 82 L134 82 L144 46 C146 39, 154 38, 160 44 L172 86 L154 94 L46 94 Z"
        fill="#FACC15"
        stroke="#EAB308"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path d="M46 58 C56 50, 82 50, 96 58 L88 65 L48 65 Z" fill="#090D16" />
      <rect x="82" y="83" width="56" height="10" rx="4" fill="#1E293B" />
      <path d="M150 56 L168 104" stroke="#64748B" strokeWidth="5" strokeLinecap="round" />

      <path d="M142 36 L154 36 L150 46" stroke={dark ? '#F8FAFC' : '#0F172A'} strokeWidth="4" strokeLinecap="round" />
      <circle cx="139" cy="32" r="4.5" fill={dark ? '#F8FAFC' : '#0F172A'} />

      <path d="M161 48 L169 51 L167 59 L159 56 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
      {(riding || bounce) && (
        <motion.polygon
          points="170,49 218,36 218,70 170,58"
          fill="url(#headlightBeam)"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ repeat: Infinity, duration: 0.85 }}
        />
      )}

      <path d="M52 74 L84 74" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" />

      <defs>
        <linearGradient id="headlightBeam" x1="170" y1="53" x2="218" y2="53" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FDE047" stopOpacity="0" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light' | 'bounce'
  const [tab, setTab] = useState('audit');

  // Calculator + KYC state
  const [days, setDays] = useState(15);
  const [orders, setOrders] = useState(18);
  const [lang, setLang] = useState('en');
  const [agreed, setAgreed] = useState(false);
  const [kycStep, setKycStep] = useState('idle');

  // Handover state
  const [hub, setHub] = useState('HSR Sector 2');
  const [plate, setPlate] = useState('KA-01-EV-4829');
  const [soc, setSoc] = useState(88);
  const [status, setStatus] = useState('PASS');
  const [faults, setFaults] = useState(['No Side Stand', 'Front Cowl Crack']);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [justDispatched, setJustDispatched] = useState(false);

  // Review filter state
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/handovers')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => setLogs(data))
      .catch(() => {});
  }, []);

  const toggleFault = (item) => {
    setFaults(prev => (prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]));
  };

  const handleKycClick = () => {
    if (!agreed) return;
    setKycStep('locking');
    setTimeout(() => {
      setKycStep('done');
    }, 1100);
  };

  const addHandover = async (e) => {
    e.preventDefault();
    const entry = {
      id: Date.now(),
      plate: plate.trim() || 'KA-01-EV-0000',
      hub,
      status,
      soc,
      faults,
      note: status === 'PASS' ? 'SMS receipt sent to rider' : 'Blocked until mechanic sign-off'
    };

    setJustDispatched(true);
    setTimeout(() => setJustDispatched(false), 1400);

    try {
      const res = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        const updated = await res.json();
        setLogs(updated);
        return;
      }
    } catch (_) {}
    setLogs(prev => [entry, ...prev]);
  };

  const filteredReviews = useMemo(() => {
    return REVIEWS.filter(r => {
      const okCat = catFilter === 'all' || r.c === catFilter;
      const okQ =
        !search.trim() ||
        r.t.toLowerCase().includes(search.toLowerCase()) ||
        r.a.toLowerCase().includes(search.toLowerCase());
      return okCat && okQ;
    }).sort((a, b) => b.v - a.v || a.id - b.id);
  }, [catFilter, search]);

  const dailyRate = days >= 7 ? 265 : 330;
  const activationFee = days > 60 ? 2000 : 1000;
  const totalCost = days * dailyRate + activationFee;
  const netProfit = days * orders * 55 - totalCost;
  const daysShort = Math.max(0, 45 - days);

  const unlockDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + Math.max(45, days));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [days]);

  // Theme tokens
  const isDark = theme === 'dark' || theme === 'bounce';
  const T = {
    dark: {
      page: 'bg-slate-950 text-slate-100',
      header: 'bg-slate-900/90 border-slate-800 text-white',
      navBar: 'bg-slate-900/60 border-slate-800',
      tabActive: 'text-amber-300 font-semibold',
      tabInactive: 'text-slate-400 hover:text-slate-200',
      tabLine: 'bg-amber-400',
      card: 'bg-slate-900 border-slate-800',
      subCard: 'bg-slate-950/75 border-slate-800',
      title: 'text-white',
      body: 'text-slate-300',
      muted: 'text-slate-400',
      barTrack: 'bg-slate-800',
      input: 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500',
      anomalyCard: 'bg-amber-950/35 border-amber-700/50',
      anomalyTitle: 'text-amber-400',
      anomalyNote: 'text-amber-300',
      accentText: 'text-amber-300',
      badge: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      primaryBtn: 'bg-rose-600 hover:bg-rose-500 text-white'
    },
    light: {
      page: 'bg-slate-50 text-slate-900',
      header: 'bg-white border-slate-200 text-slate-900',
      navBar: 'bg-white border-slate-200',
      tabActive: 'text-rose-600 font-semibold',
      tabInactive: 'text-slate-500 hover:text-slate-800',
      tabLine: 'bg-rose-600',
      card: 'bg-white border-slate-200 shadow-2xs',
      subCard: 'bg-slate-50 border-slate-200',
      title: 'text-slate-900',
      body: 'text-slate-600',
      muted: 'text-slate-500',
      barTrack: 'bg-slate-100',
      input: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400',
      anomalyCard: 'bg-amber-50 border-amber-200',
      anomalyTitle: 'text-amber-800',
      anomalyNote: 'text-amber-900',
      accentText: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      primaryBtn: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    bounce: {
      page: 'bg-zinc-950 text-zinc-100',
      header: 'bg-zinc-900 border-amber-400/30 text-white',
      navBar: 'bg-zinc-900/80 border-zinc-800',
      tabActive: 'text-yellow-400 font-semibold',
      tabInactive: 'text-zinc-400 hover:text-zinc-200',
      tabLine: 'bg-yellow-400',
      card: 'bg-zinc-900 border-zinc-800',
      subCard: 'bg-zinc-950 border-zinc-800',
      title: 'text-white',
      body: 'text-zinc-300',
      muted: 'text-zinc-400',
      barTrack: 'bg-zinc-800',
      input: 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-500',
      anomalyCard: 'bg-yellow-950/30 border-yellow-500/40',
      anomalyTitle: 'text-yellow-400',
      anomalyNote: 'text-yellow-300',
      accentText: 'text-yellow-400',
      badge: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/40',
      primaryBtn: 'bg-yellow-400 hover:bg-yellow-300 text-zinc-950'
    }
  }[theme];

  const NAV_ITEMS = [
    { id: 'audit', desktopLabel: '1. What 163 Reviews Show', mobileLabel: '163 Audit', icon: '📊' },
    { id: 'pricing', desktopLabel: '2. Upfront Rent & Deposit Estimator', mobileLabel: 'Estimator', icon: '₹' },
    { id: 'handover', desktopLabel: '3. 30-Sec Hub Handover Log', mobileLabel: 'Handover', icon: '🛵' },
    { id: 'field', desktopLabel: '4. Week-1 Bangalore Plan', mobileLabel: 'Week 1', icon: '📍' }
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${T.page}`}>
      {/* 5-SECOND MOVIE-STYLE OPENING SPLASH */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center px-6 text-center overflow-hidden"
          >
            <div className="flex items-center justify-center gap-5 mb-5">
              <motion.img
                src="/bounce-logo.png"
                alt="Bounce Daily"
                style={{ width: '58px', height: '58px' }}
                className="object-contain rounded-full"
                animate={{ y: [0, -18, 0, -10, 0], scale: [0.9, 1.06, 1, 1.03, 1] }}
                transition={{ duration: 1.9, ease: 'easeOut' }}
              />

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{
                  x: [-50, 0, 0, 460],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 0, -6, -3]
                }}
                transition={{
                  duration: 4.6,
                  times: [0, 0.2, 0.72, 1],
                  ease: 'easeInOut'
                }}
              >
                <BounceYellowScooter
                  riding={true}
                  bounce={true}
                  dark={true}
                  style={{ width: '115px', height: '76px' }}
                />
              </motion.div>
            </div>

            {/* Road / Progress line */}
            <div className="w-52 h-1 bg-slate-800 rounded-full overflow-hidden mb-5">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 4.6, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 14, letterSpacing: '0.02em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.05em' }}
              transition={{ duration: 2.1, ease: 'easeOut' }}
              className="text-sm sm:text-base font-medium text-slate-200 max-w-md leading-relaxed"
            >
              163 real Play Store reviews. Two fixes built for Bounce Daily riders.
            </motion.p>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.7, duration: 1.4 }}
              className="mt-3 text-xs font-mono text-amber-300/90"
            >
              by Mugdha Chatterjee
            </motion.span>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.9, y: 0 }}
              whileHover={{ scale: 1.05, opacity: 1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowIntro(false)}
              className="fixed bottom-8 right-8 bg-slate-800 hover:bg-amber-400 text-white hover:text-slate-950 border border-slate-600 hover:border-amber-300 px-6 py-3 rounded-full text-sm sm:text-base font-semibold tracking-wide shadow-lg transition-colors cursor-pointer"
            >
              Skip Intro →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER WITH THEME SWITCHER */}
      <header className={`backdrop-blur border-b sticky top-0 z-30 transition-colors duration-300 ${T.header}`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.img
              src="/bounce-logo.png"
              alt="Bounce Daily"
              style={{ width: '38px', height: '38px', flexShrink: 0 }}
              className="object-contain rounded-full cursor-pointer"
              animate={{ y: [0, -3.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              onClick={() => setShowIntro(true)}
              title="Replay opening intro"
            />
            <div>
              <h1 className={`font-semibold text-base tracking-tight leading-tight ${T.title}`}>
                Bounce Daily — Play Store Audit &amp; Rider Trust Fixes
              </h1>
              <p className={`text-[11px] ${T.muted}`}>
                Built from 163 real Play Store reviews · Mugdha Chatterjee
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            {/* Theme Switcher Pill */}
            <div className={`inline-flex p-0.5 rounded-lg border text-[11px] font-medium ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setTheme('dark')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-800 text-white shadow-2xs' : T.muted
                }`}
                title="Dark Slate Theme"
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  theme === 'light' ? 'bg-white text-slate-900 shadow-2xs' : T.muted
                }`}
                title="Clean Light Theme"
              >
                Light
              </button>
              <button
                onClick={() => setTheme('bounce')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  theme === 'bounce' ? 'bg-yellow-400 text-zinc-950 font-semibold shadow-2xs' : T.muted
                }`}
                title="Bounce Yellow & Black Theme"
              >
                Bounce Yellow
              </button>
            </div>

            <span className={`hidden sm:inline font-mono border px-2.5 py-1 rounded ${T.badge}`}>
              163 Reviews
            </span>
            <a
              href="https://github.com/Almostanerd"
              target="_blank"
              rel="noreferrer"
              className={`hidden md:inline underline underline-offset-4 ${T.muted} hover:opacity-80`}
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </header>

      {/* DESKTOP TOP NAVIGATION TABS */}
      <div className={`hidden md:block border-b transition-colors duration-300 ${T.navBar}`}>
        <div className="max-w-5xl mx-auto px-4 flex gap-6 text-sm font-medium">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative py-3.5 whitespace-nowrap transition-colors cursor-pointer ${
                tab === item.id ? T.tabActive : T.tabInactive
              }`}
            >
              {item.desktopLabel}
              {tab === item.id && (
                <motion.div
                  layoutId="tabIndicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${T.tabLine}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT (Extra bottom padding on mobile for bottom nav bar) */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6 flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* TAB 1: AUDIT */}
          {tab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className={`border rounded-lg p-5 transition-colors ${T.card}`}>
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                      Summary of 163 Recent Reviews
                    </p>
                    <h2 className={`text-xl font-bold mt-1 ${T.title}`}>
                      85 Negative (52.1%) vs. 78 Positive (47.9%)
                    </h2>
                    <p className={`text-sm mt-1 ${T.body}`}>
                      I read and tagged 163 recent Bounce Daily reviews on Google Play. Most 1-star reviews aren't about battery swaps—they happen because riders don't realize the ₹2,000 deposit requires <strong className={T.title}>45 days of active rental</strong> to unlock.
                    </p>
                  </div>
                  <div className={`flex items-center gap-3 border rounded-lg px-3.5 py-2.5 ${T.subCard}`}>
                    <BounceYellowScooter bounce={true} dark={isDark} style={{ width: '80px', height: '56px' }} />
                    <div className="text-xs space-y-1">
                      <div className={`font-semibold ${T.title}`}>Helpful Upvotes</div>
                      <div className={T.muted}>
                        Negative: <span className="font-mono font-semibold text-rose-500">431 votes</span>
                      </div>
                      <div className={T.muted}>
                        Positive: <span className="font-mono font-semibold text-emerald-500">32 votes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="mt-6 space-y-3.5">
                  {BREAKDOWN.map(b => (
                    <div
                      key={b.id}
                      onClick={() => setCatFilter(catFilter === b.id ? 'all' : b.id)}
                      className="cursor-pointer group"
                    >
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className={`${T.body} group-hover:text-rose-500 transition`}>
                          {b.label} ({b.count} reviews · {b.votes} helpful votes)
                        </span>
                        <span className={`font-mono font-semibold ${T.title}`}>{b.pct}%</span>
                      </div>
                      <div className={`w-full h-2.5 rounded overflow-hidden ${T.barTrack}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${b.pct}%` }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                          className={`${b.color} h-2.5`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomaly & Top Quotes */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`border rounded-lg p-5 ${T.anomalyCard}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${T.anomalyTitle}`}>
                    Interesting Pattern in Positive Reviews
                  </span>
                  <h3 className={`font-bold mt-1 ${T.title}`}>
                    62 of 78 Positive Reviews Name-Drop "Syed" or "E-City"
                  </h3>
                  <p className={`text-sm mt-2 leading-relaxed ${T.body}`}>
                    79.5% of positive reviews are short 1-liners praising specific hub staff (<em>"Syed in HSR"</em> appears 26 times; <em>"E-City hub"</em> appears 29 times), almost all posted between Nov 3–11 with 0–1 helpful votes. Two 1-star reviewers also noted staff asking for riders' phones at handover to submit 5-star ratings.
                  </p>
                  <p className={`text-xs mt-3 font-medium ${T.anomalyNote}`}>
                    Takeaway: Fixing upfront deposit clarity will improve retention far more than collecting prompted 5-star reviews at hubs.
                  </p>
                </div>

                <div className={`border rounded-lg p-5 space-y-3 ${T.card}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${T.muted}`}>
                    Most-Upvoted Rider Quotes
                  </span>
                  <div className="border-l-2 border-rose-500 pl-3 py-0.5">
                    <p className={`text-xs italic ${T.body}`}>
                      "Bounce takes ₹2,000 saying it is 'refundable.' But the hidden catch is that you need to continue using their service for 45 days to even become eligible."
                    </p>
                    <p className={`text-[11px] mt-0.5 font-mono ${T.muted}`}>— dsmack 2012 · 77 helpful votes</p>
                  </div>
                  <div className="border-l-2 border-amber-400 pl-3 py-0.5">
                    <p className={`text-xs italic ${T.body}`}>
                      "No footrest, no side mirrors, and no mobile holder were provided... mandatory 30 days minimum usage to get the security deposit refunded."
                    </p>
                    <p className={`text-[11px] mt-0.5 font-mono ${T.muted}`}>— Sajal Jain · 28 helpful votes</p>
                  </div>
                  <div className="border-l-2 border-orange-400 pl-3 py-0.5">
                    <p className={`text-xs italic ${T.body}`}>
                      "Whatever a bike shows like 75 km 80 km distance it can cover is a lie, it needs to change the battery every 20 to 25 km distance."
                    </p>
                    <p className={`text-[11px] mt-0.5 font-mono ${T.muted}`}>— TodaY · 4 helpful votes</p>
                  </div>
                </div>
              </div>

              {/* Searchable Raw Reviews Table */}
              <div className={`border rounded-lg p-5 space-y-3 ${T.card}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className={`text-sm font-bold ${T.title}`}>Browse All 163 Reviews</h3>
                    <p className={`text-xs ${T.muted}`}>Click any bar above to filter by category, or search keywords below.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {catFilter !== 'all' && (
                      <button
                        onClick={() => setCatFilter('all')}
                        className="text-xs bg-rose-500/15 text-rose-500 border border-rose-500/30 px-2.5 py-1.5 rounded font-medium cursor-pointer"
                      >
                        Clear filter ×
                      </button>
                    )}
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search '45 days', 'Syed', 'side stand'..."
                      className={`border rounded px-3 py-1.5 text-xs w-56 outline-none ${T.input}`}
                    />
                  </div>
                </div>

                <div className={`text-xs font-mono ${T.muted}`}>
                  Showing {filteredReviews.length} of 163 reviews (sorted by helpful votes)
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {filteredReviews.map(r => (
                    <div key={r.id} className={`border rounded p-3 text-xs ${T.subCard}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-semibold ${T.title}`}>
                          {r.a} <span className={`font-normal font-mono ml-1 ${T.muted}`}>{r.d}</span>
                        </span>
                        {r.v > 0 && (
                          <span className={`font-mono text-[11px] border px-2 py-0.5 rounded ${T.badge}`}>
                            {r.v} helpful
                          </span>
                        )}
                      </div>
                      <p className={`leading-relaxed ${T.body}`}>{r.t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PRICING & DEPOSIT ESTIMATOR */}
          {tab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className={`border rounded-lg p-5 ${T.card}`}
            >
              <div className={`flex flex-wrap justify-between items-center gap-2 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    Fix #1 · Show Costs Before KYC
                  </span>
                  <h2 className={`text-lg font-bold mt-0.5 ${T.title}`}>
                    Upfront Rent, Activation &amp; Deposit Unlock Estimator
                  </h2>
                  <p className={`text-xs mt-0.5 ${T.muted}`}>
                    Lets riders see exact daily take-home and the 45-day deposit rule before uploading Aadhaar/DL.
                  </p>
                </div>
                <div className={`flex gap-1 p-1 rounded text-xs font-medium ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      lang === 'en'
                        ? isDark
                          ? 'bg-slate-950 text-white shadow-sm'
                          : 'bg-white text-slate-900 shadow-sm'
                        : T.muted
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang('hi')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      lang === 'hi'
                        ? isDark
                          ? 'bg-slate-950 text-white shadow-sm'
                          : 'bg-white text-slate-900 shadow-sm'
                        : T.muted
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-5">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${T.body}`}>
                      {lang === 'hi' ? 'कितने दिन गाड़ी चलानी है?' : 'How many days do you plan to ride?'}{' '}
                      (<span className={`font-mono font-bold ${T.accentText}`}>{days} days</span>)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="75"
                      value={days}
                      onChange={e => {
                        setDays(Number(e.target.value));
                        setKycStep('idle');
                      }}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <div className={`flex justify-between text-[11px] font-mono mt-1 ${T.muted}`}>
                      <span>1 day</span>
                      <span>15 days</span>
                      <span className="text-emerald-500">45 days (Unlock)</span>
                      <span>60+ days</span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${T.body}`}>
                      {lang === 'hi' ? 'रोज़ के डिलीवरी ऑर्डर:' : 'Expected daily deliveries (Swiggy / Zomato / Zepto):'}{' '}
                      <span className={`font-mono font-bold ${T.title}`}>{orders} orders/day</span>
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={orders}
                      onChange={e => setOrders(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div className={`border rounded p-3.5 text-xs space-y-1.5 ${T.subCard}`}>
                    <div className={`font-semibold ${T.title}`}>
                      {lang === 'hi' ? 'पेमेंट से पहले ज़रूरी नियम:' : 'Plain-Language Rules Shown Before Payment:'}
                    </div>
                    {lang === 'hi' ? (
                      <ul className={`list-disc pl-4 space-y-1 ${T.body}`}>
                        <li>
                          <strong className={T.title}>45-दिन डिपॉज़िट नियम:</strong> ₹2,000 सिक्योरिटी डिपॉज़िट तभी वापस मिलेगा जब आप कम से कम <em>45 दिन</em> गाड़ी चलाएंगे।
                        </li>
                        <li>
                          <strong className={T.title}>60-दिन प्लान साइकिल:</strong> ₹1,000 एक्टिवेशन फीस 60 दिनों के लिए है। 60 दिन बाद दोबारा फीस लागू होगी।
                        </li>
                        <li>
                          <strong className={T.title}>असली रेंज:</strong> डिलीवरी बैग के साथ एक बैटरी में <strong className={T.title}>45–55 km</strong> की रेंज मिलेगी।
                        </li>
                      </ul>
                    ) : (
                      <ul className={`list-disc pl-4 space-y-1 ${T.body}`}>
                        <li>
                          <strong className={T.title}>45-Day Deposit Rule:</strong> Your ₹2,000 security deposit is 100% refundable <em>only after 45 active rental days</em>. Returning early forfeits deposit eligibility.
                        </li>
                        <li>
                          <strong className={T.title}>60-Day Plan Cycle:</strong> Onboarding fee (₹1,000) covers 60 days. Extending beyond Day 60 triggers a ₹1,000 renewal fee.
                        </li>
                        <li>
                          <strong className={T.title}>Real-World Range:</strong> Expect <strong className={T.title}>45–55 km</strong> per swap with a delivery bag (vs. 75 km unloaded cluster display).
                        </li>
                      </ul>
                    )}
                  </div>
                </div>

                {/* Right Card with Interactive KYC Animation */}
                <div className="bg-slate-950 border border-slate-800 text-white rounded-lg p-5 flex flex-col justify-between space-y-4 overflow-hidden relative">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-slate-400">
                        {lang === 'hi' ? 'सही किराया और बचत का हिसाब' : 'Transparent Cost & Net Take-Home'}
                      </span>
                      <span className="text-[11px] font-mono text-amber-300">
                        Unlock Date: {unlockDate}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                        <div className="text-[11px] text-slate-400">
                          {lang === 'hi' ? 'कुल किराया + फीस' : 'Total Rental + Fees'}
                        </div>
                        <motion.div
                          key={totalCost}
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: 1 }}
                          className="text-xl font-bold font-mono mt-0.5"
                        >
                          ₹{totalCost.toLocaleString('en-IN')}
                        </motion.div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          ₹{dailyRate}/day × {days}d + ₹{activationFee} fee
                        </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                        <div className="text-[11px] text-slate-400">
                          {lang === 'hi' ? 'अनुमानित शुद्ध कमाई' : 'Est. Net Rider Profit'}
                        </div>
                        <motion.div
                          key={netProfit}
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: 1 }}
                          className="text-xl font-bold font-mono text-emerald-400 mt-0.5"
                        >
                          {netProfit >= 0 ? '₹' : '-₹'}
                          {Math.abs(netProfit).toLocaleString('en-IN')}
                        </motion.div>
                        <div className="text-[11px] text-slate-500 mt-0.5">@ ₹55/order avg payout</div>
                      </div>
                    </div>

                    <div
                      className={`mt-4 p-3 rounded border text-xs leading-relaxed ${
                        daysShort > 0
                          ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                          : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                      }`}
                    >
                      {daysShort > 0 ? (
                        lang === 'hi' ? (
                          <>
                            <strong>चेतावनी:</strong> आप {days} दिन चुन रहे हैं। ₹2,000 डिपॉज़िट वापस पाने के लिए आपको{' '}
                            <strong>{daysShort} दिन और</strong> गाड़ी चलानी होगी।
                          </>
                        ) : (
                          <>
                            <strong>Deposit Lock Warning:</strong> At {days} days, your ₹2,000 security deposit will{' '}
                            <strong>NOT</strong> be refunded at return. You need <strong>{daysShort} more active days</strong>{' '}
                            to unlock refund eligibility.
                          </>
                        )
                      ) : lang === 'hi' ? (
                        <>
                          <strong>डिपॉज़िट अनलॉक:</strong> {days} दिन पूरे करने पर आपका ₹2,000 सिक्योरिटी डिपॉज़िट वापसी के लिए पूरी तरह पात्र होगा।
                        </>
                      ) : (
                        <>
                          <strong>Deposit Unlocked:</strong> Completing {days} days makes your ₹2,000 security deposit 100% eligible for refund upon clean vehicle handover.
                        </>
                      )}
                    </div>
                  </div>

                  {/* Animated KYC Confirmation Drawer */}
                  <AnimatePresence mode="wait">
                    {kycStep === 'locking' && (
                      <motion.div
                        key="locking"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-900 border border-amber-400/50 rounded-lg p-3.5 flex items-center justify-between"
                      >
                        <div className="text-xs">
                          <div className="font-semibold text-amber-300">Locking Plan Terms &amp; Opening KYC...</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Sending WhatsApp summary with {unlockDate} refund date
                          </div>
                        </div>
                        <motion.div
                          initial={{ x: -30 }}
                          animate={{ x: 10 }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                        >
                          <BounceYellowScooter riding={true} dark={true} style={{ width: '70px', height: '48px' }} />
                        </motion.div>
                      </motion.div>
                    )}

                    {kycStep === 'done' && (
                      <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-950/80 border border-emerald-600 rounded-lg p-3.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-300">
                            ✓ Terms Locked — Ready for DigiLocker KYC
                          </span>
                          <button
                            onClick={() => setKycStep('idle')}
                            className="text-[11px] text-emerald-400 underline cursor-pointer"
                          >
                            Edit plan
                          </button>
                        </div>
                        <p className="text-emerald-100/90 text-[11px] leading-relaxed">
                          Plan: <strong>{days} days</strong> (₹{totalCost.toLocaleString('en-IN')}) · ₹2,000 deposit unlocks on{' '}
                          <strong className="font-mono">{unlockDate}</strong>. Copy sent to rider WhatsApp before payment so there are zero surprises.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {kycStep === 'idle' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                        <span className="text-slate-400">
                          Upfront Deposit: <strong className="text-white font-mono">₹2,000</strong>
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            className="accent-amber-400"
                          />
                          <span className="text-slate-300">I understand the 45-day rule</span>
                        </label>
                      </div>
                      <motion.button
                        whileTap={agreed ? { scale: 0.98 } : {}}
                        disabled={!agreed}
                        onClick={handleKycClick}
                        className={`w-full py-2.5 rounded font-semibold text-xs uppercase tracking-wider transition ${
                          agreed
                            ? `${T.primaryBtn} cursor-pointer shadow-md`
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {agreed ? 'Proceed to Instant KYC →' : 'Acknowledge Terms Above to Unlock Booking'}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: HUB HANDOVER LOG */}
          {tab === 'handover' && (
            <motion.div
              key="handover"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className={`border rounded-lg p-5 ${T.card}`}
            >
              <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    Fix #2 · Stop Return Damage Disputes
                  </span>
                  <h2 className={`text-lg font-bold mt-0.5 ${T.title}`}>
                    30-Second Hub Handover &amp; Pre-Existing Fault Log
                  </h2>
                  <p className={`text-xs mt-0.5 ${T.muted}`}>
                    Addresses the 20% hardware complaint bucket (missing side stands, faulty brakes, and riders getting charged ₹660–₹1,500 at return for pre-existing scratches).
                  </p>
                </div>
                <motion.div
                  animate={justDispatched ? { x: [0, 35, 0] } : {}}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                >
                  <BounceYellowScooter
                    riding={justDispatched}
                    bounce={!justDispatched}
                    dark={isDark}
                    style={{ width: '96px', height: '64px' }}
                  />
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-5">
                <form onSubmit={addHandover} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${T.body}`}>Hub Location</label>
                      <select
                        value={hub}
                        onChange={e => setHub(e.target.value)}
                        className={`w-full border rounded px-2.5 py-2 text-xs ${T.input}`}
                      >
                        <option>HSR Sector 2</option>
                        <option>Electronic City Phase 1</option>
                        <option>Bilekahalli Hub</option>
                        <option>Koramangala 4th Block</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${T.body}`}>Scooter Plate / ID</label>
                      <input
                        type="text"
                        value={plate}
                        onChange={e => setPlate(e.target.value)}
                        className={`w-full border rounded px-2.5 py-2 text-xs font-mono ${T.input}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${T.body}`}>
                      Tap Missing / Pre-Damaged Parts (Exempts Rider at Return):
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['No Side Stand', 'Left Mirror Missing', 'Front Cowl Crack', 'No Phone Mount'].map(item => (
                        <label
                          key={item}
                          className={`flex items-center gap-2 p-2.5 border rounded cursor-pointer transition ${T.subCard} ${T.title}`}
                        >
                          <input
                            type="checkbox"
                            checked={faults.includes(item)}
                            onChange={() => toggleFault(item)}
                            className="accent-amber-400"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${T.body}`}>Battery Charge (%)</label>
                      <input
                        type="number"
                        value={soc}
                        onChange={e => setSoc(Number(e.target.value))}
                        min="10"
                        max="100"
                        className={`w-full border rounded px-2.5 py-2 text-xs font-mono ${T.input}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${T.body}`}>Brake &amp; Throttle Check</label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className={`w-full border rounded px-2.5 py-2 text-xs ${T.input}`}
                      >
                        <option value="PASS">PASS — Ready for Rider</option>
                        <option value="HOLD">HOLD — Send to Mechanic</option>
                      </select>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`w-full font-semibold py-2.5 rounded text-xs uppercase tracking-wider transition cursor-pointer ${T.primaryBtn}`}
                  >
                    {justDispatched ? '✓ Receipt Saved & Sent!' : 'Save Handover Receipt'}
                  </motion.button>
                </form>

                <div className={`border rounded-lg p-4 flex flex-col justify-between ${T.subCard}`}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider ${T.muted}`}>
                        Recent Hub Handovers
                      </span>
                      <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                        Auto-SMS to Rider
                      </span>
                    </div>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      <AnimatePresence initial={false}>
                        {logs.map(l => (
                          <motion.div
                            key={l.id}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border rounded p-3 text-xs ${T.card}`}
                          >
                            <div className="flex justify-between font-semibold">
                              <span className={`font-mono ${T.title}`}>
                                {l.plate} · {l.hub}
                              </span>
                              <span className={l.status === 'PASS' ? 'text-emerald-500' : 'text-rose-500'}>
                                {l.status} · {l.soc}% Charge
                              </span>
                            </div>
                            <p className={`mt-1 ${T.muted}`}>
                              Logged Pre-Existing:{' '}
                              <span className={`font-medium ${T.title}`}>
                                {l.faults && l.faults.length ? l.faults.join(', ') : 'None'}
                              </span>{' '}
                              ({l.note})
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                  <p className={`text-[11px] mt-3 border-t pt-2 ${T.muted} ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    Protects both riders and hub staff from return disputes and stops broken scooters from going back out.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: WEEK-1 GROUND PLAN */}
          {tab === 'field' && (
            <motion.div
              key="field"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className={`border rounded-lg p-5 space-y-5 ${T.card}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    Closing the Remote Gap
                  </span>
                  <h2 className={`text-lg font-bold mt-0.5 ${T.title}`}>
                    What I Want to Check on the Ground in Week 1
                  </h2>
                  <p className={`text-xs mt-1 ${T.body}`}>
                    App reviews only tell half the story—mostly angry riders who left or quick 5-stars at the hub. Before suggesting any product changes in Week 1, I’d spend two shifts at the <strong className={T.title}>HSR Sector 2</strong> and <strong className={T.title}>Bilekahalli</strong> hubs talking to 15–20 Swiggy, Zomato, and Zepto riders.
                  </p>
                </div>
                <BounceYellowScooter bounce={true} dark={isDark} style={{ width: '96px', height: '64px' }} />
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className={`border rounded p-4 space-y-2.5 ${T.subCard}`}>
                  <div className={`font-bold text-sm ${T.title}`}>5 Questions I’d Ask Riders at the Hub</div>
                  <ol className={`list-decimal pl-4 space-y-2 ${T.body}`}>
                    <li>
                      <strong className={T.accentText}>Deposit Rules:</strong> "When you first paid ₹2,000, did you know you had to ride 45 days to get it back—or did you find out later?"
                    </li>
                    <li>
                      <strong className={T.accentText}>Dinner-Rush Queues:</strong> "How much time did you lose yesterday waiting at a swap station between 7 PM and 10 PM?"
                    </li>
                    <li>
                      <strong className={T.accentText}>Real Battery Range:</strong> "With a full delivery bag, how many kilometers do you actually get before heading to swap?"
                    </li>
                    <li>
                      <strong className={T.accentText}>Damage Deductions:</strong> "Have you or anyone you know been charged at return for a scratch or puncture that was already there?"
                    </li>
                    <li>
                      <strong className={T.accentText}>Late-Night Breakdowns:</strong> "If your scooter stops at 11 PM, what do you actually do right now?"
                    </li>
                  </ol>
                </div>

                <div className={`border rounded p-4 space-y-3 ${T.subCard}`}>
                  <div className={`font-bold text-sm ${T.title}`}>3 Numbers I’d Look at in Week 1</div>
                  <div>
                    <div className={`font-semibold ${T.accentText}`}>1. How many new riders drop off before Day 45</div>
                    <p className={`mt-0.5 ${T.muted}`}>
                      Comparing early drop-offs (Weeks 1–2) against riders who stay past Day 45, and seeing how many tickets are about deposit refunds.
                    </p>
                  </div>
                  <div>
                    <div className={`font-semibold ${T.accentText}`}>2. Scooters coming back broken within 48 hours</div>
                    <p className={`mt-0.5 ${T.muted}`}>
                      How often a returned scooter gets handed out to the next rider and immediately gets a brake, battery, or accelerator complaint.
                    </p>
                  </div>
                  <div>
                    <div className={`font-semibold ${T.accentText}`}>3. Riders reaching a swap station and leaving empty-handed</div>
                    <p className={`mt-0.5 ${T.muted}`}>
                      Tracking how often riders open the app near a swap station during peak hours but don't complete a swap—a quick sign of empty racks.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-Friendly) */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur grid grid-cols-4 text-[11px] font-medium transition-colors duration-300 ${T.header}`}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative py-2.5 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              tab === item.id ? T.tabActive : T.tabInactive
            }`}
          >
            <span className="text-sm leading-none">{item.icon}</span>
            <span>{item.mobileLabel}</span>
            {tab === item.id && (
              <motion.div
                layoutId="mobileTabIndicator"
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                className={`absolute top-0 left-3 right-3 h-0.5 ${T.tabLine}`}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

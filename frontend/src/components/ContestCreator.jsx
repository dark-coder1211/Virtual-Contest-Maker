import React, { useState } from 'react';
import { Sparkles, Play, ShieldAlert, Award, Flame, Zap, Clock, Hash, CheckCircle2 } from 'lucide-react';

const TIERS = [
  {
    id: 'EASY',
    title: 'Easy Contest',
    division: 'Div. 4 Equivalent',
    ratingRange: '800 - 1350',
    color: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: Zap,
    desc: 'Beginner-friendly contest modeling Codeforces Division 4. Focus on implementation, fundamental greedy, basic math, and simulation.'
  },
  {
    id: 'MEDIUM',
    title: 'Medium Contest',
    division: 'Div. 3 Equivalent',
    ratingRange: '800 - 1800',
    color: 'from-cyan-500/20 via-blue-600/10 to-transparent',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    icon: Flame,
    desc: 'Classic Division 3 challenge. Balances logic, two pointers, number theory, binary search, and dynamic programming.'
  },
  {
    id: 'HARD',
    title: 'Hard Contest',
    division: 'Div. 2 Equivalent',
    ratingRange: '1100 - 2200+',
    color: 'from-purple-500/20 via-pink-600/10 to-transparent',
    border: 'border-purple-500/40 hover:border-purple-400',
    badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    icon: Award,
    desc: 'High-intensity Division 2 experience. Tests advanced algorithms, graph theory, trees, dynamic programming, and data structures.'
  }
];

export default function ContestCreator({ onStartContest, isCreating }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('EASY');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [problemCount, setProblemCount] = useState(6);
  const [customTitle, setCustomTitle] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    onStartContest({
      difficulty: selectedDifficulty,
      duration_minutes: durationMinutes,
      problem_count: problemCount,
      title: customTitle.trim() || undefined
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Hero Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unified Competitive Programming Arena</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Create a Multi-Platform Virtual Contest
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Combines curated problems from <span className="text-sky-400 font-medium">Codeforces</span>,{' '}
          <span className="text-amber-400 font-medium">CodeChef</span>, and{' '}
          <span className="text-emerald-400 font-medium">AtCoder</span>. All problems are normalized to the{' '}
          <span className="text-indigo-400 font-medium">Codeforces rating scale</span> and ordered from easiest to hardest!
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-8">
        {/* Step 1: Select Difficulty Presets */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            1. Select Contest Difficulty Preset
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedDifficulty === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedDifficulty(tier.id)}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 bg-gradient-to-b ${tier.color} bg-slate-900/90 ${
                    isSelected
                      ? `${tier.border} ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-950/40 scale-[1.02]`
                      : 'border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
                        <Icon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{tier.title}</h3>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${tier.badge}`}>
                          {tier.division}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                    )}
                  </div>

                  <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                    {tier.desc}
                  </p>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Rating Target (CF Eq):</span>
                    <span className="font-mono font-semibold text-slate-200">{tier.ratingRange}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Settings (Duration & Problem Count) */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            2. Contest Rules & Parameters
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Duration</span>
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value={60}>1 hour (60 mins)</option>
                <option value={90}>1.5 hours (90 mins)</option>
                <option value={120}>2 hours (120 mins) [Standard]</option>
                <option value={150}>2.5 hours (150 mins)</option>
                <option value={180}>3 hours (180 mins)</option>
              </select>
            </div>

            {/* Problem Count */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center space-x-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>Number of Problems</span>
              </label>
              <select
                value={problemCount}
                onChange={(e) => setProblemCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value={4}>4 Problems (A to D)</option>
                <option value={5}>5 Problems (A to E)</option>
                <option value={6}>6 Problems (A to F) [Standard]</option>
                <option value={7}>7 Problems (A to G)</option>
              </select>
            </div>

            {/* Custom Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Custom Contest Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Saturday Night Speedrun"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Platform Diversity Highlight */}
          <div className="mt-5 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              <span>
                Problems will be automatically selected from <b>Codeforces</b>, <b>CodeChef</b>, and <b>AtCoder</b>, then ordered by normalized rating.
              </span>
            </div>
            <span className="font-mono text-indigo-400 hidden sm:inline">100% Calibrated</span>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/25 text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isCreating ? 'Generating Contest Arena...' : 'Generate & Enter Virtual Contest'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

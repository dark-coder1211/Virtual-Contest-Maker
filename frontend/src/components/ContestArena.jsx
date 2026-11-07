import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  ChevronRight, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Flag,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContestArena({ 
  participation, 
  onSync, 
  onFinish, 
  onManualMark, 
  onExit,
  isSyncing 
}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const contest = participation?.contest;
  const problems = participation?.problem_statuses || [];

  // Countdown Timer
  useEffect(() => {
    if (!participation || participation.is_finished) return;

    const startTime = new Date(participation.start_time).getTime();
    const durationMs = (contest?.duration_minutes || 120) * 60 * 1000;
    const endTime = startTime + durationMs;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, endTime - now);
      setTimeLeft(diff);

      if (diff === 0 && !participation.is_finished) {
        onFinish();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [participation, contest]);

  // Periodic Auto-Sync every 45 seconds during the contest
  useEffect(() => {
    if (!participation || participation.is_finished) return;

    const autoSyncInterval = setInterval(() => {
      triggerSync(true);
    }, 45000);

    return () => clearInterval(autoSyncInterval);
  }, [participation?.id]);

  const triggerSync = async (isAuto = false) => {
    if (isSyncing) return;
    try {
      const res = await onSync();
      if (res?.sync_result?.newly_solved?.length > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setSyncStatusMsg(`🎉 Accepted: Problem ${res.sync_result.newly_solved.join(', ')} marked solved!`);
      } else if (!isAuto) {
        setSyncStatusMsg('Synced with Codeforces, CodeChef & AtCoder. No new AC submissions found.');
      }
      setTimeout(() => setSyncStatusMsg(''), 6000);
    } catch (err) {
      setSyncStatusMsg('Sync check encountered a temporary error. Try again.');
      setTimeout(() => setSyncStatusMsg(''), 5000);
    }
  };

  const formatTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'CODEFORCES':
        return {
          label: 'Codeforces',
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          dot: 'bg-sky-400'
        };
      case 'CODECHEF':
        return {
          label: 'CodeChef',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400'
        };
      case 'ATCODER':
        return {
          label: 'AtCoder',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400'
        };
      default:
        return {
          label: platform,
          bg: 'bg-slate-700 text-slate-300 border-slate-600',
          dot: 'bg-slate-400'
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Top Navigation & Contest Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        
        <div className="flex items-start space-x-4">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {contest?.difficulty_display || contest?.difficulty}
              </span>
              <span className="text-xs text-slate-400">
                • {problems.length} Problems
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {contest?.title}
            </h1>
          </div>
        </div>

        {/* Live Timer & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Timer Card */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
            <Clock className={`w-4 h-4 ${timeLeft < 600000 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Time Remaining</div>
              <div className={`text-base font-mono font-bold ${timeLeft < 600000 ? 'text-rose-400' : 'text-slate-100'}`}>
                {participation?.is_finished ? 'Contest Ended' : formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Solved / Score Card */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Score & Solved</div>
              <div className="text-base font-mono font-bold text-amber-400">
                {participation?.total_score || 0} pts <span className="text-slate-400 text-xs font-normal">({participation?.solved_count || 0}/{problems.length})</span>
              </div>
            </div>
          </div>

          {/* Sync Button */}
          {!participation?.is_finished && (
            <button
              onClick={() => triggerSync(false)}
              disabled={isSyncing}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Submissions'}</span>
            </button>
          )}

          {/* Finish Button */}
          {!participation?.is_finished ? (
            <button
              onClick={onFinish}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 text-xs font-medium px-3 py-2.5 rounded-xl transition cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Finish Contest</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              Completed
            </div>
          )}

        </div>

      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{syncStatusMsg}</span>
          </div>
          <button onClick={() => setSyncStatusMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Problem Ordering Info Banner */}
      <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Problems are arranged strictly in <b>ascending order of Codeforces-equivalent difficulty</b>. Solve on the respective platform and click <b>Sync Submissions</b> to record your AC!
          </span>
        </div>
      </div>

      {/* Problem Matrix Table / Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800/80">
          {problems.map((statusObj) => {
            const cp = statusObj.contest_problem;
            const prob = cp.problem;
            const platformBadge = getPlatformBadge(prob.platform);
            const isSolved = statusObj.is_solved;

            return (
              <div 
                key={statusObj.id} 
                className={`p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSolved ? 'bg-emerald-950/10 hover:bg-emerald-950/20' : 'hover:bg-slate-800/40'
                }`}
              >
                
                {/* Left: Letter + Title + Platform + Tags */}
                <div className="flex items-start space-x-4">
                  {/* Letter Box */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg font-mono shrink-0 shadow-md ${
                    isSolved 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80'
                  }`}>
                    {cp.letter_index}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center space-x-1 font-medium ${platformBadge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${platformBadge.dot}`}></span>
                        <span>{platformBadge.label}</span>
                      </span>

                      <span className="text-[11px] font-mono text-slate-400">
                        ID: {prob.problem_id}
                      </span>

                      {prob.tags && (
                        <span className="text-[11px] text-slate-500">
                          • {prob.tags.split(',').slice(0, 2).join(',')}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <span>{prob.title}</span>
                    </h2>

                    {/* Rating Breakdown Pill */}
                    <div className="flex items-center space-x-3 text-xs pt-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-500">CF Equivalent:</span>
                        <span className="font-mono font-bold text-indigo-400">{prob.normalized_cf_rating}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-500">Native Rating:</span>
                        <span className="font-mono text-slate-400">{prob.original_rating}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-500">Points:</span>
                        <span className="font-mono text-amber-400 font-semibold">{cp.points}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Solved Status & Action Buttons */}
                <div className="flex items-center space-x-3 self-end md:self-center">
                  
                  {/* Status Indicator */}
                  {isSolved ? (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>SOLVED</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs font-medium">
                      <XCircle className="w-4 h-4 text-slate-500" />
                      <span>Unsolved</span>
                    </div>
                  )}

                  {/* Open & Solve Link */}
                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                  >
                    <span>Open & Solve</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Manual Mark / Test Toggle button */}
                  <button
                    onClick={() => onManualMark(cp.id)}
                    title={isSolved ? "Mark as unsolved" : "Manually mark solved (for testing or offline solve)"}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
                  >
                    <CheckCircle className={`w-4 h-4 ${isSolved ? 'text-emerald-400' : 'text-slate-500'}`} />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Contest Finish Modal / Banner */}
      {participation?.is_finished && (
        <div className="bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 rounded-2xl p-6 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Contest Finished!</h2>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Great performance! You solved <b className="text-emerald-400">{participation.solved_count} out of {problems.length}</b> problems 
            and earned a total score of <b className="text-amber-400">{participation.total_score} points</b>.
          </p>
          <div className="pt-2">
            <button
              onClick={onExit}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Back to Contest Creator
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

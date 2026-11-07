import React, { useState, useEffect } from 'react';
import { contestApi } from '../api';
import { Trophy, Clock, Calendar, CheckCircle, ArrowRight, History } from 'lucide-react';

export default function ContestHistory({ onResumeContest }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await contestApi.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'EASY':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MEDIUM':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'HARD':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Virtual Contest History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track your performance and review past multi-platform contests
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">
          Loading contest history...
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No Virtual Contests Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't participated in any virtual contests yet. Create one from the Contest Arena to start testing your skills!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((part) => {
            const contest = part.contest;
            const formattedDate = new Date(part.start_time).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const totalProblems = part.problem_statuses?.length || 0;

            return (
              <div
                key={part.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getTierColor(contest.difficulty)}`}>
                      {contest.difficulty_display || contest.difficulty}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </span>
                    {part.is_finished ? (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                        Finished
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-mono animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {contest.title}
                  </h3>

                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300 font-mono font-semibold">{part.solved_count} / {totalProblems}</span> Solved
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 font-mono font-bold">{part.total_score}</span> Points
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{contest.duration_minutes} mins</span>
                    </span>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <button
                    onClick={() => onResumeContest(part)}
                    className="flex items-center space-x-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    <span>{part.is_finished ? 'Review Arena' : 'Resume Contest'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

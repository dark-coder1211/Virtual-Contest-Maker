import React, { useState, useEffect } from 'react';
import { problemApi } from '../api';
import { Search, Filter, Calculator, ExternalLink, ArrowRight, BookOpen, Layers } from 'lucide-react';

export default function ProblemBank() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  // Interactive Calculator State
  const [calcPlatform, setCalcPlatform] = useState('ATCODER');
  const [calcInputRating, setCalcInputRating] = useState(800);
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, [platformFilter, tierFilter]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (platformFilter) params.platform = platformFilter;
      if (tierFilter) params.tier = tierFilter;
      if (search) params.search = search;
      const data = await problemApi.getProblems(params);
      setProblems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  const runCalculation = async () => {
    try {
      const res = await problemApi.convertRating(calcPlatform, calcInputRating);
      setCalcResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runCalculation();
  }, [calcPlatform, calcInputRating]);

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'CODEFORCES':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'CODECHEF':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'ATCODER':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">
      
      {/* Interactive Normalizer & Calculator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Rating Normalization Engine</h2>
            <p className="text-xs text-slate-400">
              Live calibration parameter mapping CodeChef and AtCoder ratings to the standard Codeforces rating scale.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Input Platform */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Source Platform</label>
            <select
              value={calcPlatform}
              onChange={(e) => setCalcPlatform(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ATCODER">AtCoder (Kenkoooo Difficulty)</option>
              <option value="CODECHEF">CodeChef (Problem Rating)</option>
              <option value="CODEFORCES">Codeforces (Baseline Standard)</option>
            </select>
          </div>

          {/* Input Native Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Original Platform Rating
            </label>
            <input
              type="number"
              min="1"
              max="3500"
              step="50"
              value={calcInputRating}
              onChange={(e) => setCalcInputRating(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Computed Codeforces Equivalent Output */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-indigo-300 uppercase">Codeforces Equivalent</div>
              <div className="text-2xl font-mono font-extrabold text-white">
                {calcResult ? calcResult.normalized_cf_rating : '...'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {calcResult?.difficulty_tier === 'EASY' ? 'Div. 4' : calcResult?.difficulty_tier === 'MEDIUM' ? 'Div. 3' : 'Div. 2'}
              </span>
            </div>
          </div>

        </div>

        {/* Formula breakdown */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>
              <b>Mapping Principle:</b> Codeforces ratings start at 800. AtCoder grey/brown (&lt;1200) and CodeChef beginner (&lt;1600) problems are mapped monotonically into CF 800-1500.
            </span>
          </div>
          <span className="font-mono text-indigo-400 text-[11px]">Strict Monotonic Ordering</span>
        </div>
      </div>

      {/* Problem Catalog */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Calibrated Problem Bank</span>
            </h2>
            <p className="text-xs text-slate-400">
              Showing {problems.length} problems arranged by increasing normalized Codeforces rating
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Platforms</option>
              <option value="CODEFORCES">Codeforces</option>
              <option value="CODECHEF">CodeChef</option>
              <option value="ATCODER">AtCoder</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Tiers</option>
              <option value="EASY">Easy (Div. 4)</option>
              <option value="MEDIUM">Medium (Div. 3)</option>
              <option value="HARD">Hard (Div. 2)</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-40 sm:w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Problem</th>
                <th className="px-4 py-3">Native Rating</th>
                <th className="px-4 py-3 text-indigo-400 font-bold">CF Equivalent</th>
                <th className="px-4 py-3">Preset Tier</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    Loading problem bank...
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No problems found matching criteria.
                  </td>
                </tr>
              ) : (
                problems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getPlatformColor(prob.platform)}`}>
                        {prob.platform_display}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200">{prob.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: {prob.problem_id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {prob.original_rating}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-300">
                      {prob.normalized_cf_rating}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-mono text-slate-400">
                        {prob.difficulty_tier_display}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

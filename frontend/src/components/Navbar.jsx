import React from 'react';
import { Trophy, User, LogOut, Link2, Calculator, History, Swords } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onOpenHandles, onLogout, activeTab, setActiveTab }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('arena')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Virtual Contest Maker
            </span>
            <div className="text-[11px] text-slate-400 font-mono -mt-1">
              CF • CodeChef • AtCoder
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('arena')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'arena'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Contest Arena</span>
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'problems'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Problem Bank & Normalizer</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'history'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>My Contests</span>
          </button>
        </nav>

        {/* User / Platform Handles Section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              {/* Linked Platform Pills */}
              <button
                onClick={onOpenHandles}
                title="Click to update platform handles"
                className="hidden lg:flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded-lg text-xs transition"
              >
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${user.codeforces_handle ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`}></span>
                  <span className="text-slate-400">CF:</span>
                  <span className="font-semibold text-sky-300 font-mono">{user.codeforces_handle || 'None'}</span>
                </div>
                <div className="w-[1px] h-3 bg-slate-700"></div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${user.codechef_handle ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></span>
                  <span className="text-slate-400">CC:</span>
                  <span className="font-semibold text-amber-300 font-mono">{user.codechef_handle || 'None'}</span>
                </div>
                <div className="w-[1px] h-3 bg-slate-700"></div>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${user.atcoder_handle ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                  <span className="text-slate-400">AC:</span>
                  <span className="font-semibold text-emerald-300 font-mono">{user.atcoder_handle || 'None'}</span>
                </div>
                <Link2 className="w-3.5 h-3.5 text-indigo-400 ml-1" />
              </button>

              <button
                onClick={onOpenHandles}
                className="lg:hidden text-xs bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-300 flex items-center space-x-1"
              >
                <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Handles</span>
              </button>

              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <span className="text-xs font-medium text-slate-300 font-mono hidden sm:inline">
                  {user.username}
                </span>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-indigo-600/20 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login / Register</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

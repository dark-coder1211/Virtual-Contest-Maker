import React, { useState } from 'react';
import { X, Check, Link2, ExternalLink, ShieldCheck } from 'lucide-react';
import { authApi } from '../api';

export default function HandleModal({ user, onClose, onUpdated }) {
  const [cfHandle, setCfHandle] = useState(user?.codeforces_handle || '');
  const [ccHandle, setCcHandle] = useState(user?.codechef_handle || '');
  const [acHandle, setAcHandle] = useState(user?.atcoder_handle || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authApi.updateHandles({
        codeforces_handle: cfHandle.trim(),
        codechef_handle: ccHandle.trim(),
        atcoder_handle: acHandle.trim(),
      });
      onUpdated(updated);
      setSuccessMsg('Platform handles updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Link Platform Handles</h3>
              <p className="text-xs text-slate-400">Synchronize solve status across platforms</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-center text-xs flex items-center justify-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Codeforces */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-sky-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  <span>Codeforces Handle</span>
                </label>
                {cfHandle && (
                  <a
                    href={`https://codeforces.com/profile/${cfHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-500 hover:text-sky-400 flex items-center space-x-0.5"
                  >
                    <span>view</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. tourist, neal"
                value={cfHandle}
                onChange={(e) => setCfHandle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* CodeChef */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>CodeChef Handle</span>
                </label>
                {ccHandle && (
                  <a
                    href={`https://www.codechef.com/users/${ccHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-500 hover:text-amber-400 flex items-center space-x-0.5"
                  >
                    <span>view</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. gennady"
                value={ccHandle}
                onChange={(e) => setCcHandle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* AtCoder */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>AtCoder Handle</span>
                </label>
                {acHandle && (
                  <a
                    href={`https://atcoder.jp/users/${acHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-500 hover:text-emerald-400 flex items-center space-x-0.5"
                  >
                    <span>view</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. tourist, chokudai"
                value={acHandle}
                onChange={(e) => setAcHandle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving Handles...' : 'Save & Sync Handles'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

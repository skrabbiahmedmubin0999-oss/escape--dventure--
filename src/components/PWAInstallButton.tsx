import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { sound } from '../audio/soundSystem';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone installed app, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop installation flow
  if (isInstallable) {
    return (
      <button
        onClick={() => {
          sound.playClick();
          install();
        }}
        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95 border border-emerald-200"
      >
        <Download className="w-4 h-4 text-slate-950" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari installation flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            sound.playClick();
            setShowIOSGuide(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-extrabold text-xs uppercase tracking-wider border border-emerald-500/40 shadow-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <Share className="w-4 h-4 text-emerald-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-6 shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white uppercase tracking-tight">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                1. Tap the <strong className="text-emerald-400">Share</strong> button in the Safari toolbar below.<br />
                2. Scroll down the action sheet and tap <strong className="text-emerald-400">Add to Home Screen</strong>.<br />
                3. Launch <strong>Escape3D</strong> anytime from your home screen for full offline play!
              </p>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black uppercase text-slate-950 hover:bg-emerald-400 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

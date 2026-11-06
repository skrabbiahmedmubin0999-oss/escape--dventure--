import React, { useState } from 'react';
import { X, QrCode, Copy, Check, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { sound } from '../audio/soundSystem';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const gameUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(gameUrl)}`;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-100 overflow-hidden max-h-[90dvh] overflow-y-auto">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">Scan & Install App</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Virus-Free & HTTPS Secure PWA</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-5 shadow-inner">
          <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-emerald-500/30 mb-3 relative group">
            <img
              src={qrCodeUrl}
              alt="Escape Adventure Game QR Code"
              className="w-44 h-44 object-contain rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30 mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Scan to Install on Phone Home Screen</span>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Scan with your phone camera. Prompt will appear to <strong>Add to Home Screen</strong> for offline play!
          </p>
        </div>

        {/* URL Copy Section */}
        <div className="space-y-1.5 mb-5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Secure HTTPS Game Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={gameUrl}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono w-full select-all focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleCopy}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider text-center transition-all shadow-lg cursor-pointer"
        >
          Got It, Start Playing
        </button>
      </div>
    </div>
  );
};

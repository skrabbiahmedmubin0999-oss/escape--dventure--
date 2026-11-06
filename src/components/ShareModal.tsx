import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, ShieldCheck, Smartphone, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { sound } from '../audio/soundSystem';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const gameUrl = window.location.href;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(gameUrl, { width: 240, margin: 2, color: { dark: '#020617', light: '#ffffff' } })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate local QR code', err));
    }
  }, [isOpen, gameUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Escape Adventure: 3D Island Quest',
          text: 'Play this amazing 3D adventure escape game on your mobile phone!',
          url: gameUrl,
        });
      } catch (err) {
        console.warn('Native share cancelled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative text-slate-100 overflow-hidden max-h-[88dvh] overflow-y-auto custom-scrollbar">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-100">Local QR & Share</h2>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-400 font-semibold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>100% Offline-Capable Local QR</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4 shadow-inner">
          <div className="bg-white p-2.5 rounded-2xl shadow-xl border-2 border-emerald-500/30 mb-2.5 relative group">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Escape Adventure Local QR Code"
                className="w-36 h-36 xs:w-44 xs:h-44 object-contain rounded-lg"
              />
            ) : (
              <div className="w-36 h-36 xs:w-44 xs:h-44 flex items-center justify-center text-slate-400 text-xs font-mono">
                Generating QR...
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Scan to Install on Phone</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 text-center leading-normal">
            Scan with phone camera. Prompt will appear to <strong>Add to Home Screen</strong> for full offline play!
          </p>
        </div>

        {/* URL Copy & Share Section */}
        <div className="space-y-2.5 mb-4 shrink-0">
          <label className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Direct Game Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={gameUrl}
              className="min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono w-full select-all focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleCopy}
              className="min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all shrink-0 cursor-pointer active:scale-95"
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

          {/* Native Web Share Button */}
          <button
            onClick={handleNativeShare}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Share Game Link</span>
          </button>
        </div>

        {/* Done Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider text-center transition-all shadow-lg cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
        >
          Got It, Start Playing
        </button>
      </div>
    </div>
  );
};

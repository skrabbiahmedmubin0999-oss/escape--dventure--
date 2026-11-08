import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, Smartphone, Share2, Download, ExternalLink, Globe } from 'lucide-react';
import * as QRCode from 'qrcode';
import { sound } from '../audio/soundSystem';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Derives the active, working URL for the game.
 * Uses window.location.origin directly (e.g. ais-dev-...) so that the URL is 100%
 * live and active, preventing 404 "Page Not Found" errors on unshared preview subdomains.
 */
export const getShareableGameUrl = (): string => {
  const DEFAULT_ACTIVE_URL = 'https://ais-dev-b2xcvwzcvvejw6g3oiwxdi-296839334615.asia-east1.run.app';

  if (typeof window === 'undefined') {
    return DEFAULT_ACTIVE_URL;
  }

  try {
    // 1. If valid window.location.origin is present, use it directly (e.g. https://ais-dev-...)
    if (window.location && window.location.origin && window.location.origin.startsWith('http')) {
      return window.location.origin;
    }

    // 2. Check window.location.href (strip query and hash for a clean URL)
    if (window.location && window.location.href && window.location.href.startsWith('http')) {
      const cleanUrl = window.location.href.split('#')[0].split('?')[0];
      return cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
    }

    // 3. If running inside iframe with document.referrer
    if (document.referrer && document.referrer.startsWith('http')) {
      const cleanReferrer = document.referrer.split('#')[0].split('?')[0];
      return cleanReferrer.endsWith('/') ? cleanReferrer.slice(0, -1) : cleanReferrer;
    }
  } catch (err) {
    console.debug('Error detecting game URL:', err);
  }

  return DEFAULT_ACTIVE_URL;
};

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('/game-download-qr.png');
  const [isLoading, setIsLoading] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const gameUrl = getShareableGameUrl();

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setGenerationError(null);

    const generateQR = async () => {
      try {
        const qrLib = (QRCode as any).default || QRCode;

        // 1. Generate Vector SVG for instantaneous, zero-latency DOM rendering
        const svgString = await qrLib.toString(gameUrl, {
          type: 'svg',
          width: 256,
          margin: 2,
          color: { dark: '#020617', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });

        // 2. Generate PNG Data URL for downloading as an image file
        const dataUrl = await qrLib.toDataURL(gameUrl, {
          width: 512,
          margin: 2,
          color: { dark: '#020617', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });

        if (isMounted) {
          setQrSvg(svgString);
          setQrDataUrl(dataUrl);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Local QR Code Generation error:', err);
        if (isMounted) {
          setGenerationError('Failed to generate local QR code. Please copy the link below.');
          setIsLoading(false);
        }
      }
    };

    generateQR();

    return () => {
      isMounted = false;
    };
  }, [isOpen, gameUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    sound.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(gameUrl).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQrImage = () => {
    sound.playClick();
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = 'escape-shadow-assassin-qr.png';
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    sound.playClick();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ESCAPE: Shadow Assassin (3D)',
          text: 'Play ESCAPE: Shadow Assassin 3D on mobile or PC. Instant install & offline gameplay!',
          url: gameUrl,
        });
      } catch (err) {
        console.warn('Native share dismissed or not supported', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Download Game QR Code Modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 font-sans pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-5 sm:p-7 max-w-md landscape:max-w-2xl md:max-w-2xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative text-slate-100 ring-1 ring-white/10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92dvh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <QrCode className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                <span>Game Download QR Code</span>
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400">
                গেম ডাউনলোড কিউআর কোড • 100% Active Live Link
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center group active:scale-90 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Responsive Body: Stacks on portrait, side-by-side on landscape / desktop */}
        <div className="flex flex-col landscape:flex-row md:flex-row gap-5 sm:gap-6 items-center landscape:items-stretch md:items-stretch my-auto">
          {/* Left Column: QR Code Display Frame */}
          <div className="flex flex-col items-center justify-center bg-white/5 rounded-3xl p-4 sm:p-5 border border-white/10 shrink-0 w-full landscape:w-auto md:w-auto relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.25)] border-4 border-emerald-400/40 mb-3 relative z-10 transition-transform group-hover:scale-[1.02] duration-300 flex items-center justify-center w-44 h-44 xs:w-48 xs:h-48">
              {isLoading && !qrSvg ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 text-xs font-mono gap-2">
                  <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                  <span className="font-bold text-slate-600 text-[11px]">Generating...</span>
                </div>
              ) : qrSvg ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : generationError ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-red-600 text-xs font-mono p-2 text-center gap-1">
                  <X className="w-6 h-6 text-red-500" />
                  <span className="text-[10px]">{generationError}</span>
                </div>
              ) : (
                <img
                  src="/game-download-qr.png"
                  alt="Game QR Code"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Status Pill & Download Image Button */}
            <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>Live URL Active</span>
              </div>

              {qrDataUrl && (
                <button
                  onClick={handleDownloadQrImage}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Download QR Image (PNG)"
                >
                  <Download className="w-3 h-3" />
                  <span>Save PNG</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Information, Links & Action Controls */}
          <div className="flex flex-col justify-between flex-1 gap-4 w-full text-left">
            {/* Bengali & English Guide */}
            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>স্ক্যান বা ক্লিক করে খেলুন</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                যেকোনো স্মার্টফোনের ক্যামেরা দিয়ে কিউআর কোডটি স্ক্যান করুন অথবা নিচের লিংকে ক্লিক করে যেকোনো ডিভাইসে গেমটি খেলুন ও ইনস্টল করুন।
              </p>
            </div>

            {/* URL Input Box & Copy Button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Active Live Web Address
                </label>
                {copied && (
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3 h-3" /> Copied!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 focus-within:border-emerald-500/50 transition-colors">
                <input
                  type="text"
                  readOnly
                  value={gameUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="bg-transparent border-none px-2 py-1 text-xs text-slate-200 font-mono w-full select-all focus:outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="w-9 h-9 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 shrink-0 cursor-pointer"
                  title="Copy Game URL"
                  aria-label="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Actions: Share, Open in Browser */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleNativeShare}
                className="py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Share Link</span>
              </button>

              <a
                href={gameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Link</span>
              </a>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center cursor-pointer shrink-0 mt-1"
            >
              Close & Return to Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

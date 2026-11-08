import React from 'react';
import { NotificationToast as ToastItem } from '../game/types';
import { Coins, Sparkles, Trophy, Key, CheckCircle, ShieldAlert, Package, Compass, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center gap-3.5 w-full max-w-xs sm:max-w-sm pointer-events-none text-center">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          let icon = <Sparkles className="w-5 h-5 text-amber-400" />;
          let accentColor = 'text-amber-400';
          let bgColor = 'bg-amber-400/10';
          let borderColor = 'border-amber-400/30';

          if (toast.type === 'coin') {
            icon = <Coins className="w-5 h-5 text-yellow-400" />;
            accentColor = 'text-yellow-400';
            bgColor = 'bg-yellow-400/10';
            borderColor = 'border-yellow-400/30';
          } else if (toast.type === 'xp') {
            icon = <Sparkles className="w-5 h-5 text-cyan-400" />;
            accentColor = 'text-cyan-400';
            bgColor = 'bg-cyan-400/10';
            borderColor = 'border-cyan-400/30';
          } else if (toast.type === 'chest') {
            icon = <Package className="w-5 h-5 text-amber-300" />;
            accentColor = 'text-amber-300';
            bgColor = 'bg-amber-400/15';
            borderColor = 'border-amber-400/40';
          } else if (toast.type === 'puzzle') {
            icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
            accentColor = 'text-emerald-400';
            bgColor = 'bg-emerald-400/10';
            borderColor = 'border-emerald-400/30';
          } else if (toast.type === 'checkpoint') {
            icon = <Compass className="w-5 h-5 text-sky-400" />;
            accentColor = 'text-sky-400';
            bgColor = 'bg-sky-400/10';
            borderColor = 'border-sky-400/30';
          } else if (toast.type === 'achievement') {
            icon = <Trophy className="w-5 h-5 text-yellow-300" />;
            accentColor = 'text-yellow-300';
            bgColor = 'bg-yellow-400/20';
            borderColor = 'border-yellow-400/50';
          } else if (toast.type === 'key') {
            icon = <Key className="w-5 h-5 text-amber-400" />;
            accentColor = 'text-amber-400';
            bgColor = 'bg-amber-400/10';
            borderColor = 'border-amber-400/40';
          } else if (toast.type === 'survival') {
            icon = <ShieldAlert className="w-5 h-5 text-cyan-300" />;
            accentColor = 'text-cyan-300';
            bgColor = 'bg-cyan-400/15';
            borderColor = 'border-cyan-400/40';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              layout
              onClick={() => onDismiss(toast.id)}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all group cursor-pointer bg-slate-900/80 ${borderColor}`}
            >
              <div className={`p-2 rounded-xl shrink-0 border border-white/5 ${bgColor}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${accentColor}`}>{toast.title}</h4>
                <p className="text-xs font-bold text-white leading-tight mt-1">{toast.message}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};


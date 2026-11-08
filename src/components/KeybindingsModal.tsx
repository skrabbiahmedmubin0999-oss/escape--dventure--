import React, { useState, useEffect } from 'react';
import { X, Keyboard, RotateCcw, AlertTriangle, Check, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../audio/soundSystem';
import { KeyBindings, DEFAULT_KEY_BINDINGS } from '../game/types';
import { offlineStorage } from '../game/storage/StorageAdapter';

interface KeybindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bindings: KeyBindings;
  onSaveBindings: (newBindings: KeyBindings) => void;
}

export const KeybindingsModal: React.FC<KeybindingsModalProps> = ({
  isOpen,
  onClose,
  bindings,
  onSaveBindings,
}) => {
  const [currentBindings, setCurrentBindings] = useState<KeyBindings>(bindings);
  const [listeningAction, setListeningAction] = useState<keyof KeyBindings | null>(null);

  useEffect(() => {
    setCurrentBindings(bindings);
  }, [bindings]);

  useEffect(() => {
    if (!listeningAction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      sound.playClick();
      const code = e.code;
      setCurrentBindings((prev) => ({
        ...prev,
        [listeningAction]: code,
      }));
      setListeningAction(null);
    };

    window.addEventListener('keydown', handleKeyDown, { once: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listeningAction]);

  if (!isOpen) return null;

  const actionLabels: Record<keyof KeyBindings, string> = {
    moveForward: 'Move Forward (সামনে চলুন)',
    moveBackward: 'Move Backward (পিছনে চলুন)',
    moveLeft: 'Strafe Left (বামে চলুন)',
    moveRight: 'Strafe Right (ডানে চলুন)',
    sprint: 'Sprint Run (দ্রুত দৌড়ান)',
    crouch: 'Crouch / Stealth (লুকিয়ে চলুন)',
    jump: 'Jump (লাফ দিন)',
    interact: 'Interact / Collect (মিথস্ক্রিয়া)',
    attack: 'Melee Blade Attack (তরবারি আক্রমণ)',
    parry: 'Guard Parry / Block (প্যারি রক্ষা)',
    dodge: 'Dodge Roll (সরুন/ডজ)',
    shoot: 'Firearm Shot (অস্ত্রের গুলি)',
    throwStone: 'Throw Pebble Distraction (পাথর ছুড়ুন)',
    openInventory: 'Toggle Inventory (ইনভেন্টরি)',
    openAchievements: 'Toggle Achievements (অর্জন)',
    pause: 'Pause Mission (বিরতি)',
  };

  const getConflicts = (): string[] => {
    const seen = new Map<string, string>();
    const conflicts: string[] = [];

    for (const [action, key] of Object.entries(currentBindings)) {
      if (seen.has(key)) {
        conflicts.push(key);
      } else {
        seen.set(key, action);
      }
    }

    return conflicts;
  };

  const conflicts = getConflicts();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-xl landscape:max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] mx-auto text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase leading-tight">Keybindings & Controls Remap</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>Keyboard Controller</span>
                <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 uppercase tracking-widest font-bold">Customizable</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer group"
            aria-label="Close"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Conflicts Warning Banner */}
        {conflicts.length > 0 && (
          <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-xs text-red-300 font-medium shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Key binding conflict detected! Multiple actions share key: {conflicts.join(', ')}</span>
          </div>
        )}

        {/* Grid Body */}
        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto flex-1 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(actionLabels) as (keyof KeyBindings)[]).map((action) => {
            const key = currentBindings[action];
            const isListening = listeningAction === action;
            const hasConflict = conflicts.includes(key);

            return (
              <div
                key={action}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  hasConflict
                    ? 'bg-red-500/10 border-red-500/30'
                    : isListening
                    ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : 'bg-black/30 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-black text-white tracking-tight leading-tight truncate">
                  {actionLabels[action]}
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setListeningAction(action);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase tracking-widest border transition-all cursor-pointer active:scale-95 shrink-0 ${
                    isListening
                      ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                      : 'bg-white/5 hover:bg-white/10 text-amber-300 border-white/10'
                  }`}
                >
                  {isListening ? 'Press Key...' : key.replace('Key', '')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentBindings(DEFAULT_KEY_BINDINGS);
            }}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSaveBindings(currentBindings);
              onClose();
            }}
            className="py-2.5 px-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Bindings</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

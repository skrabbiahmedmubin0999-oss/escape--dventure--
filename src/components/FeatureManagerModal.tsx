import React, { useState, useEffect } from 'react';
import { X, Layers, Cpu, ShieldCheck, Zap, RotateCcw, Check, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';
import { FeatureModuleConfig } from '../game/types';
import { getDefaultFeatureModules } from '../game/performanceAndSettingsTests';
import { featureRegistry } from '../game/featureRegistry';
import { offlineStorage } from '../game/storage/StorageAdapter';

interface FeatureManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryFilter = 'All' | 'Graphics' | 'Performance' | 'Controls' | 'HUD' | 'Gameplay' | 'AI' | 'Experimental';

export const FeatureManagerModal: React.FC<FeatureManagerModalProps> = ({ isOpen, onClose }) => {
  const [features, setFeatures] = useState<FeatureModuleConfig[]>(() => featureRegistry.getAllFeatures());
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    offlineStorage.loadFeatureManagerConfig().then((saved) => {
      if (saved) {
        featureRegistry.hydrateState(saved);
        setFeatures(featureRegistry.getAllFeatures());
      }
    });
  }, []);

  if (!isOpen) return null;

  const toggleFeature = (id: string) => {
    sound.playClick();
    const currentFeat = features.find((f) => f.id === id);
    if (!currentFeat) return;

    const newTarget = !currentFeat.enabled;
    featureRegistry.setFeatureEnabled(id, newTarget).then(() => {
      const updated = featureRegistry.getAllFeatures();
      setFeatures(updated);
      const configMap: Record<string, boolean> = {};
      updated.forEach((f) => {
        configMap[f.id] = f.enabled;
      });
      offlineStorage.saveFeatureManagerConfig(configMap).catch(() => {});
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleResetFeatures = () => {
    sound.playClick();
    const defaults = getDefaultFeatureModules();
    defaults.forEach((f) => {
      featureRegistry.setFeatureEnabled(f.id, f.enabled).catch(() => {});
    });
    setFeatures(featureRegistry.getAllFeatures());
    const configMap: Record<string, boolean> = {};
    defaults.forEach((f) => {
      configMap[f.id] = f.enabled;
    });
    offlineStorage.saveFeatureManagerConfig(configMap).catch(() => {});
  };

  const filteredFeatures =
    activeCategory === 'All'
      ? features
      : features.filter((f) => f.category === activeCategory);

  const categories: CategoryFilter[] = ['All', 'Graphics', 'Performance', 'Controls', 'HUD', 'Gameplay', 'AI', 'Experimental'];

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
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase leading-tight">Feature Management Center</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>Engine Capabilities</span>
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-400 uppercase tracking-widest font-bold">Verified Features</span>
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

        {/* Category Tabs */}
        <div className="flex p-1.5 bg-black/40 border-b border-white/5 gap-1 shrink-0 overflow-x-auto custom-scrollbar no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat);
              }}
              className={`min-h-[44px] px-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-cyan-400 text-slate-950 shadow-lg'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feature List Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredFeatures.map((feat) => (
              <motion.div
                key={feat.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-black/30 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-start justify-between gap-4 transition-all"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-tight truncate">{feat.name}</span>
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 uppercase tracking-widest">
                      {feat.category}
                    </span>
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                      feat.performanceImpact === 'Zero' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                      feat.performanceImpact === 'Low' ? 'bg-sky-400/10 text-sky-400 border border-sky-400/20' :
                      'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    }`}>
                      Impact: {feat.performanceImpact}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{feat.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feat.enabled}
                      onChange={() => toggleFeature(feat.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400 shadow-inner"></div>
                  </label>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in duration-300">
                <Check className="w-3.5 h-3.5" /> Synchronized
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFeatures}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="py-2.5 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer active:scale-95"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

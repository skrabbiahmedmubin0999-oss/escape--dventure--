import React, { useState } from 'react';
import { X, BookOpen, Key, Compass, Sun, Droplets, Trees, ArrowUp, Hand, Zap, Info, Shield, Cpu, Github, ExternalLink, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';

interface HowToPlayModalProps {
  onClose: () => void;
}

type TabType = 'guide' | 'credits';

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('guide');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-xl landscape:max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]"
      >
        {/* Header - Instruction Terminal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              {activeTab === 'guide' ? <BookOpen className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                  {activeTab === 'guide' ? 'Mission Protocol' : 'Project Intel'}
                </h2>
                <span className="text-[10px] font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {activeTab === 'guide' ? 'গাইড ও নিয়ম' : 'ক্রেডিট'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>Data Node Status</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 uppercase tracking-widest font-bold">Synchronized</span>
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

        {/* Tab Selector */}
        <div className="flex p-1.5 bg-black/40 border-b border-white/5 gap-1.5 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('guide');
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${
              activeTab === 'guide'
                ? 'bg-amber-400 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mission Guide • মিশন গাইড</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('credits');
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${
              activeTab === 'credits'
                ? 'bg-emerald-400 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About • প্রজেক্ট তথ্য</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'guide' ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Mission Objective */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">Primary Objective</span>
                </div>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    You awake at a mysterious beach campsite on an ancient island. The only way home is through the <strong className="text-amber-400">Grand Escape Gate</strong> to the North, currently sealed with 3 ancient elemental rune locks.
                  </p>
                </div>
              </div>

              {/* 3 Elemental Keys */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Step 1: Seek Elemental Keys</span>
                  <span className="text-[10px] font-mono text-amber-400/60">SECTOR_ALPHA</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-amber-500/20 group hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-amber-300 font-black uppercase text-[10px] tracking-widest mb-2">
                      <Sun className="w-4 h-4" /> Sun Key
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Located atop the North-East sun hill at the ancient Sun Temple Ruins.
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-cyan-500/20 group hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-cyan-300 font-black uppercase text-[10px] tracking-widest mb-2">
                      <Droplets className="w-4 h-4" /> Ocean Key
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Hidden beneath the river bend near the rushing Waterfall Grotto.
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-emerald-500/20 group hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-300 font-black uppercase text-[10px] tracking-widest mb-2">
                      <Trees className="w-4 h-4" /> Forest Key
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Guarded inside the Sacred Ancient Grove surrounded by giant trees.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 & 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-2">
                  <div className="font-black text-white uppercase text-xs flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black flex items-center justify-center">02</span>
                    <span>Activate Altar</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Bring all 3 keys to the central plaza altar. Use <strong className="text-amber-400">[E]</strong> to ignite the magical circuit.
                  </p>
                </div>

                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-2">
                  <div className="font-black text-white uppercase text-xs flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-400 text-slate-950 text-[11px] font-black flex items-center justify-center">03</span>
                    <span>Exfiltrate</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The Grand Gate will open with an energy vortex. Step inside to claim victory and record your time!
                  </p>
                </div>
              </div>

              {/* Controls Reference */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kinetic Interface</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { keys: 'WASD', label: 'Move' },
                    { keys: 'SPACE', label: 'Jump' },
                    { keys: 'SHIFT', label: 'Sprint' },
                    { keys: 'E / TAP', label: 'Interact' },
                  ].map((ctrl, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                      <div className="font-mono font-black text-amber-400 text-xs tracking-tighter mb-1 uppercase">{ctrl.keys}</div>
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{ctrl.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-slate-500 font-medium text-center uppercase tracking-widest pt-2">
                  Click & Drag to smoothly orbit the camera
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Project Intro */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Project Synthesis</span>
                </div>
                <div className="bg-black/30 p-5 rounded-3xl border border-white/5 space-y-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Escape Adventure</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Developed as a premium mobile-first 3D tactical stealth experience. Built with <strong className="text-white">Three.js</strong>, <strong className="text-white">React</strong>, and <strong className="text-white">Tailwind CSS</strong>, optimized for low-latency web interactions and immersive atmospheric exploration.
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Version</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">4.8.2-PREMIUM</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Build Node</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">STABLE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Core Subsystems</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                    <div className="text-[10px] font-black text-white uppercase tracking-tight">3D Render Engine</div>
                    <div className="text-[9px] text-slate-500 font-medium">Three.js / WebGL / PBR Materials</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                    <div className="text-[10px] font-black text-white uppercase tracking-tight">Kinetic Interface</div>
                    <div className="text-[9px] text-slate-500 font-medium">Motion React / Custom Haptics</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                    <div className="text-[10px] font-black text-white uppercase tracking-tight">Neural Logic</div>
                    <div className="text-[9px] text-slate-500 font-medium">State-Machine Guard AI / Dog AI</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                    <div className="text-[10px] font-black text-white uppercase tracking-tight">Network Nexus</div>
                    <div className="text-[9px] text-slate-500 font-medium">Express / WebSocket Protocol</div>
                  </div>
                </div>
              </div>

              {/* Development Credits */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operation Staff</span>
                </div>
                <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">Lead Systems Architect</span>
                    <span className="text-[11px] font-black text-white uppercase">Neural Dev Node</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">3D Environment Artist</span>
                    <span className="text-[11px] font-black text-white uppercase">Island Gen-Core</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">UX / Interface Design</span>
                    <span className="text-[11px] font-black text-white uppercase">Glass_UI Module</span>
                  </div>
                </div>
              </div>

              {/* External Links */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                  <Github className="w-4 h-4" /> Repository
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                  <ExternalLink className="w-4 h-4" /> Documentation
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-white/5 border-t border-white/5 flex justify-end shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[48px] px-12 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(52,211,153,0.2)] active:scale-95 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </motion.div>
    </div>
  );
};



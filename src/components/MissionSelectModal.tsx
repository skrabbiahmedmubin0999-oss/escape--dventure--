import React from 'react';
import { X, Swords, Crosshair, Shield, Eye, Play } from 'lucide-react';
import { MISSION_CONFIGS } from '../game/levelManifest';
import { sound } from '../audio/soundSystem';

interface MissionSelectModalProps {
  onClose: () => void;
  onSelectMission: (missionId: string) => void;
  currentMissionId?: string;
}

export const MissionSelectModal: React.FC<MissionSelectModalProps> = ({
  onClose,
  onSelectMission,
  currentMissionId,
}) => {
  const missions = Object.values(MISSION_CONFIGS);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-2xl landscape:max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] ring-1 ring-white/5 transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 shrink-0 shadow-inner">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-tight">Tactical Deployment</h2>
                <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">মিশন নির্বাচন</span>
              </div>
              <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.25em]">Select Infiltration Vector</p>
            </div>
          </div>
          <button 
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer group"
            aria-label="Close"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Mission List - 2 Columns in Landscape */}
        <div className="p-4 sm:p-6 overflow-y-auto landscape:grid landscape:grid-cols-2 landscape:gap-4 space-y-3 landscape:space-y-0 custom-scrollbar flex-1">
          {missions.map((mission) => (
            <button
              key={mission.id}
              onClick={() => {
                sound.playClick();
                onSelectMission(mission.id);
              }}
              className={`w-full text-left p-5 rounded-3xl border transition-all group flex flex-row gap-5 items-center cursor-pointer active:scale-[0.99] relative overflow-hidden ${
                currentMissionId === mission.id
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {currentMissionId === mission.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              )}
              
              {/* Mission Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-105 shadow-inner ${
                mission.allowFirearms 
                   ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                   : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {mission.allowFirearms ? <Crosshair className="w-7 h-7" /> : <Eye className="w-7 h-7" />}
              </div>

              {/* Mission Details */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="font-black text-slate-100 text-sm uppercase tracking-wider">{mission.title}</h3>
                  <div className="flex gap-2">
                    {mission.allowFirearms && (
                      <span className="bg-red-500/20 text-[8px] font-black text-red-400 px-2.5 py-1 rounded-lg border border-red-500/30 uppercase tracking-widest">
                        Firearm Auth
                      </span>
                    )}
                    {currentMissionId === mission.id && (
                      <span className="bg-amber-500 text-[8px] font-black text-slate-950 px-2.5 py-1 rounded-lg uppercase tracking-widest animate-pulse">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2 italic">
                  "{mission.description}"
                </p>
                
                {/* Visual Stats Row */}
                <div className="flex items-center gap-4 pt-1">
                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-300">
                      <div className="w-1 h-1 rounded-full bg-amber-500" />
                      Blade Infiltration
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-300">
                      <div className="w-1 h-1 rounded-full bg-sky-400" />
                      Neural Link Required
                   </div>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                currentMissionId === mission.id
                  ? 'bg-amber-500 border-amber-400 text-slate-950'
                  : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-slate-300'
              }`}>
                <Play className={`w-3 h-3 ${currentMissionId === mission.id ? 'fill-slate-950' : 'fill-transparent'}`} />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-white/5 border-t border-white/5 text-center shrink-0">
           <p className="text-[9px] text-amber-500/40 font-black uppercase tracking-[0.3em]">
             Stealth optimization recommended. Avoid direct contact where possible.
           </p>
        </div>
      </div>
    </div>
  );
};

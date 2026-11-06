import React from 'react';
import { X, Swords, Crosshair, Shield, Eye } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[88dvh] transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40 text-amber-400 shrink-0">
              <Swords className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight">Mission Selection</h2>
              <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Select your next infiltration target</p>
            </div>
          </div>
          <button 
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors pointer-events-auto flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Mission List */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {missions.map((mission) => (
            <button
              key={mission.id}
              onClick={() => {
                sound.playClick();
                onSelectMission(mission.id);
              }}
              className={`w-full text-left p-3 sm:p-4 rounded-2xl border-2 transition-all group flex flex-row gap-3 items-center pointer-events-auto cursor-pointer active:scale-[0.99] ${
                currentMissionId === mission.id
                  ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600'
              }`}
            >
              {/* Mission Icon/Type */}
              <div className={`w-11 h-11 xs:w-13 xs:h-13 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                mission.allowFirearms 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {mission.allowFirearms ? <Crosshair className="w-5 h-5 xs:w-6 xs:h-6" /> : <Eye className="w-5 h-5 xs:w-6 xs:h-6" />}
              </div>

              {/* Mission Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <h3 className="font-black text-slate-100 text-xs xs:text-sm uppercase tracking-tight truncate">{mission.title}</h3>
                  {mission.allowFirearms && (
                    <span className="bg-red-600 text-[8px] xs:text-[9px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm shrink-0">
                      Firearm Authorized
                    </span>
                  )}
                </div>
                <p className="text-[11px] xs:text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                  {mission.description}
                </p>
                
                {/* Stats / Features row */}
                <div className="flex items-center gap-2 xs:gap-3 pt-0.5 flex-wrap">
                   <div className="flex items-center gap-1 text-[9px] xs:text-[10px] font-bold text-slate-300">
                      <Swords className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>Blade Combat</span>
                   </div>
                   <div className="flex items-center gap-1 text-[9px] xs:text-[10px] font-bold text-slate-300">
                      <Shield className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>Parry & Evade</span>
                   </div>
                   {mission.allowFirearms && (
                     <div className="flex items-center gap-1 text-[9px] xs:text-[10px] font-bold text-red-400">
                        <Crosshair className="w-3 h-3 shrink-0" />
                        <span>{mission.startingAmmo} Rounds</span>
                     </div>
                   )}
                </div>
              </div>

              {/* Selection Indicator */}
              <div className="hidden xs:flex shrink-0">
                {currentMissionId === mission.id ? (
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 group-hover:border-slate-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/40 border-t border-slate-800 text-center shrink-0">
           <p className="text-[9px] xs:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             Stealth remains the highest honor. Pure Ghost runs earn maximum XP rewards.
           </p>
        </div>
      </div>
    </div>
  );
};

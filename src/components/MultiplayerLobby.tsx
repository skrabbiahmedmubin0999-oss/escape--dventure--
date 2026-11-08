import React, { useState } from 'react';
import { X, Users, Copy, Check, Shield, Wifi, Play, PlusCircle, ArrowRight, UserCheck, Bot, MapPin, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';
import { GameMapType, MultiplayerModeType, MultiplayerPlayer, MultiplayerRoom } from '../game/types';

interface MultiplayerLobbyProps {
  onClose: () => void;
  onStartMultiplayerGame: (withCompanion: boolean) => void;
  playerName: string;
  playerColor: string;
}

const MAP_OPTIONS: { id: GameMapType; name: string; tag: string; available: boolean }[] = [
  { id: 'mystery_island', name: 'Mystery Island', tag: 'DEPLOYABLE', available: true },
  { id: 'frozen_mountain', name: 'Frozen Mountain', tag: 'ENCRYPTED', available: false },
  { id: 'lost_desert', name: 'Lost Desert', tag: 'ENCRYPTED', available: false },
  { id: 'sky_kingdom', name: 'Sky Kingdom', tag: 'ENCRYPTED', available: false },
  { id: 'ocean_mystery', name: 'Ocean Mystery', tag: 'ENCRYPTED', available: false },
];

const MODE_OPTIONS: { id: MultiplayerModeType; name: string; tag: string; available: boolean }[] = [
  { id: 'coop_adventure', name: 'Co-op Adventure', tag: 'SYNCED', available: true },
  { id: 'treasure_hunt', name: 'Treasure Hunt', tag: 'SYNCED', available: true },
  { id: 'obstacle_race', name: 'Obstacle Race', tag: 'LOCKED', available: false },
  { id: 'survival_challenge', name: 'Survival Challenge', tag: 'LOCKED', available: false },
  { id: 'team_challenge', name: 'Team Challenge', tag: 'LOCKED', available: false },
];

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onClose,
  onStartMultiplayerGame,
  playerName,
  playerColor,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [enableCompanionBot, setEnableCompanionBot] = useState(true);

  // Initial room state
  const [room, setRoom] = useState<MultiplayerRoom>({
    roomId: 'ISLE-84',
    roomName: `${playerName}'s Expedition`,
    isHost: true,
    maxPlayers: 4,
    selectedMap: 'mystery_island',
    selectedMode: 'coop_adventure',
    status: 'waiting',
    players: [
      {
        id: 'p1',
        name: playerName,
        isHost: true,
        isReady: true,
        color: playerColor,
        ping: 18,
      },
      {
        id: 'p2',
        name: 'Explorer Sam (Co-op Buddy)',
        isHost: false,
        isReady: true,
        color: '#2980b9',
        ping: 32,
      },
    ],
  });

  const [isSelfReady, setIsSelfReady] = useState(true);

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard?.writeText(room.roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleReady = () => {
    sound.playClick();
    setIsSelfReady(!isSelfReady);
    setRoom((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === 'p1' ? { ...p, isReady: !isSelfReady } : p
      ),
    }));
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!joinCodeInput.trim()) return;

    // Simulate joining target room
    setRoom({
      roomId: joinCodeInput.toUpperCase(),
      roomName: `Island Quest #${joinCodeInput.toUpperCase()}`,
      isHost: false,
      maxPlayers: 4,
      selectedMap: 'mystery_island',
      selectedMode: 'coop_adventure',
      status: 'waiting',
      players: [
        {
          id: 'host-1',
          name: 'Captain Morgan',
          isHost: true,
          isReady: true,
          color: '#e74c3c',
          ping: 42,
        },
        {
          id: 'p1',
          name: playerName,
          isHost: false,
          isReady: isSelfReady,
          color: playerColor,
          ping: 24,
        },
      ],
    });
    setActiveTab('create');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-2xl landscape:max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]"
      >
        {/* Header - Coordination Hub */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase">Multiplayer Nexus</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Network Protocol</span>
                <span className="w-1 h-1 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-sky-400 uppercase tracking-widest font-bold">Encrypted Link</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer group"
            aria-label="Close"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Tab Selector - Clean Segmented Control */}
        <div className="flex p-1.5 bg-black/40 border-b border-white/5 gap-1.5 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('create');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${
              activeTab === 'create'
                ? 'bg-amber-400 text-slate-950 shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Room #{room.roomId}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('join');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${
              activeTab === 'join'
                ? 'bg-sky-400 text-slate-950 shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Join Mission</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          {activeTab === 'join' ? (
            <motion.form 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleJoinSubmit} 
              className="space-y-6"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400/80 ml-1">
                  Access Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="ISLE-XXXX"
                    maxLength={8}
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono text-lg uppercase tracking-[0.3em] focus:outline-none focus:border-sky-400/50 transition-all placeholder:text-slate-700"
                  />
                  <button
                    type="submit"
                    className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-black px-8 rounded-2xl flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] active:scale-95"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-sky-400/5 border border-sky-400/20 rounded-2xl text-[11px] text-sky-200/70 font-medium">
                <Wifi className="w-4 h-4 text-sky-400 shrink-0" />
                <p>Establishing secure handshake with target expedition node...</p>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Room Details Bar */}
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Expedition Cipher
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black font-mono tracking-[0.2em] text-amber-400">
                      {room.roomId}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Copy Code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Deployment Slots
                  </div>
                  <div className="text-sm font-black text-white uppercase tracking-tight">
                    {room.players.length} / {room.maxPlayers} Synchronized
                  </div>
                </div>
              </div>

              {/* Map & Mode Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Map Selector */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Coordinates</span>
                  </div>
                  <div className="space-y-1.5">
                    {MAP_OPTIONS.map((map) => (
                      <button
                        key={map.id}
                        type="button"
                        disabled={!map.available}
                        onClick={() => {
                          if (map.available) {
                            sound.playClick();
                            setRoom((prev) => ({ ...prev, selectedMap: map.id }));
                          }
                        }}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs flex items-center justify-between border transition-all ${
                          room.selectedMap === map.id
                            ? 'bg-amber-400/10 border-amber-400 text-white font-black'
                            : map.available
                            ? 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20 cursor-pointer'
                            : 'bg-black/10 border-transparent text-slate-600 cursor-not-allowed opacity-40'
                        }`}
                      >
                        <span className="truncate uppercase tracking-tight">{map.name}</span>
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded ${
                          map.available
                            ? room.selectedMap === map.id
                              ? 'bg-amber-400 text-slate-950'
                              : 'text-amber-400/60'
                            : 'text-slate-600'
                        }`}>
                          {map.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expedition Protocol</span>
                  </div>
                  <div className="space-y-1.5">
                    {MODE_OPTIONS.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        disabled={!mode.available}
                        onClick={() => {
                          if (mode.available) {
                            sound.playClick();
                            setRoom((prev) => ({ ...prev, selectedMode: mode.id }));
                          }
                        }}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs flex items-center justify-between border transition-all ${
                          room.selectedMode === mode.id
                            ? 'bg-sky-400/10 border-sky-400 text-white font-black'
                            : mode.available
                            ? 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20 cursor-pointer'
                            : 'bg-black/10 border-transparent text-slate-600 cursor-not-allowed opacity-40'
                        }`}
                      >
                        <span className="truncate uppercase tracking-tight">{mode.name}</span>
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded ${
                          mode.available
                            ? room.selectedMode === mode.id
                              ? 'bg-sky-400 text-slate-950'
                              : 'text-sky-400/60'
                            : 'text-slate-600'
                        }`}>
                          {mode.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Player Slots List */}
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Synchronized Explorers
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Active Slots */}
                  {room.players.map((p, idx) => (
                    <div
                      key={p.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs border border-white/20 shadow-inner"
                          style={{ backgroundColor: p.color }}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white flex items-center gap-2 truncate">
                            <span className="truncate">{p.name}</span>
                            {p.isHost && (
                              <span className="text-[8px] font-black bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-400/30 uppercase tracking-widest">
                                Lead
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1 font-mono uppercase">
                            <Wifi className="w-3 h-3 text-emerald-400" />
                            <span>{p.ping}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {p.isReady ? (
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                            <UserCheck className="w-3 h-3" /> Ready
                          </div>
                        ) : (
                          <div className="text-[9px] font-black text-amber-400/60 uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/5 border border-amber-400/10">
                            Wait
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Empty Slots */}
                  {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="border border-dashed border-white/10 rounded-2xl p-4 flex items-center gap-4 text-slate-600 bg-black/10"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center text-xs font-black text-slate-700">
                        {room.players.length + i + 1}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Awaiting Signal...</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Companion Bot Toggle */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-6 transition-all hover:bg-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-tight">
                      Tactical Companion Bot
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                      Deploy AI-assisted explorer for kinetic synchronization tests.
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCompanionBot}
                    onChange={(e) => setEnableCompanionBot(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl">
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200/60 font-medium leading-relaxed uppercase tracking-tight">
                  <span className="text-amber-400 font-black">Co-op Protocol:</span> Multi-character kinematics and follow logic are active for the current deployment sector.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 bg-white/5 border-t border-white/5 flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={handleToggleReady}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all cursor-pointer active:scale-95 ${
              isSelfReady
                ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/40'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            {isSelfReady ? '✓ Verified' : 'Confirm Readiness'}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onStartMultiplayerGame(enableCompanionBot);
            }}
            className="px-10 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(251,191,36,0.2)] flex items-center gap-3 transition-all cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Initiate Launch</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};


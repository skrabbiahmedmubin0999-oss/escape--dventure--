import React, { useState, useRef, useEffect } from 'react';
import { X, Sliders, RotateCcw, Save, Move, Eye, Gamepad2, Swords, Hand, Zap, Layers, AlertTriangle, Grid, Download, Upload, Copy, Trash2, Plus, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';
import { ControlLayoutConfig, DEFAULT_CONTROL_LAYOUT, HUDProfile, ControlElementConfig } from '../game/types';
import { PROFILE_PRESETS, validateProfileJSON } from '../game/profilePresets';
import { offlineStorage } from '../game/storage/StorageAdapter';

interface ControlCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: ControlLayoutConfig;
  onSaveLayout: (newLayout: ControlLayoutConfig) => void;
  onResetLayout: () => void;
}

type TabType = 'visual_editor' | 'profiles' | keyof ControlLayoutConfig | 'master';

export const ControlCustomizerModal: React.FC<ControlCustomizerModalProps> = ({
  isOpen,
  onClose,
  layout,
  onSaveLayout,
  onResetLayout,
}) => {
  const [currentLayout, setCurrentLayout] = useState<ControlLayoutConfig>(layout);
  const [activeTab, setActiveTab] = useState<TabType>('visual_editor');
  const [profiles, setProfiles] = useState<HUDProfile[]>(PROFILE_PRESETS);
  const [activeProfileId, setActiveProfileId] = useState<string>('profile_default');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(10);
  const [editingProfileName, setEditingProfileName] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [importJsonString, setImportJsonString] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [selectedElementKey, setSelectedElementKey] = useState<keyof ControlLayoutConfig>('joystick');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number; elemX: number; elemY: number }>({ x: 0, y: 0, elemX: 0, elemY: 0 });

  // Load saved profiles from IndexedDB on open
  useEffect(() => {
    if (isOpen) {
      offlineStorage.loadHUDProfiles().then((savedProfiles) => {
        if (Array.isArray(savedProfiles) && savedProfiles.length > 0) {
          // Merge preset profiles with custom saved ones
          const merged = [...PROFILE_PRESETS];
          savedProfiles.forEach((sp) => {
            if (!merged.some((p) => p.id === sp.id)) {
              merged.push(sp);
            }
          });
          setProfiles(merged);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateElement = (
    key: keyof ControlLayoutConfig,
    field: keyof ControlElementConfig,
    value: number | boolean
  ) => {
    setCurrentLayout((prev) => {
      const target = prev[key] || { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true };
      let val = value;
      if (typeof val === 'number' && snapToGrid && (field === 'x' || field === 'y')) {
        val = Math.round(val / gridSize) * gridSize;
      }
      return {
        ...prev,
        [key]: {
          ...target,
          [field]: val,
        },
      };
    });
  };

  const setAllOpacity = (opacity: number) => {
    setCurrentLayout((prev) => ({
      joystick: { ...prev.joystick, opacity },
      actionCluster: { ...prev.actionCluster, opacity },
      interactButton: { ...prev.interactButton, opacity },
      combatCluster: { ...prev.combatCluster, opacity },
      vitalsBar: prev.vitalsBar ? { ...prev.vitalsBar, opacity } : { x: 0, y: 0, scale: 1, opacity, enabled: true },
      miniMap: prev.miniMap ? { ...prev.miniMap, opacity } : { x: 0, y: 0, scale: 1, opacity, enabled: true },
      objectiveTracker: prev.objectiveTracker ? { ...prev.objectiveTracker, opacity } : { x: 0, y: 0, scale: 1, opacity, enabled: true },
    }));
  };

  const labels: Record<keyof ControlLayoutConfig, { name: string; shortName: string; desc: string; icon: React.ReactNode }> = {
    joystick: {
      name: 'Virtual Movement Joystick',
      shortName: 'Joystick',
      desc: 'Left-side directional thumbstick for player movement',
      icon: <Gamepad2 className="w-4 h-4 text-amber-400" />,
    },
    actionCluster: {
      name: 'Action Buttons (Jump, Run, Hide, Distract)',
      shortName: 'Actions',
      desc: 'Utility cluster: jump, sprint, crouch/hide, and pebble throw',
      icon: <Zap className="w-4 h-4 text-sky-400" />,
    },
    interactButton: {
      name: 'Proximity Interact Button',
      shortName: 'Interact',
      desc: 'Contextual pickup, chest opening, and altar activation button',
      icon: <Hand className="w-4 h-4 text-emerald-400" />,
    },
    combatCluster: {
      name: 'Combat & Weapon Cluster',
      shortName: 'Combat',
      desc: 'Tactical combat: blade strike / firearms, block / parry, and dodge',
      icon: <Swords className="w-4 h-4 text-red-400" />,
    },
    vitalsBar: {
      name: 'Health & Stamina Vitals',
      shortName: 'Vitals',
      desc: 'Top status deck displaying player health and stamina levels',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
    },
    miniMap: {
      name: 'Tactical Radar & Minimap',
      shortName: 'Minimap',
      desc: 'Top-right radar view showing player position and objective markers',
      icon: <Move className="w-4 h-4 text-sky-400" />,
    },
    objectiveTracker: {
      name: 'Mission Objective Tracker',
      shortName: 'Objectives',
      desc: 'Top-left active quest goals and key counter',
      icon: <Eye className="w-4 h-4 text-purple-400" />,
    },
  };

  const controlKeys = Object.keys(labels) as (keyof ControlLayoutConfig)[];

  // Detect component overlap / collision warnings
  const checkOverlaps = () => {
    const warnings: string[] = [];
    const keysToCheck: (keyof ControlLayoutConfig)[] = ['joystick', 'actionCluster', 'interactButton', 'combatCluster'];
    for (let i = 0; i < keysToCheck.length; i++) {
      for (let j = i + 1; j < keysToCheck.length; j++) {
        const k1 = keysToCheck[i];
        const k2 = keysToCheck[j];
        const e1 = currentLayout[k1];
        const e2 = currentLayout[k2];
        if (e1 && e2 && e1.enabled !== false && e2.enabled !== false) {
          const dx = Math.abs((e1.x || 0) - (e2.x || 0));
          const dy = Math.abs((e1.y || 0) - (e2.y || 0));
          if (dx < 45 && dy < 45) {
            warnings.push(`Overlap warning: ${labels[k1].shortName} and ${labels[k2].shortName} are too close.`);
          }
        }
      }
    }
    return warnings;
  };

  const overlapWarnings = checkOverlaps();

  // Profile Manager Actions
  const handleSelectProfile = (profile: HUDProfile) => {
    sound.playClick();
    setActiveProfileId(profile.id);
    setCurrentLayout(profile.layout);
  };

  const handleSaveAsCustomProfile = () => {
    sound.playClick();
    const name = newProfileName.trim() || `Custom Layout ${profiles.length + 1}`;
    const newProf: HUDProfile = {
      id: `custom_${Date.now()}`,
      name,
      presetType: 'custom',
      layout: currentLayout,
    };
    const updated = [...profiles, newProf];
    setProfiles(updated);
    setActiveProfileId(newProf.id);
    setNewProfileName('');
    offlineStorage.saveHUDProfiles(updated).catch(() => {});
  };

  const handleDeleteProfile = (id: string) => {
    sound.playClick();
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    if (activeProfileId === id) {
      setActiveProfileId('profile_default');
      setCurrentLayout(DEFAULT_CONTROL_LAYOUT);
    }
    offlineStorage.saveHUDProfiles(updated).catch(() => {});
  };

  const handleExportProfileJSON = (profile: HUDProfile) => {
    sound.playClick();
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.toLowerCase().replace(/\s+/g, '_')}_hud_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProfileJSON = () => {
    sound.playClick();
    setImportError(null);
    setImportSuccess(null);

    const validation = validateProfileJSON(importJsonString);
    if (!validation.valid || !validation.profile) {
      setImportError(validation.error || 'Failed to import JSON configuration.');
      return;
    }

    const imported = validation.profile;
    const updated = [...profiles, imported];
    setProfiles(updated);
    setActiveProfileId(imported.id);
    setCurrentLayout(imported.layout);
    setImportSuccess(`Successfully imported profile '${imported.name}'!`);
    setImportJsonString('');
    offlineStorage.saveHUDProfiles(updated).catch(() => {});
  };

  // Drag interaction math for interactive visual layout editor canvas
  const handleCanvasPointerDown = (e: React.PointerEvent, key: keyof ControlLayoutConfig) => {
    setSelectedElementKey(key);
    setIsDragging(true);
    const elem = currentLayout[key] || { x: 0, y: 0 };
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x || 0,
      elemY: elem.y || 0,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent, key: keyof ControlLayoutConfig) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    let newX = dragStartPos.current.elemX + dx;
    let newY = dragStartPos.current.elemY + dy;

    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    // Clamp safe-area bounds (-150px to 150px)
    newX = Math.max(-150, Math.min(150, newX));
    newY = Math.max(-150, Math.min(150, newY));

    updateElement(key, 'x', newX);
    updateElement(key, 'y', newY);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md pointer-events-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-xl landscape:max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] mx-auto text-slate-100"
      >
        {/* Header Terminal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase leading-tight">Advanced Customization Engine</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>Visual Canvas Editor & Profile Manager</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 font-mono font-bold uppercase tracking-widest">LIVE_CALIBRATED</span>
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

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-black/40 border-b border-white/5 gap-1 shrink-0 overflow-x-auto custom-scrollbar no-scrollbar">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('visual_editor');
            }}
            className={`min-h-[42px] px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'visual_editor'
                ? 'bg-amber-400 text-slate-950 shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Interactive Canvas</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('profiles');
            }}
            className={`min-h-[42px] px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'profiles'
                ? 'bg-amber-400 text-slate-950 shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Profile Manager ({profiles.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('master');
            }}
            className={`min-h-[42px] px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'master'
                ? 'bg-amber-400 text-slate-950 shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Master Alpha</span>
          </button>

          {controlKeys.map((key) => (
            <button
              key={key}
              onClick={() => {
                sound.playClick();
                setActiveTab(key);
                setSelectedElementKey(key);
              }}
              className={`min-h-[42px] px-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                activeTab === key
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>{labels[key].shortName}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* OVERLAP WARNING BANNER */}
          {overlapWarnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-3 text-amber-300 animate-in fade-in duration-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-0.5 text-left">
                <div className="text-[11px] font-black uppercase tracking-wider">UI Overlap / Distance Warning</div>
                {overlapWarnings.map((w, i) => (
                  <div key={i} className="text-[10px] font-medium text-amber-200">{w}</div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: VISUAL INTERACTIVE CANVAS EDITOR */}
          {activeTab === 'visual_editor' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Canvas Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 text-xs font-bold">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSnapToGrid(!snapToGrid)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
                      snapToGrid ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' : 'bg-black/30 text-slate-400 border-white/5'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Snap Grid ({gridSize}px)</span>
                  </button>

                  <select
                    value={gridSize}
                    onChange={(e) => setGridSize(parseInt(e.target.value))}
                    className="bg-slate-950 text-white border border-white/10 rounded-xl px-2 py-1 text-[10px] font-mono cursor-pointer"
                  >
                    <option value={5}>5px</option>
                    <option value={10}>10px</option>
                    <option value={20}>20px</option>
                  </select>
                </div>

                <div className="text-[10px] font-mono text-slate-400">
                  Selected: <span className="text-amber-400 font-bold uppercase">{labels[selectedElementKey]?.shortName}</span>
                </div>
              </div>

              {/* Interactive Virtual Viewport Representation Canvas */}
              <div className="relative w-full h-64 sm:h-72 bg-slate-950/90 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none touch-none">
                {/* Grid Overlay */}
                {snapToGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-15"
                    style={{
                      backgroundImage: `radial-gradient(circle, #f59e0b 1px, transparent 1px)`,
                      backgroundSize: `${gridSize * 2}px ${gridSize * 2}px`,
                    }}
                  />
                )}

                {/* Safe Area Outer Boundary Line */}
                <div className="absolute inset-3 border border-red-500/20 rounded-2xl pointer-events-none flex items-start justify-end p-1">
                  <span className="text-[8px] font-mono text-red-400/50 uppercase">Safe Area Boundary</span>
                </div>

                {/* Draggable HUD Node Overlay Representations */}
                {controlKeys.map((key) => {
                  const elem = currentLayout[key] || { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true };
                  if (elem.enabled === false) return null;
                  const isSelected = selectedElementKey === key;

                  return (
                    <motion.div
                      key={key}
                      onPointerDown={(e) => handleCanvasPointerDown(e, key)}
                      onPointerMove={(e) => handleCanvasPointerMove(e, key)}
                      onPointerUp={handleCanvasPointerUp}
                      style={{
                        transform: `translate(${elem.x}px, ${elem.y}px) scale(${elem.scale})`,
                        opacity: elem.opacity,
                      }}
                      className={`absolute cursor-grab active:cursor-grabbing p-3 rounded-2xl border-2 flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-amber-400/30 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)] z-30 ring-2 ring-amber-300/50'
                          : 'bg-black/50 border-white/20 hover:border-white/40 z-10'
                      }`}
                    >
                      {labels[key].icon}
                      <span className="text-[10px] font-black uppercase tracking-tight text-white whitespace-nowrap">{labels[key].shortName}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Element Fine-Tuning Deck */}
              {(() => {
                const elem = currentLayout[selectedElementKey] || { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true };
                return (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {labels[selectedElementKey]?.icon}
                        <span className="text-xs font-black text-white uppercase tracking-wider">{labels[selectedElementKey]?.name}</span>
                      </div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-300 cursor-pointer">
                        <span>Visible</span>
                        <input
                          type="checkbox"
                          checked={elem.enabled !== false}
                          onChange={(e) => updateElement(selectedElementKey, 'enabled', e.target.checked)}
                          className="accent-amber-400"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Scale ({(elem.scale * 100).toFixed(0)}%)</div>
                        <input
                          type="range" min="0.5" max="1.5" step="0.05"
                          value={elem.scale}
                          onChange={(e) => updateElement(selectedElementKey, 'scale', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-amber-400 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Opacity ({(elem.opacity * 100).toFixed(0)}%)</div>
                        <input
                          type="range" min="0.1" max="1.0" step="0.05"
                          value={elem.opacity}
                          onChange={(e) => updateElement(selectedElementKey, 'opacity', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-amber-400 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Pos X ({elem.x}px)</div>
                        <input
                          type="range" min="-150" max="150" step="5"
                          value={elem.x}
                          onChange={(e) => updateElement(selectedElementKey, 'x', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-sky-400 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Pos Y ({elem.y}px)</div>
                        <input
                          type="range" min="-150" max="150" step="5"
                          value={elem.y}
                          onChange={(e) => updateElement(selectedElementKey, 'y', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-emerald-400 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 2: PROFILE MANAGER */}
          {activeTab === 'profiles' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Active Profile Selection Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Profiles ({profiles.length})</span>
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">PERSISTED_IDB</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profiles.map((prof) => {
                    const isActive = activeProfileId === prof.id;
                    const isPreset = prof.presetType !== 'custom';

                    return (
                      <div
                        key={prof.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isActive ? 'bg-amber-400/10 border-amber-400 shadow-lg' : 'bg-black/30 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Layers className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          <div className="min-w-0">
                            {editingProfileName === prof.id ? (
                              <input
                                type="text"
                                defaultValue={prof.name}
                                onBlur={(e) => {
                                  const name = e.currentTarget.value.trim();
                                  if (name) {
                                    const updated = profiles.map((p) => (p.id === prof.id ? { ...p, name } : p));
                                    setProfiles(updated);
                                    offlineStorage.saveHUDProfiles(updated).catch(() => {});
                                  }
                                  setEditingProfileName(null);
                                }}
                                className="bg-slate-950 border border-amber-400 text-white text-xs font-bold px-2 py-1 rounded"
                                autoFocus
                              />
                            ) : (
                              <div className="text-xs font-black text-white uppercase tracking-tight truncate">{prof.name}</div>
                            )}
                            <div className="text-[9px] font-mono text-slate-500 uppercase">{prof.presetType} profile</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isActive && (
                            <button
                              onClick={() => handleSelectProfile(prof)}
                              className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-amber-300"
                            >
                              Load
                            </button>
                          )}
                          {isActive && (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase">Active</span>
                          )}

                          <button
                            onClick={() => handleExportProfileJSON(prof)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                            title="Export Profile JSON"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {!isPreset && (
                            <>
                              <button
                                onClick={() => setEditingProfileName(prof.id)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                                title="Rename"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProfile(prof.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Create Custom Profile */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-black text-white uppercase tracking-wider">Save Current Layout as Custom Profile</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter Custom Profile Name..."
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSaveAsCustomProfile}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </div>

              {/* Import JSON Schema Section */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    Import Configuration JSON Schema
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">SCHEMA_VALIDATED</span>
                </div>

                {importError && <div className="text-[10px] font-bold text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">{importError}</div>}
                {importSuccess && <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">{importSuccess}</div>}

                <textarea
                  rows={3}
                  placeholder='Paste JSON profile configuration here...'
                  value={importJsonString}
                  onChange={(e) => setImportJsonString(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-400 custom-scrollbar"
                />

                <button
                  onClick={handleImportProfileJSON}
                  disabled={!importJsonString.trim()}
                  className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Validate & Import Profile
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MASTER ALPHA & INDIVIDUAL SLIDERS */}
          {activeTab === 'master' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-amber-400">Master Alpha Level</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">GLOBAL_OPACITY</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[0.25, 0.5, 0.75, 1.0].map((op) => (
                    <button
                      key={op}
                      onClick={() => {
                        sound.playClick();
                        setAllOpacity(op);
                      }}
                      className="py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-xs font-black text-amber-300 uppercase cursor-pointer"
                    >
                      {(op * 100).toFixed(0)}% Alpha
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {controlKeys.map((key) => {
                  const cfg = currentLayout[key] || { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true };
                  return (
                    <div key={key} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {labels[key].icon}
                        <div>
                          <div className="text-xs font-black text-white uppercase">{labels[key].name}</div>
                          <div className="text-[10px] text-slate-500">{labels[key].desc}</div>
                        </div>
                      </div>
                      <input
                        type="range" min="0.1" max="1.0" step="0.05"
                        value={cfg.opacity}
                        onChange={(e) => updateElement(key, 'opacity', parseFloat(e.target.value))}
                        className="w-32 h-1.5 bg-black/40 rounded-full appearance-none accent-amber-400 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 4: SPECIFIC CONTROL ELEMENT EDITORS */}
          {controlKeys.includes(activeTab as any) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {(() => {
                const k = activeTab as keyof ControlLayoutConfig;
                const elem = currentLayout[k] || { x: 0, y: 0, scale: 1.0, opacity: 1.0, enabled: true };
                return (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {labels[k]?.icon}
                          <span className="text-sm font-black text-white uppercase">{labels[k]?.name}</span>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                          <span>Enabled</span>
                          <input
                            type="checkbox"
                            checked={elem.enabled !== false}
                            onChange={(e) => updateElement(k, 'enabled', e.target.checked)}
                            className="accent-amber-400"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{labels[k]?.desc}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300 uppercase">Scale Factor</span>
                          <span className="text-amber-400 font-mono font-black">{(elem.scale * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range" min="0.5" max="1.5" step="0.05"
                          value={elem.scale}
                          onChange={(e) => updateElement(k, 'scale', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-amber-400 cursor-pointer"
                        />
                      </div>

                      <div className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300 uppercase">Opacity Level</span>
                          <span className="text-amber-400 font-mono font-black">{(elem.opacity * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range" min="0.1" max="1.0" step="0.05"
                          value={elem.opacity}
                          onChange={(e) => updateElement(k, 'opacity', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-amber-400 cursor-pointer"
                        />
                      </div>

                      <div className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300 uppercase">Offset X (Horizontal)</span>
                          <span className="text-sky-400 font-mono font-black">{elem.x} px</span>
                        </div>
                        <input
                          type="range" min="-150" max="150" step="5"
                          value={elem.x}
                          onChange={(e) => updateElement(k, 'x', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-sky-400 cursor-pointer"
                        />
                      </div>

                      <div className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300 uppercase">Offset Y (Vertical)</span>
                          <span className="text-emerald-400 font-mono font-black">{elem.y} px</span>
                        </div>
                        <input
                          type="range" min="-150" max="150" step="5"
                          value={elem.y}
                          onChange={(e) => updateElement(k, 'y', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-black/40 rounded-full appearance-none accent-emerald-400 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentLayout(DEFAULT_CONTROL_LAYOUT);
              onResetLayout();
            }}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex w-full sm:w-auto gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex-1 sm:flex-none min-h-[44px] px-6 py-2 rounded-2xl bg-black/20 hover:bg-black/40 text-slate-400 font-black text-[10px] uppercase tracking-widest border border-white/5 cursor-pointer active:scale-95"
            >
              Discard
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onSaveLayout(currentLayout);
                onClose();
              }}
              className="flex-1 sm:flex-none min-h-[44px] px-8 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

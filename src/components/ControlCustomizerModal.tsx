import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Save, Move, Eye, Gamepad2, Swords, Hand, Zap, Layers } from 'lucide-react';
import { sound } from '../audio/soundSystem';
import { ControlLayoutConfig, DEFAULT_CONTROL_LAYOUT } from '../game/types';

interface ControlCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: ControlLayoutConfig;
  onSaveLayout: (newLayout: ControlLayoutConfig) => void;
  onResetLayout: () => void;
}

type TabType = keyof ControlLayoutConfig | 'overview';

export const ControlCustomizerModal: React.FC<ControlCustomizerModalProps> = ({
  isOpen,
  onClose,
  layout,
  onSaveLayout,
  onResetLayout,
}) => {
  const [currentLayout, setCurrentLayout] = useState<ControlLayoutConfig>(layout);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isOpen) return null;

  const updateElement = (
    key: keyof ControlLayoutConfig,
    field: keyof ControlLayoutConfig['joystick'],
    value: number
  ) => {
    setCurrentLayout((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const setAllOpacity = (opacity: number) => {
    setCurrentLayout((prev) => ({
      joystick: { ...prev.joystick, opacity },
      actionCluster: { ...prev.actionCluster, opacity },
      interactButton: { ...prev.interactButton, opacity },
      combatCluster: { ...prev.combatCluster, opacity },
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
  };

  const controlKeys = Object.keys(labels) as (keyof ControlLayoutConfig)[];

  const OPACITY_PRESETS = [
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1.0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md font-sans">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">Customize Touch Controls</h2>
              <p className="text-xs text-slate-400">Adjust opacity, visibility & button sizing</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-5 gap-1 p-2 xs:p-2.5 bg-slate-950/70 border-b border-slate-800 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('overview');
            }}
            className={`min-h-[44px] py-2 px-1 xs:px-1.5 rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md border border-amber-300 font-black'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0 hidden xs:inline" />
            <span className="truncate">Opacity</span>
          </button>

          {controlKeys.map((key) => (
            <button
              key={key}
              onClick={() => {
                sound.playClick();
                setActiveTab(key);
              }}
              className={`min-h-[44px] py-2 px-1 rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate active:scale-95 flex items-center justify-center ${
                activeTab === key
                  ? 'bg-amber-500 text-slate-950 shadow-md border border-amber-300 font-black'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="truncate">{labels[key].shortName}</span>
            </button>
          ))}
        </div>

        {/* Customization Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'overview' ? (
            /* ============================================================== */
            /* TAB: ALL CONTROLS OPACITY OVERVIEW                             */
            /* ============================================================== */
            <div className="space-y-4">
              {/* Master Opacity Control Banner */}
              <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Master HUD Opacity
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Quick Presets</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {OPACITY_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        sound.playClick();
                        setAllOpacity(p.value);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/50 text-[11px] font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Control Cards with Opacity Sliders */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Control Visibility Sliders
                </div>

                {controlKeys.map((key) => {
                  const item = labels[key];
                  const cfg = currentLayout[key];
                  const opacityPercent = Math.round(cfg.opacity * 100);

                  return (
                    <div
                      key={key}
                      className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 transition-colors hover:border-slate-700"
                    >
                      {/* Control Title & Icon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-100">{item.name}</div>
                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                          </div>
                        </div>

                        {/* Current Value Display & Detailed Edit Button */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-400 tabular-nums">
                            {opacityPercent}%
                          </span>
                          <button
                            onClick={() => {
                              sound.playClick();
                              setActiveTab(key);
                            }}
                            className="text-[10px] font-bold text-amber-400/90 hover:text-amber-300 underline uppercase tracking-wider cursor-pointer"
                          >
                            Edit Size
                          </button>
                        </div>
                      </div>

                      {/* Opacity Slider */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={cfg.opacity}
                          onChange={(e) => updateElement(key, 'opacity', parseFloat(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-2"
                        />
                      </div>

                      {/* Visual Sample Bar */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[10px] text-slate-500">Preview:</span>
                        <div
                          className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold text-amber-300"
                          style={{ opacity: cfg.opacity }}
                        >
                          Visible at {opacityPercent}%
                        </div>
                        <div className="flex gap-1">
                          {OPACITY_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              onClick={() => {
                                sound.playClick();
                                updateElement(key, 'opacity', p.value);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                Math.abs(cfg.opacity - p.value) < 0.04
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-900 text-slate-400 hover:text-white'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* TAB: INDIVIDUAL CONTROL DETAILED CUSTOMIZATION                 */
            /* ============================================================== */
            <div className="space-y-5">
              {/* Control Header Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  {labels[activeTab].icon}
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    {labels[activeTab].name}
                  </div>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">{labels[activeTab].desc}</div>
              </div>

              {/* Live Opacity & Size Preview Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Live Visual Preview
                </div>
                <div
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-white/60 shadow-xl flex items-center justify-center transition-all"
                  style={{
                    opacity: currentLayout[activeTab].opacity,
                    transform: `scale(${currentLayout[activeTab].scale})`,
                  }}
                >
                  <Eye className="w-6 h-6 text-slate-950" />
                </div>
                <div className="text-[11px] font-mono text-slate-300 tabular-nums">
                  Opacity: {(currentLayout[activeTab].opacity * 100).toFixed(0)}% · Scale:{' '}
                  {(currentLayout[activeTab].scale * 100).toFixed(0)}%
                </div>
              </div>

              {/* Opacity Slider for Current Control */}
              <div className="space-y-2 bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    Button Opacity / Transparency
                  </span>
                  <span className="font-mono text-amber-400 text-sm font-black tabular-nums">
                    {(currentLayout[activeTab].opacity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={currentLayout[activeTab].opacity}
                  onChange={(e) => updateElement(activeTab, 'opacity', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2"
                />
                <div className="flex justify-between gap-1 pt-1">
                  {OPACITY_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        sound.playClick();
                        updateElement(activeTab, 'opacity', p.value);
                      }}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border ${
                        Math.abs(currentLayout[activeTab].opacity - p.value) < 0.04
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Button Scale / Size</span>
                  <span className="font-mono text-amber-400 tabular-nums">
                    {(currentLayout[activeTab].scale * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={currentLayout[activeTab].scale}
                  onChange={(e) => updateElement(activeTab, 'scale', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Position X Offset */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Horizontal Offset (X)</span>
                  <span className="font-mono text-amber-400 tabular-nums">{currentLayout[activeTab].x} px</span>
                </div>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  step="5"
                  value={currentLayout[activeTab].x}
                  onChange={(e) => updateElement(activeTab, 'x', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Position Y Offset */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Vertical Offset (Y)</span>
                  <span className="font-mono text-amber-400 tabular-nums">{currentLayout[activeTab].y} px</span>
                </div>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  step="5"
                  value={currentLayout[activeTab].y}
                  onChange={(e) => updateElement(activeTab, 'y', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentLayout(DEFAULT_CONTROL_LAYOUT);
              onResetLayout();
            }}
            className="min-h-[44px] py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="min-h-[44px] py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onSaveLayout(currentLayout);
                onClose();
              }}
              className="min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


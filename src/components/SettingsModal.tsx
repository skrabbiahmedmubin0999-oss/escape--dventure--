import React, { useState } from 'react';
import { X, Volume2, Monitor, MousePointer, ShieldCheck, Activity, CheckCircle2, XCircle, Save, Smartphone } from 'lucide-react';
import { sound } from '../audio/soundSystem';
import { GameSettings, AdvancedGraphicsSettings } from '../game/types';
import { PhysicsTestResult } from '../game/collisionTests';

interface SettingsModalProps {
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  advancedGraphics?: AdvancedGraphicsSettings;
  onUpdateAdvancedGraphics?: (newSettings: Partial<AdvancedGraphicsSettings>) => void;
  onSaveProgress?: () => void;
  onOpenControlCustomizer?: () => void;
  onOpenKeybindings?: () => void;
  onOpenFeatureManager?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  settings,
  onUpdateSettings,
  advancedGraphics,
  onUpdateAdvancedGraphics,
  onSaveProgress,
  onOpenControlCustomizer,
  onOpenKeybindings,
  onOpenFeatureManager,
}) => {
  const [auditResults, setAuditResults] = useState<PhysicsTestResult[] | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/60 backdrop-blur-sm font-sans">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-lg landscape:max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] ring-1 ring-white/5">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight uppercase">System Settings</h2>
                <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">সিস্টেম সেটিংস</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500/60">Neural Link Configuration</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer group active:scale-90"
            aria-label="Close"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Settings Body - 2 Columns in Landscape */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 landscape:grid landscape:grid-cols-2 landscape:gap-6 space-y-6 landscape:space-y-0">
          {/* Column 1: Audio & Graphics */}
          <div className="space-y-6">
            {/* Audio Section */}
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Acoustic Simulation
                </span>
                <span className="text-slate-400 font-bold lowercase tracking-normal">সাউন্ড সেটিংস</span>
              </div>

              <div className="space-y-3">
                {/* Mute Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-100 uppercase tracking-wide">Master Audio</span>
                    <p className="text-[9px] text-slate-400 font-medium">Toggle sound (শব্দ চালু/বন্ধ)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                  </label>
                </div>

              {/* Volume Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>SFX Intensity</span>
                    <span className="text-amber-400">{Math.round(settings.sfxVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.sfxVolume}
                    onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Ambient Drift</span>
                    <span className="text-amber-400">{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Graphics Control Center Section */}
          <div className="space-y-5">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/80 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Graphics Control Center
              </span>
              <span className="text-slate-400 font-bold lowercase tracking-normal">গ্রাফিক্স কন্ট্রোল</span>
            </div>

            {/* Quality Preset Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['low', 'medium', 'high', 'ultra', 'auto'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ graphicsQuality: q === 'auto' ? 'high' : (q as any) });
                    onUpdateAdvancedGraphics?.({ qualityPreset: q });
                  }}
                  className={`relative py-2.5 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer text-center ${
                    (advancedGraphics?.qualityPreset || settings.graphicsQuality) === q
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{q}</span>
                </button>
              ))}
            </div>

            {/* Advanced Fine-Tuning Controls */}
            {advancedGraphics && onUpdateAdvancedGraphics && (
              <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                {/* Resolution Scale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-wider">
                    <span>Resolution Scale</span>
                    <span className="text-amber-400">{(advancedGraphics.renderScale || 1.0).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={advancedGraphics.renderScale || 1.0}
                    onChange={(e) => onUpdateAdvancedGraphics({ renderScale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Shadow Quality & View Distance */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Shadow Quality</label>
                    <select
                      value={advancedGraphics.shadowQuality || 'high'}
                      onChange={(e) => onUpdateAdvancedGraphics({ shadowQuality: e.target.value as any })}
                      className="w-full bg-slate-900 text-xs font-bold text-white border border-white/10 rounded-xl p-2 cursor-pointer focus:outline-none focus:border-amber-400"
                    >
                      <option value="off">Off</option>
                      <option value="low">Low (512p)</option>
                      <option value="medium">Medium (1024p)</option>
                      <option value="high">High (2048p)</option>
                      <option value="ultra">Ultra (4096p)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Anti-Aliasing</label>
                    <select
                      value={advancedGraphics.antiAliasing || 'fxaa'}
                      onChange={(e) => onUpdateAdvancedGraphics({ antiAliasing: e.target.value as any })}
                      className="w-full bg-slate-900 text-xs font-bold text-white border border-white/10 rounded-xl p-2 cursor-pointer focus:outline-none focus:border-amber-400"
                    >
                      <option value="off">Off (Fastest)</option>
                      <option value="fxaa">FXAA (Smooth)</option>
                      <option value="msaa">MSAA (High Quality)</option>
                    </select>
                  </div>
                </div>

                {/* View Distance */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-wider">
                    <span>View Distance</span>
                    <span className="text-amber-400">{advancedGraphics.viewDistance || 150}m</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="10"
                    value={advancedGraphics.viewDistance || 150}
                    onChange={(e) => onUpdateAdvancedGraphics({ viewDistance: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* FPS Cap & Dynamic Resolution */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">FPS Cap:</span>
                    <select
                      value={advancedGraphics.fpsLimit || 60}
                      onChange={(e) => onUpdateAdvancedGraphics({ fpsLimit: parseInt(e.target.value, 10) as any })}
                      className="bg-slate-900 text-[10px] font-bold text-amber-400 border border-white/10 rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                    >
                      <option value={30}>30 FPS</option>
                      <option value={60}>60 FPS</option>
                      <option value={120}>120 FPS</option>
                      <option value={0}>Unlimited</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Dynamic Res:</span>
                    <input
                      type="checkbox"
                      checked={advancedGraphics.dynamicResolution !== false}
                      onChange={(e) => onUpdateAdvancedGraphics({ dynamicResolution: e.target.checked })}
                      className="rounded bg-slate-900 border-white/10 text-amber-500 focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Controls, Haptics & Diagnostics */}
        <div className="space-y-6">
          {/* Control Section */}
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Interface Calibration
              </span>
              <span className="text-slate-400 font-bold lowercase tracking-normal">কন্ট্রোল সেটিংস</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Look Sensitivity</span>
                    <span className="text-amber-400">{settings.mouseSensitivity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.1"
                    value={settings.mouseSensitivity}
                    onChange={(e) => onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <div className="space-y-2 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Touch Velocity</span>
                    <span className="text-amber-400">{(settings.joystickSensitivity ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={settings.joystickSensitivity ?? 1.0}
                    onChange={(e) => onUpdateSettings({ joystickSensitivity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-100 uppercase tracking-wide">Invert Axis (Y)</span>
                  <p className="text-[9px] text-slate-400 font-medium">ক্যামেরা উল্টো করা</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.invertY}
                    onChange={(e) => onUpdateSettings({ invertY: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                </label>
              </div>

              {onOpenControlCustomizer && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenControlCustomizer();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-black text-[10px] uppercase tracking-wider border border-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Calibrate HUD Layout • বাটন পজিশন সাজান</span>
                </button>
              )}

              {onOpenKeybindings && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenKeybindings();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-black text-[10px] uppercase tracking-wider border border-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  <MousePointer className="w-4 h-4" />
                  <span>Keybindings Remap • কিবোর্ড রি-ম্যাপ</span>
                </button>
              )}

              {onOpenFeatureManager && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenFeatureManager();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-black text-[10px] uppercase tracking-wider border border-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  <Activity className="w-4 h-4" />
                  <span>Feature Manager • ফিচার সেন্টার</span>
                </button>
              )}
            </div>
          </div>

          {/* Haptics Section */}
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Tactile Feedback
              </span>
              <span className="text-slate-400 font-bold lowercase tracking-normal">হ্যাপটিক্স (ভাইব্রেশন)</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-100 uppercase tracking-wide">Neural Haptics</span>
                  <p className="text-[9px] text-slate-400 font-medium italic">Tactile pulse on link disruption</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hapticsEnabled}
                    onChange={(e) => onUpdateSettings({ hapticsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((i) => (
                  <button
                    key={i}
                    disabled={!settings.hapticsEnabled}
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({ hapticsIntensity: i });
                    }}
                    className={`py-2.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      !settings.hapticsEnabled
                        ? 'opacity-20 grayscale cursor-not-allowed'
                        : settings.hapticsIntensity === i
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnostics Section */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Structural Integrity Scan (ডায়াগনস্টিক)
              </span>
              {auditResults && (
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono tracking-tighter">
                  {auditResults.filter(r => r.passed).length}/{auditResults.length} SYNCED
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  if (typeof (window as any).__togglePhysicsWireframes === 'function') {
                    (window as any).__togglePhysicsWireframes();
                  } else {
                    alert('Physics Link unavailable.');
                  }
                }}
                className="py-4 px-4 rounded-2xl bg-white/5 hover:bg-sky-500/10 text-sky-400 border border-white/5 hover:border-sky-500/20 transition-all flex flex-col items-center gap-2 group cursor-pointer"
              >
                <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Wireframes</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  if (typeof (window as any).__runPhysicsTests === 'function') {
                    const results = (window as any).__runPhysicsTests();
                    setAuditResults(results);
                  }
                }}
                className="py-4 px-4 rounded-2xl bg-white/5 hover:bg-emerald-500/10 text-emerald-400 border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col items-center gap-2 group cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Audit Scan</span>
              </button>

              <button
                onClick={async () => {
                  sound.playClick();
                  if (typeof (window as any).__verifyIndexedDB === 'function') {
                    const res = await (window as any).__verifyIndexedDB();
                    const converted: PhysicsTestResult[] = Object.entries(res.stores).map(([storeName, passed]) => ({
                      testName: `Store: ${storeName}`,
                      passed: passed as boolean,
                      details: String(res.details.find((d: string) => d.includes(storeName)) || ''),
                    }));
                    setAuditResults(converted);
                  }
                }}
                className="py-4 px-4 rounded-2xl bg-white/5 hover:bg-amber-500/10 text-amber-400 border border-white/5 hover:border-amber-500/20 transition-all flex flex-col items-center gap-2 group cursor-pointer"
              >
                <Save className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Verify Data</span>
              </button>
            </div>

            {auditResults && (
              <div className="bg-slate-950/50 rounded-2xl border border-white/5 p-4 space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-white/5">
                {auditResults.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black text-slate-100 uppercase tracking-tight truncate">{test.testName}</div>
                      <div className="text-[9px] text-slate-400 font-mono truncate opacity-60">{test.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-white/5 border-t border-white/5 flex items-center justify-between gap-4 shrink-0">
          {onSaveProgress && (
            <button
              onClick={() => {
                sound.playClick();
                onSaveProgress();
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] border border-emerald-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Snapshot Link</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            Confirm Sync
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, Hand, Zap, EyeOff, Shield, Crosshair, Swords } from 'lucide-react';
import { ControlLayoutConfig, DEFAULT_CONTROL_LAYOUT } from '../game/types';

interface MobileControlsProps {
  onJoystickMove: (x: number, y: number) => void;
  onJump: (active: boolean) => void;
  onSprint: (active: boolean) => void;
  onCrouch?: (active: boolean) => void;
  onInteract: () => void;
  isInteractAvailable: boolean;
  interactLabel?: string;
  stoneCooldownRemaining?: number;
  onThrowStone?: () => void;
  // Phase 7 Combat
  onAttack: (active: boolean) => void;
  onParry: (active: boolean) => void;
  onDodge: (active: boolean) => void;
  onShoot: (active: boolean) => void;
  firearmAuthorized: boolean;
  ammoCount: number;
  layout?: ControlLayoutConfig;
  joystickSensitivity?: number;
}

import { triggerHaptic, Haptics } from '../game/haptics';

export const MobileControls: React.FC<MobileControlsProps> = ({
  onJoystickMove,
  onJump,
  onSprint,
  onCrouch,
  onInteract,
  isInteractAvailable,
  interactLabel,
  stoneCooldownRemaining = 0,
  onThrowStone,
  onAttack,
  onParry,
  onDodge,
  onShoot,
  firearmAuthorized,
  ammoCount,
  layout = DEFAULT_CONTROL_LAYOUT,
  joystickSensitivity = 1.0,
}) => {
  const stickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);

  // Global blur / visibility change listener: reset all inputs on focus loss / tab switch
  useEffect(() => {
    const handleResetAllInputs = () => {
      setIsDragging(false);
      setKnobPos({ x: 0, y: 0 });
      setIsSprinting(false);
      setIsCrouching(false);
      onJoystickMove(0, 0);
      onSprint(false);
      if (onCrouch) onCrouch(false);
      onJump(false);
      onAttack(false);
      onParry(false);
      onDodge(false);
      onShoot(false);
    };

    window.addEventListener('blur', handleResetAllInputs);
    window.addEventListener('pointercancel', handleResetAllInputs);
    document.addEventListener('visibilitychange', handleResetAllInputs);

    return () => {
      window.removeEventListener('blur', handleResetAllInputs);
      window.removeEventListener('pointercancel', handleResetAllInputs);
      document.removeEventListener('visibilitychange', handleResetAllInputs);
    };
  }, [onJoystickMove, onSprint, onCrouch, onJump, onAttack, onParry, onDodge, onShoot]);

  // Handle Joystick with Pointer Capture & Zero Latency
  const handleJoystickDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    triggerHaptic(10);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    updateKnob(e.clientX, e.clientY);
  };

  const handleJoystickMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handleJoystickUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!stickBaseRef.current) return;
    const rect = stickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2;

    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // Apply sensitivity scaling: higher sensitivity means full magnitude is reached with less displacement
    const rawRatio = Math.min(dist / maxRadius, 1.0);
    const scaledRatio = Math.min(rawRatio * joystickSensitivity, 1.0);

    const nx = Math.cos(angle) * scaledRatio;
    const ny = Math.sin(angle) * scaledRatio;

    // Visual knob position remains clamped to physical stick bounds
    const clampedDist = Math.min(dist, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({
      x: knobX,
      y: knobY,
    });

    onJoystickMove(nx, ny);
  };

  // Immediate touch handlers to eliminate 300ms tap latency
  const handleSprintStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    triggerHaptic(8);
    setIsSprinting(true);
    onSprint(true);
  };

  const handleSprintEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSprinting(false);
    onSprint(false);
  };

  const handleCrouchStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    triggerHaptic(8);
    setIsCrouching(true);
    if (onCrouch) onCrouch(true);
  };

  const handleCrouchEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsCrouching(false);
    if (onCrouch) onCrouch(false);
  };

  const handleInteractPress = (e: React.SyntheticEvent) => {
    e.preventDefault();
    triggerHaptic(12);
    onInteract();
  };

  const handleAttackPress = (e: React.SyntheticEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    if (firearmAuthorized && ammoCount > 0) {
      onShoot(true);
    } else {
      onAttack(true);
    }
  };

  const handleAttackEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onAttack(false);
    onShoot(false);
  };

  const handleDodgePress = (e: React.SyntheticEvent) => {
    e.preventDefault();
    triggerHaptic(12);
    onDodge(true);
  };

  const handleDodgeEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onDodge(false);
  };

  const handleParryStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    onParry(true);
  };

  const handleParryEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onParry(false);
  };

  const handleJumpStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    triggerHaptic(15);
    onJump(true);
  };

  const handleJumpEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onJump(false);
  };

  const handleDistractPress = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (stoneCooldownRemaining <= 0) {
      triggerHaptic(10);
      onThrowStone?.();
    }
  };

  const joy = layout.joystick;
  const act = layout.actionCluster;
  const intBtn = layout.interactButton;
  const com = layout.combatCluster;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden" style={{ touchAction: 'none' }}>
      {/* ======================================================== */}
      {/* 1. VIRTUAL JOYSTICK (Bottom-Left)                         */}
      {/* ======================================================== */}
      {joy.enabled !== false && (
        <div
          className="absolute pointer-events-auto touch-none transition-transform"
          style={{
            left: 'max(12px, env(safe-area-inset-left, 12px))',
            bottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
            transform: `translate(${joy.x}px, ${joy.y}px) scale(${joy.scale})`,
            opacity: joy.opacity,
            transformOrigin: 'bottom left',
          }}
        >
          <div
            ref={stickBaseRef}
            onPointerDown={handleJoystickDown}
            onPointerMove={handleJoystickMove}
            onPointerUp={handleJoystickUp}
            onPointerCancel={handleJoystickUp}
            className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/80 border-2 border-amber-400/40 relative flex items-center justify-center touch-none shadow-2xl backdrop-blur-sm"
            style={{ touchAction: 'none' }}
          >
            {/* Directional cross guide */}
            <div className="absolute w-16 h-16 xs:w-20 xs:h-20 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
            <div className="absolute h-full w-[1px] bg-white/10 pointer-events-none" />

            {/* Thumb Knob */}
            <div
              className={`w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full shadow-lg border border-white/40 absolute flex items-center justify-center pointer-events-none transition-transform duration-75 ${
                isDragging
                  ? 'bg-gradient-to-tr from-amber-500 to-amber-300 scale-105'
                  : 'bg-gradient-to-tr from-amber-600 to-amber-400'
              }`}
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
            >
              <div className="w-3 h-3 xs:w-3.5 xs:h-3.5 rounded-full bg-amber-900/50 shadow-inner" />
            </div>
          </div>
          <div className="text-center text-[9px] xs:text-[10px] uppercase font-black text-amber-300/80 tracking-widest mt-0.5">
            Move
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PROXIMITY INTERACT BUTTON                              */}
      {/* ======================================================== */}
      {isInteractAvailable && intBtn.enabled !== false && (
        <div
          className="absolute pointer-events-auto transition-transform"
          style={{
            right: `calc(max(12px, env(safe-area-inset-right, 12px)) + ${-intBtn.x}px)`,
            bottom: `calc(max(12px, env(safe-area-inset-bottom, 12px)) + 175px + ${intBtn.y}px)`,
            transform: `scale(${intBtn.scale})`,
            opacity: intBtn.opacity,
            transformOrigin: 'bottom right',
          }}
        >
          <button
            onTouchStart={handleInteractPress}
            onMouseDown={handleInteractPress}
            className="group min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 active:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-emerald-200 active:scale-95 transition-all cursor-pointer"
            aria-label="Interact"
          >
            <Hand className="w-4 h-4 xs:w-5 xs:h-5 text-slate-950" />
            <span>{interactLabel || 'Interact'}</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. COMBAT CLUSTER (Tactical Strike, Dodge, Block)       */}
      {/* ======================================================== */}
      {com.enabled !== false && (
        <div
          className="absolute pointer-events-auto flex items-center gap-2 xs:gap-2.5 transition-transform"
          style={{
            right: 'max(12px, env(safe-area-inset-right, 12px))',
            bottom: `calc(max(12px, env(safe-area-inset-bottom, 12px)) + 84px + ${com.y}px)`,
            transform: `translate(${-com.x}px, 0px) scale(${com.scale})`,
            opacity: com.opacity,
            transformOrigin: 'bottom right',
          }}
        >
          {/* DODGE / EVADE Button */}
          <button
            onTouchStart={handleDodgePress}
            onTouchEnd={handleDodgeEnd}
            onTouchCancel={handleDodgeEnd}
            onMouseDown={handleDodgePress}
            onMouseUp={handleDodgeEnd}
            onMouseLeave={handleDodgeEnd}
            className="w-11 h-11 xs:w-12 xs:h-12 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center bg-slate-900/90 text-amber-400 border border-amber-500/40 active:bg-amber-600 active:scale-95 cursor-pointer shadow-lg transition-all"
            aria-label="Dodge"
          >
            <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-amber-400" />
            <span className="text-[7px] xs:text-[8px] font-black uppercase tracking-tight">Dodge</span>
          </button>

          {/* BLOCK / PARRY Button (Hold) */}
          <button
            onTouchStart={handleParryStart}
            onTouchEnd={handleParryEnd}
            onTouchCancel={handleParryEnd}
            onMouseDown={handleParryStart}
            onMouseUp={handleParryEnd}
            onMouseLeave={handleParryEnd}
            className="w-11 h-11 xs:w-12 xs:h-12 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center bg-slate-900/90 text-sky-400 border border-sky-400/40 active:bg-sky-600 active:scale-95 cursor-pointer shadow-lg transition-all"
            aria-label="Block"
          >
            <Shield className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-sky-300" />
            <span className="text-[7px] xs:text-[8px] font-black uppercase tracking-tight">Block</span>
          </button>

          {/* PRIMARY ATTACK: Strike (Sword) or Fire (Firearm) */}
          <button
            onTouchStart={handleAttackPress}
            onTouchEnd={handleAttackEnd}
            onTouchCancel={handleAttackEnd}
            onMouseDown={handleAttackPress}
            onMouseUp={handleAttackEnd}
            onMouseLeave={handleAttackEnd}
            className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center bg-gradient-to-tr from-red-700 to-red-500 active:from-red-600 active:to-red-400 text-white shadow-2xl border-2 border-white/50 active:scale-95 transition-all cursor-pointer relative"
            aria-label={(firearmAuthorized && ammoCount > 0) ? "Fire Weapon" : "Sword Strike"}
          >
            {(firearmAuthorized && ammoCount > 0) ? (
              <>
                <Crosshair className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 text-white drop-shadow-md" />
                <span className="text-[8px] xs:text-[9px] font-black uppercase tracking-widest -mt-0.5">Fire</span>
                {/* Ammo Count Indicator */}
                <div className="absolute -top-1 -right-1 bg-slate-950 text-amber-400 text-[9px] xs:text-[10px] font-black px-1.5 py-0.5 rounded-lg border border-amber-500 shadow-lg">
                  {ammoCount}
                </div>
              </>
            ) : (
              <>
                <Swords className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 text-white drop-shadow-md" />
                <span className="text-[8px] xs:text-[9px] font-black uppercase tracking-widest -mt-0.5">Strike</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ACTION BUTTONS CLUSTER (Jump, Run, Hide, Distract)   */}
      {/* Ergonomically clustered for right thumb sweep             */}
      {/* ======================================================== */}
      {act.enabled !== false && (
        <div
          className="absolute pointer-events-auto flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 transition-transform"
          style={{
            right: 'max(12px, env(safe-area-inset-right, 12px))',
            bottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
            transform: `translate(${-act.x}px, ${act.y}px) scale(${act.scale})`,
            opacity: act.opacity,
            transformOrigin: 'bottom right',
          }}
        >
        {/* Stone Throw Distraction Button */}
        <button
          onTouchStart={handleDistractPress}
          onMouseDown={handleDistractPress}
          disabled={stoneCooldownRemaining > 0}
          className={`w-11 h-11 xs:w-12 xs:h-12 rounded-full flex flex-col items-center justify-center shadow-lg border transition-all ${
            stoneCooldownRemaining > 0
              ? 'bg-slate-950/90 text-slate-600 border-slate-800 opacity-60 cursor-not-allowed'
              : 'bg-slate-900/90 text-amber-400 border-amber-500/40 active:bg-amber-600 active:scale-95 cursor-pointer'
          }`}
          aria-label="Distract Guard"
        >
          <Zap className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${stoneCooldownRemaining > 0 ? 'text-slate-600' : 'text-amber-400'} rotate-180`} />
          <span className="text-[7px] xs:text-[8px] font-extrabold uppercase tracking-tight">
            {stoneCooldownRemaining > 0 ? `${stoneCooldownRemaining.toFixed(0)}s` : 'Distract'}
          </span>
        </button>

        {/* Hold CROUCH / HIDE Button */}
        <button
          onTouchStart={handleCrouchStart}
          onTouchEnd={handleCrouchEnd}
          onTouchCancel={handleCrouchEnd}
          onMouseDown={handleCrouchStart}
          onMouseUp={handleCrouchEnd}
          onMouseLeave={handleCrouchEnd}
          className={`w-11 h-11 xs:w-12 xs:h-12 rounded-full flex flex-col items-center justify-center shadow-lg border active:scale-95 transition-all cursor-pointer ${
            isCrouching
              ? 'bg-sky-400 text-slate-950 border-white shadow-sky-500/40'
              : 'bg-slate-900/90 text-sky-300 border-sky-400/40 active:bg-sky-600'
          }`}
          aria-label="Crouch / Hide"
        >
          <EyeOff className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${isCrouching ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[7px] xs:text-[8px] font-extrabold uppercase tracking-tight">Hide</span>
        </button>

        {/* Hold RUN Button */}
        <button
          onTouchStart={handleSprintStart}
          onTouchEnd={handleSprintEnd}
          onTouchCancel={handleSprintEnd}
          onMouseDown={handleSprintStart}
          onMouseUp={handleSprintEnd}
          onMouseLeave={handleSprintEnd}
          className={`w-11 h-11 xs:w-12 xs:h-12 rounded-full flex flex-col items-center justify-center shadow-lg border active:scale-95 transition-all cursor-pointer ${
            isSprinting
              ? 'bg-amber-400 text-slate-950 border-white shadow-amber-500/40'
              : 'bg-slate-900/90 text-amber-300 border-amber-400/40 active:bg-amber-600'
          }`}
          aria-label="Run"
        >
          <Zap className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${isSprinting ? 'fill-slate-950' : ''}`} />
          <span className="text-[7px] xs:text-[8px] font-extrabold uppercase tracking-tight">Run</span>
        </button>

        {/* JUMP Button - Primary Action under Right Thumb */}
        <button
          onTouchStart={handleJumpStart}
          onTouchEnd={handleJumpEnd}
          onTouchCancel={handleJumpEnd}
          onMouseDown={handleJumpStart}
          onMouseUp={handleJumpEnd}
          onMouseLeave={handleJumpEnd}
          className="w-13 h-13 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 active:from-amber-400 active:to-amber-200 text-slate-950 shadow-2xl border-2 border-white/60 flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer"
          aria-label="Jump"
        >
          <ArrowUp className="w-5 h-5 xs:w-6 xs:h-6 stroke-[3]" />
          <span className="text-[9px] xs:text-[10px] font-black uppercase tracking-wider -mt-0.5">Jump</span>
        </button>
      </div>
      )}
    </div>
  );
};

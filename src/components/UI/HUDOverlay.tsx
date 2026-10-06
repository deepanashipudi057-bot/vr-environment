import React from 'react';
import {
  Glasses,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  HelpCircle,
  Compass,
  RotateCcw,
  Sparkles,
  Maximize2,
  UserCheck,
  Sliders,
} from 'lucide-react';
import { CAMERA_PRESETS } from '../VRRoom/VRControls.ts';
import { AvatarState } from '../VRRoom/InterviewerAvatar.ts';

interface HUDOverlayProps {
  vrSupported: boolean | null;
  inVr: boolean;
  activePreset: string;
  timeOfDay: 'day' | 'evening';
  audioActive: boolean;
  avatarState: AvatarState;
  showAvatarSettings: boolean;
  onEnterVR: () => void;
  onExitVR: () => void;
  onSelectPreset: (presetId: string) => void;
  onToggleTimeOfDay: () => void;
  onToggleAudio: () => void;
  onToggleAvatarSettings: () => void;
  onOpenHelp: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  vrSupported,
  inVr,
  activePreset,
  timeOfDay,
  audioActive,
  avatarState,
  showAvatarSettings,
  onEnterVR,
  onExitVR,
  onSelectPreset,
  onToggleTimeOfDay,
  onToggleAudio,
  onToggleAvatarSettings,
  onOpenHelp,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-20">
      {/* Top Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Brand & Room Title */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold">
              CS
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white uppercase font-sans">
                CAREER SPRINT
              </h1>
              <p className="text-xs text-slate-300 font-medium">Virtual Interview Room</p>
            </div>
            <div className="ml-2 pl-3 border-l border-slate-700 hidden md:block">
              <span className="text-xs text-sky-400 font-medium">Room 402</span>
              <span className="text-xs text-slate-400"> · Executive Suite</span>
            </div>
          </div>
        </div>

        {/* Center / Right: VR Mode Button & Status */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Avatar State Indicator Pill */}
          <button
            onClick={onToggleAvatarSettings}
            title="Configure Interviewer Avatar & State"
            className="bg-slate-900/85 hover:bg-slate-800/90 backdrop-blur-md border border-slate-700/70 text-slate-200 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline text-slate-400">Interviewer:</span>
            <span className="font-semibold text-white">{avatarState}</span>
            <Sliders className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* WebXR Action Button */}
          {vrSupported ? (
            !inVr ? (
              <button
                onClick={onEnterVR}
                className="group flex items-center gap-2.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Glasses className="w-5 h-5 text-sky-100 group-hover:rotate-6 transition-transform" />
                <span>ENTER VR</span>
              </button>
            ) : (
              <button
                onClick={onExitVR}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <span>EXIT VR</span>
              </button>
            )
          ) : (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D Browser Mode</span>
            </div>
          )}

          {/* Quick Environment Controls */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 flex items-center gap-1 shadow-xl">
            <button
              onClick={onToggleTimeOfDay}
              title={timeOfDay === 'day' ? 'Switch to Evening Ambiance' : 'Switch to Day Ambiance'}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {timeOfDay === 'day' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              onClick={onToggleAudio}
              title={audioActive ? 'Mute Office Room Tone' : 'Play Ambient Room Hum'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                audioActive ? 'text-sky-400 bg-sky-950/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenHelp}
              title="Project Guide & VR Instructions"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>
      </header>

      {/* VR Fallback Notice when VR is not supported on this device */}
      {vrSupported === false && (
        <div className="pointer-events-auto self-start mt-2 max-w-md bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-xl p-3 shadow-xl">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-200 font-semibold">WebXR Status</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                VR mode is not supported on this device. You can continue in 3D browser mode.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Camera Presets & Instructions */}
      <footer className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
        {/* Navigation Instructions */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2.5 shadow-xl">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Compass className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold text-white">Controls:</span>
            <span>Use WASD + Mouse to explore the room.</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
            Click and drag to look around · W/A/S/D or Arrows to walk · Stand or sit anywhere
          </p>
        </div>

        {/* Camera View Switcher */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-1.5 shadow-xl flex flex-wrap items-center gap-1 max-w-full overflow-x-auto">
          <button
            onClick={() => onSelectPreset('candidate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activePreset === 'candidate'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Candidate Chair</span>
          </button>

          {CAMERA_PRESETS.filter((p) => p.id !== 'candidate').map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activePreset === preset.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};

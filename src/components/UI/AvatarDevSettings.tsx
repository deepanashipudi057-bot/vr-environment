import React, { useState } from 'react';
import {
  Sliders,
  X,
  Play,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Ear,
  Brain,
  Smile,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AvatarConfig, AvatarState, DEFAULT_AVATAR_CONFIG } from '../VRRoom/InterviewerAvatar.ts';

interface AvatarDevSettingsProps {
  config: AvatarConfig;
  currentState: AvatarState;
  modelSource: 'procedural' | 'glb';
  isGlbLoaded: boolean;
  onUpdateConfig: (newConfig: Partial<AvatarConfig>) => void;
  onSetState: (state: AvatarState) => void;
  onReloadGlb: () => void;
  onClose: () => void;
}

export const AvatarDevSettings: React.FC<AvatarDevSettingsProps> = ({
  config,
  currentState,
  modelSource,
  isGlbLoaded,
  onUpdateConfig,
  onSetState,
  onReloadGlb,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'behavior' | 'transform'>('behavior');
  const [testSpeechActive, setTestSpeechActive] = useState<boolean>(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);

  const testPrompts = [
    '"Welcome Alex! Can you tell me about the architecture of your most recent full-stack system?"',
    '"How did you optimize your database query latencies when user traffic spiked by 10x?"',
    '"That\'s a great design choice. Walk me through how you would handle network partition failures."',
    '"Thank you for your clear explanations today. Do you have any questions for our engineering leadership?"',
  ];

  const handleTestSpeech = () => {
    onSetState('SPEAKING');
    setTestSpeechActive(true);
    setCurrentPromptIndex((prev) => (prev + 1) % testPrompts.length);

    // Automatically transition to LISTENING after speaking
    setTimeout(() => {
      onSetState('LISTENING');
      setTestSpeechActive(false);
    }, 6000);
  };

  const handleResetDefaults = () => {
    onUpdateConfig(DEFAULT_AVATAR_CONFIG);
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-40 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-xs text-slate-300 animate-fade-in select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Avatar Dev Settings</h2>
            <p className="text-[10px] text-slate-400">Live AI Interviewer Configuration</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Model Status Card */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                modelSource === 'glb' ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
              }`}
            />
            <span className="font-semibold text-white">
              {modelSource === 'glb' ? 'Custom 3D Model' : 'Realistic Human Fallback'}
            </span>
          </div>
          <button
            onClick={onReloadGlb}
            title="Scan for src/assets/models/interviewer.glb"
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium text-[10px] transition-colors cursor-pointer"
          >
            Check .GLB
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {modelSource === 'glb'
            ? 'Loaded: interviewer.glb'
            : 'Looking for src/assets/models/interviewer.glb (Procedural human active)'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50">
        <button
          onClick={() => setActiveTab('behavior')}
          className={`flex-1 py-2 text-center font-medium transition-colors cursor-pointer ${
            activeTab === 'behavior'
              ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-950/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Behavior & Speech
        </button>
        <button
          onClick={() => setActiveTab('transform')}
          className={`flex-1 py-2 text-center font-medium transition-colors cursor-pointer ${
            activeTab === 'transform'
              ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-950/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Transform & Pose
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {activeTab === 'behavior' && (
          <div className="space-y-4">
            {/* Behavior State Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Active Interview State
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(['IDLE', 'LISTENING', 'THINKING', 'SPEAKING', 'NODDING'] as AvatarState[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => onSetState(st)}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentState === st
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {st === 'IDLE' && <Smile className="w-3.5 h-3.5" />}
                    {st === 'LISTENING' && <Ear className="w-3.5 h-3.5" />}
                    {st === 'THINKING' && <Brain className="w-3.5 h-3.5" />}
                    {st === 'SPEAKING' && <MessageSquare className="w-3.5 h-3.5" />}
                    {st === 'NODDING' && <Check className="w-3.5 h-3.5" />}
                    <span>{st}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Talking Action */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-[11px]">Speech Simulation</span>
                <button
                  onClick={handleTestSpeech}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Ask Question</span>
                </button>
              </div>

              {testSpeechActive && (
                <div className="p-2.5 rounded-lg bg-sky-950/50 border border-sky-500/30 text-sky-200 text-[11px] italic leading-relaxed animate-pulse">
                  {testPrompts[currentPromptIndex]}
                </div>
              )}
            </div>

            {/* Speaking Speed Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">Talking Mouth Speed</label>
                <span className="font-mono text-sky-400">{config.speakingSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={config.speakingSpeed}
                onChange={(e) => onUpdateConfig({ speakingSpeed: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Idle Movement Intensity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">Natural Idle Breathing/Drift</label>
                <span className="font-mono text-sky-400">{config.idleIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={config.idleIntensity}
                onChange={(e) => onUpdateConfig({ idleIntensity: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'transform' && (
          <div className="space-y-3.5">
            {/* Sitting Height Offset */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">Sitting Height (Chair Elevation)</label>
                <span className="font-mono text-sky-400">{config.sittingHeightOffset.toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min="-0.2"
                max="0.2"
                step="0.01"
                value={config.sittingHeightOffset}
                onChange={(e) => onUpdateConfig({ sittingHeightOffset: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Position Z (Distance to Desk) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">Position Z (Closer / Farther from Desk)</label>
                <span className="font-mono text-sky-400">{config.positionZ.toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min="-1.6"
                max="-1.1"
                step="0.01"
                value={config.positionZ}
                onChange={(e) => onUpdateConfig({ positionZ: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Position X (Left / Right Offset) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">Position X (Lateral Centering)</label>
                <span className="font-mono text-sky-400">{config.positionX.toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min="-0.3"
                max="0.3"
                step="0.01"
                value={config.positionX}
                onChange={(e) => onUpdateConfig({ positionX: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Rotation Y (Yaw Angle) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">Rotation Y (Facing Angle)</label>
                <span className="font-mono text-sky-400">{(config.rotationY * (180 / Math.PI)).toFixed(0)}°</span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={config.rotationY}
                onChange={(e) => onUpdateConfig({ rotationY: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Scale */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">Overall Scale</label>
                <span className="font-mono text-sky-400">{config.scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.25"
                step="0.02"
                value={config.scale}
                onChange={(e) => onUpdateConfig({ scale: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleResetDefaults}
              className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pose Defaults</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Dr. Evan Vance (Lead Interviewer)</span>
        <span className="text-sky-400 font-medium">State: {currentState}</span>
      </div>
    </div>
  );
};

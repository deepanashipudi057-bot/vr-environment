import React from 'react';
import { X, Keyboard, MousePointer, Glasses, Monitor, Info, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-sm">
              CS
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Career Sprint VR Room Guide</h2>
              <p className="text-xs text-slate-400">Project Demonstration & Controls Reference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Controls Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Navigation Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                  <Keyboard className="w-3.5 h-3.5 text-sky-400" /> Desktop Keyboard
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li><span className="font-mono bg-slate-950 px-1 py-0.5 rounded text-sky-300">W</span> or <span className="font-mono bg-slate-950 px-1 py-0.5 rounded text-sky-300">↑</span> : Move Forward</li>
                  <li><span className="font-mono bg-slate-950 px-1 py-0.5 rounded text-sky-300">S</span> or <span className="font-mono bg-slate-950 px-1 py-0.5 rounded text-sky-300">↓</span> : Move Backward</li>
                  <li><span className="font-mono bg-slate-950 px-1 py-0.5 rounded text-sky-300">A</span> or <span className="font-mono bg-slate-950 px-1 py-0.5 rounded text-sky-300">←</span> : Strafe Left</li>
                  <li><span className="font-mono bg-slate-950 px-1 py-0.5 rounded text-sky-300">D</span> or <span className="font-mono bg-slate-950 px-1 py-0.5 rounded text-sky-300">→</span> : Strafe Right</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                  <MousePointer className="w-3.5 h-3.5 text-sky-400" /> Mouse & Touch Look
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Click and drag anywhere in the room to look around 360°.</li>
                  <li>• Pitch up/down is smoothly clamped to human eye limits.</li>
                  <li>• Mobile: Use on-screen D-pad and look pad.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* WebXR & VR Mode */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-2">
              <Glasses className="w-4 h-4" /> WebXR Virtual Reality Setup
            </h3>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white text-xs">Testing with VR Headset:</span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Open this URL inside the built-in browser on Meta Quest (2/3/Pro), HTC Vive Focus, or Apple Vision Pro. The <strong className="text-sky-300">ENTER VR</strong> button will be active. Pressing it launches stereoscopic immersive 6DoF VR with real hand/controller locomotion!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white text-xs">Testing without VR Hardware:</span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    In regular desktop Chrome/Edge/Firefox, the app automatically runs in <strong className="text-sky-300">3D Browser Mode</strong> with zero configuration. To simulate a headset on desktop, you can install the free official <strong className="text-sky-300">WebXR API Emulator</strong> extension from the Chrome Web Store.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Environment Architecture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4" /> 3D Room & AI Interviewer Avatar
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>• <strong>Realistic Human AI Interviewer:</strong> Dr. Evan Vance, Senior Engineering Lead, with realistic human face anatomy (corneas, pupils, realistic eyes, eyelids, nose, lips, teeth), tailored navy blazer, shirt collar, silk tie, and natural hands resting on the desk.</p>
              <p>• <strong>Behavior States & Mouth Animation:</strong> Supports <span className="text-sky-300 font-semibold">IDLE</span>, <span className="text-sky-300 font-semibold">LISTENING</span>, <span className="text-sky-300 font-semibold">THINKING</span>, <span className="text-sky-300 font-semibold">SPEAKING</span> (with smooth mouth talking animation showing teeth), and <span className="text-sky-300 font-semibold">NODDING</span>.</p>
              <p>• <strong>Custom 3D Model Support:</strong> You can place any standard humanoid avatar at <code className="bg-slate-950 px-1 py-0.5 rounded text-sky-300">src/assets/models/interviewer.glb</code> (Ready Player Me, Mixamo, Blender). The app will automatically detect and load it, falling back to the procedural human if not found!</p>
              <p>• <strong>Developer Settings:</strong> Click the <span className="text-sky-300 font-semibold">Interviewer: [State]</span> button in the top bar to adjust sitting height, position, mouth speed, and test sample interview questions.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Got it, explore room
          </button>
        </div>
      </div>
    </div>
  );
};

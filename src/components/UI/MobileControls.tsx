import React, { useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface MobileControlsProps {
  onMove: (direction: 'forward' | 'backward' | 'left' | 'right', active: boolean) => void;
  onLook: (deltaX: number, deltaY: number) => void;
  onResetSeat: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onLook,
  onResetSeat,
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const deltaX = currentX - touchStartRef.current.x;
    const deltaY = currentY - touchStartRef.current.y;

    onLook(deltaX, deltaY);

    touchStartRef.current = {
      x: currentX,
      y: currentY,
    };
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 flex items-end justify-between px-6 z-30">
      {/* Left side: Movement D-pad */}
      <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60 shadow-2xl flex flex-col items-center gap-1">
        <button
          onTouchStart={() => onMove('forward', true)}
          onTouchEnd={() => onMove('forward', false)}
          onMouseDown={() => onMove('forward', true)}
          onMouseUp={() => onMove('forward', false)}
          className="w-12 h-12 rounded-xl bg-slate-800 active:bg-sky-600 flex items-center justify-center text-white border border-slate-700 select-none cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onTouchStart={() => onMove('left', true)}
            onTouchEnd={() => onMove('left', false)}
            onMouseDown={() => onMove('left', true)}
            onMouseUp={() => onMove('left', false)}
            className="w-12 h-12 rounded-xl bg-slate-800 active:bg-sky-600 flex items-center justify-center text-white border border-slate-700 select-none cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onTouchStart={() => onMove('backward', true)}
            onTouchEnd={() => onMove('backward', false)}
            onMouseDown={() => onMove('backward', true)}
            onMouseUp={() => onMove('backward', false)}
            className="w-12 h-12 rounded-xl bg-slate-800 active:bg-sky-600 flex items-center justify-center text-white border border-slate-700 select-none cursor-pointer"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onTouchStart={() => onMove('right', true)}
            onTouchEnd={() => onMove('right', false)}
            onMouseDown={() => onMove('right', true)}
            onMouseUp={() => onMove('right', false)}
            className="w-12 h-12 rounded-xl bg-slate-800 active:bg-sky-600 flex items-center justify-center text-white border border-slate-700 select-none cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right side: Look Swipe Area & Quick Reset */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <button
          onClick={onResetSeat}
          className="px-3.5 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1.5 shadow-lg active:bg-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Seat</span>
        </button>

        {/* Touch Look Area */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-28 h-28 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-dashed border-slate-600/70 flex flex-col items-center justify-center text-center p-2 shadow-xl touch-none"
        >
          <span className="text-[11px] text-slate-300 font-medium">Drag here</span>
          <span className="text-[10px] text-slate-400">to look around</span>
        </div>
      </div>
    </div>
  );
};

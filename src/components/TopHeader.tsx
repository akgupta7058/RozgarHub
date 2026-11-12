import React from 'react';
import { Sparkles, UserPlus, Shield, Smartphone, Monitor } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopHeaderProps {
  onOpenRegistration: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenRegistration,
  isMobileFrame,
  onToggleFrame,
}) => {
  return (
    <header className="bg-[#1E3A8A] text-white shadow-lg sticky top-0 z-30">
      {/* Android Status Bar Simulation */}
      <div className="bg-[#172554] text-white/80 text-[11px] px-4 py-1 flex items-center justify-between font-mono tracking-tight select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white">09:41</span>
          <span className="text-[10px] text-emerald-400 font-sans font-semibold">● 5G VoLTE</span>
        </div>
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* View toggle button */}
          <button
            onClick={onToggleFrame}
            className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
            title="Toggle Android Device Frame"
          >
            {isMobileFrame ? (
              <>
                <Monitor size={10} />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone size={10} />
                <span>Android Phone View</span>
              </>
            )}
          </button>
          <span className="text-white text-[10px]">100% 🔋</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/30 flex-shrink-0">
            <span className="text-white font-black text-xl tracking-tighter">R</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white leading-none">
                Rozgar<span className="text-orange-400">Hub</span>
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-400/30 uppercase tracking-widest">
                Direct
              </span>
            </div>
            <p className="text-[11px] font-medium text-blue-200 leading-tight mt-0.5">
              Sahi Kaam, Sahi Daam
            </p>
          </div>
        </div>

        {/* Prominent Orange Button: 'Kaam Chahiye? (Register Karein)' */}
        <button
          onClick={onOpenRegistration}
          className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer border border-orange-400/40"
        >
          <UserPlus size={15} />
          <span className="leading-tight text-left">
            <span className="block text-[10px] font-medium text-orange-100">Worker Hain?</span>
            <span className="font-bold">Kaam Chahiye? (Register)</span>
          </span>
        </button>
      </div>
    </header>
  );
};

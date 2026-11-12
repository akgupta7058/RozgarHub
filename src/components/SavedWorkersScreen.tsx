import React from 'react';
import { Bookmark, Phone, MessageCircle, ArrowRight, Trash2 } from 'lucide-react';
import { Worker } from '../types/worker';
import { WorkerCard } from './WorkerCard';

interface SavedWorkersScreenProps {
  savedWorkers: Worker[];
  onOpenProfile: (worker: Worker) => void;
  onToggleSave: (workerId: string) => void;
  onGoHome: () => void;
}

export const SavedWorkersScreen: React.FC<SavedWorkersScreenProps> = ({
  savedWorkers,
  onOpenProfile,
  onToggleSave,
  onGoHome,
}) => {
  return (
    <div className="pb-24 px-4 pt-4 max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-900 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center">
            <Bookmark size={22} className="text-orange-400 fill-orange-400" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Saved Workers (पसंदीदा)</h1>
            <p className="text-xs text-blue-200">
              Aapne {savedWorkers.length} worker profile bookmark kiye hain
            </p>
          </div>
        </div>
      </div>

      {savedWorkers.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm mt-4">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bookmark size={28} />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            Abhi koi worker save nahi hai
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Home screen par worker card par bookmark icon tap karke unhe yahan save kar sakte hain taaki baad mein direct call kar sakein.
          </p>

          <button
            onClick={onGoHome}
            className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1E3A8A] text-white text-xs font-bold shadow-md hover:bg-blue-900 transition-all cursor-pointer"
          >
            <span>Worker List Dekhein</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onOpenProfile={onOpenProfile}
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

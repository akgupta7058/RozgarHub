import React from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Briefcase,
  ShieldCheck,
  Star,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Worker } from '../types/worker';

interface WorkerCardProps {
  worker: Worker;
  onOpenProfile: (worker: Worker) => void;
  isSaved?: boolean;
  onToggleSave?: (workerId: string) => void;
  onReportSpam?: (worker: Worker) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onOpenProfile,
  isSaved = false,
  onToggleSave,
  onReportSpam,
}) => {
  const cleanPhone = worker.phone.replace(/\D/g, '');
  const encodedWhatsappMsg = encodeURIComponent(
    'Namaste, maine RozgarHub app par aapki profile dekhi, mujhe kaam ke liye baat karni hai'
  );
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedWhatsappMsg}`;

  // Initials fallback (e.g. Ramesh Kumar -> RK)
  const initials = worker.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={() => onOpenProfile(worker)}
      className="group relative bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
    >
      {/* Top row: Real Photo, Info, and Actions */}
      <div className="flex items-start gap-3.5">
        <div className="relative flex-shrink-0">
          {worker.photoBase64 ? (
            <img
              src={worker.photoBase64}
              alt={worker.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
              loading="lazy"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] text-white font-extrabold text-base flex items-center justify-center border-2 border-slate-100 shadow-xs">
              {initials || 'WK'}
            </div>
          )}

          {worker.availableToday && (
            <span
              title="Aaj kaam ke liye tayar"
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                {worker.name}
              </h3>
              {worker.verified && (
                <span title="Asli Verified Profile" className="text-emerald-600 flex-shrink-0">
                  <ShieldCheck size={16} className="fill-emerald-100 text-emerald-600" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              {/* Report Spam / Dalal button on Card */}
              {onReportSpam && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReportSpam(worker);
                  }}
                  className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 text-[10px] font-bold border border-red-200/70 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Report Fake, Dalal ya Galat Vyavahar"
                >
                  <ShieldAlert size={12} className="text-red-500" />
                  <span>Report</span>
                </button>
              )}

              {onToggleSave && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(worker.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSaved
                      ? 'text-orange-500 bg-orange-50'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  aria-label="Bookmark worker"
                >
                  {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                </button>
              )}
            </div>
          </div>

          {/* Badges: Strict Category & Experience */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-blue-50 text-blue-900 border-blue-200">
              <span>{worker.category}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
              <Briefcase size={11} className="text-slate-500" />
              <span>{worker.experienceYears} saal ka anubhav</span>
            </span>
          </div>

          {/* City / Area */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500 truncate">
            <MapPin size={13} className="text-orange-500 flex-shrink-0" />
            <span className="truncate font-medium text-slate-600">
              {worker.area}, {worker.city}
            </span>
          </div>
        </div>
      </div>

      {/* Description Snippet */}
      {worker.description && (
        <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2 rounded-xl border border-slate-100/60">
          "{worker.description}"
        </p>
      )}

      {/* Daily Rate & Rating */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Dihadi Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-emerald-600 tracking-tight">
              ₹{worker.dailyRate}
            </span>
            <span className="text-xs font-bold text-orange-600">/ din</span>
          </div>
        </div>

        <div className="text-right flex items-center gap-1.5">
          <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-1 rounded-lg text-xs font-bold border border-amber-200/60">
            <Star size={13} className="fill-amber-400 text-amber-500" />
            <span>{worker.rating ? worker.rating.toFixed(1) : '5.0'}</span>
          </div>
          <span className="text-slate-300">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>

      {/* Action Buttons: Call Now & WhatsApp */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-1">
        <a
          href={`tel:${cleanPhone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <Phone size={15} className="fill-white text-white" />
          <span>Call Now</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-sm shadow-emerald-500/20 active:scale-[0.98] transition-all"
        >
          <MessageCircle size={15} className="fill-white text-white" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

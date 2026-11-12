import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Briefcase,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  Share2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Check,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { Worker } from '../types/worker';

interface WorkerProfileModalProps {
  worker: Worker | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (workerId: string) => void;
  onReportSpam?: (worker: Worker) => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  worker,
  onClose,
  isSaved = false,
  onToggleSave,
  onReportSpam,
}) => {
  const [copied, setCopied] = useState(false);

  if (!worker) return null;

  const cleanPhone = worker.phone.replace(/\D/g, '');
  const encodedWhatsappMsg = encodeURIComponent(
    `Namaste ${worker.name} ji, maine RozgarHub app par aapki ${worker.category} profile dekhi. Mujhe kaam ke silsile mein baat karni hai.`
  );
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedWhatsappMsg}`;

  // Initials fallback
  const initials = worker.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleShare = async () => {
    const shareText = `${worker.name} - ${worker.category} (${worker.city}) | Dihadi: ₹${worker.dailyRate}/din | RozgarHub`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: worker.name,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center">
      <div className="w-full max-w-lg bg-[#F8FAFC] h-full overflow-y-auto flex flex-col relative shadow-2xl">
        {/* Sticky Header Nav */}
        <div className="sticky top-0 z-20 bg-[#1E3A8A] text-white px-4 py-3 shadow-md flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/90 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span className="text-xs font-semibold">Wapas (Back)</span>
          </button>

          <span className="text-xs font-bold tracking-tight">Karmachari Profile</span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Share Profile"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
            </button>
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(worker.id)}
                className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Bookmark worker"
              >
                {isSaved ? (
                  <BookmarkCheck size={18} className="text-orange-400 fill-orange-400" />
                ) : (
                  <Bookmark size={18} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 pb-32">
          {/* Hero Banner with Worker Real Photo Info */}
          <div className="bg-gradient-to-b from-[#1E3A8A] via-[#1E3A8A] to-[#F8FAFC] pt-4 pb-6 px-4 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                {worker.photoBase64 ? (
                  <img
                    src={worker.photoBase64}
                    alt={worker.name}
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-blue-950 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-white shadow-xl">
                    {initials || 'WK'}
                  </div>
                )}

                {worker.availableToday && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    Live
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold text-white">{worker.name}</h1>
                {worker.verified && (
                  <span title="Verified Worker">
                    <ShieldCheck size={20} className="fill-emerald-200 text-emerald-900" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-xs">
                  {worker.category}
                </span>
                <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {worker.experienceYears} saal anubhav
                </span>
              </div>

              {/* Rating summary */}
              <div className="flex items-center gap-1 mt-2.5 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-xs">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">
                  {worker.rating ? worker.rating.toFixed(1) : '5.0'} / 5.0
                </span>
                <span className="text-blue-200 text-[11px]">
                  (Asli Worker)
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 -mt-2 space-y-3.5">
            {/* Daily Rate & Availability Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dihadi Rate (Daily Wage)
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-600">
                    ₹{worker.dailyRate}
                  </span>
                  <span className="text-xs font-bold text-orange-600">/ 1 din ka</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kaam Status
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mt-1 ${
                    worker.availableToday
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      worker.availableToday ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {worker.availableToday ? 'Aaj Uplabdh Hai' : 'Vyast (Busy)'}
                </span>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <MapPin size={15} className="text-orange-500" />
                <span>Shehar Aur Kaam Ka Area</span>
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-900">{worker.area}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {worker.city}, Bharat
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Is ilaqe aur aas-paas ke 15-20 km ke daryaan kaam ke liye upalabdha.
                </p>
              </div>
            </div>

            {/* Work Description */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Briefcase size={15} className="text-blue-900" />
                <span>Kaam Ka Vivran (Work Description)</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 font-normal">
                {worker.description || 'Kabil aur anubhavi worker, samay par kaam karte hain.'}
              </p>
            </div>

            {/* Skills & Specialties */}
            {worker.skills && worker.skills.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-amber-500" />
                  <span>Khaas Kaam & Hunar (Special Skills)</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-xl text-xs font-bold"
                    >
                      <CheckCircle2 size={12} className="text-amber-600" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prominent Customer Safety & Report Spam Card */}
            <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-red-950">
                    Grahak Suraksha & Anti-Dalal Notice
                  </h4>
                  <p className="text-[11px] text-red-800 leading-relaxed mt-0.5">
                    Agar yeh worker fake hai, dalali karta hai, ya phone par galat vyavahar karta hai toh turant report karein. 3 reports milte hi yeh app se hamesha ke liye block ho jayega.
                  </p>
                </div>
              </div>

              {onReportSpam && (
                <button
                  type="button"
                  onClick={() => onReportSpam(worker)}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert size={15} />
                  <span>Report Spam / Dalal</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Large Sticky Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl">
          <div className="w-full max-w-lg grid grid-cols-2 gap-2.5">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all animate-call-pulse"
            >
              <Phone size={18} className="fill-white" />
              <span>Direct Call Karein</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <MessageCircle size={18} className="fill-white" />
              <span>WhatsApp Message</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

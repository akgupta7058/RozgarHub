import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2, ShieldAlert, FileText, Send } from 'lucide-react';
import { Worker } from '../types/worker';
import { reportWorkerSpam } from '../services/workerService';

interface SpamReportModalProps {
  worker: Worker | null;
  onClose: () => void;
  onReportSubmitted: (workerId: string, isBlocked: boolean) => void;
}

const SPAM_REASONS = [
  '1. Galat / Band Number (Wrong Number)',
  '2. Dalal / Asli Worker Nahi Hai',
  '3. Zyada Paisa Maangna / Galat Vyavahar',
  '4. Kaam Par Nahi Aaya',
];

export const SpamReportModal: React.FC<SpamReportModalProps> = ({
  worker,
  onClose,
  onReportSubmitted,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(SPAM_REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  if (!worker) return null;

  // Check if device already reported this worker
  const checkAlreadyReported = () => {
    try {
      const stored = localStorage.getItem('rozgarhubs_reported_workers');
      const list: string[] = stored ? JSON.parse(stored) : [];
      return list.includes(worker.id);
    } catch {
      return false;
    }
  };

  const markAsReportedLocally = () => {
    try {
      const stored = localStorage.getItem('rozgarhubs_reported_workers');
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(worker.id)) {
        list.push(worker.id);
        localStorage.setItem('rozgarhubs_reported_workers', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkAlreadyReported()) {
      setAlreadyReported(true);
      return;
    }

    setLoading(true);
    try {
      const { newSpamCount, isBlocked } = await reportWorkerSpam(
        worker.id,
        selectedReason,
        details
      );
      markAsReportedLocally();

      if (isBlocked) {
        setSubmittedMessage(
          `Shikayat darj kar li gayi hai. Is worker ko 3 shikayate milne par turant app se BLOCK kar diya gaya hai.`
        );
      } else {
        setSubmittedMessage(
          `Aapki shikayat darj kar li gayi hai (Report #${newSpamCount}/3). Hamari admin team iski kadi jaanch karegi.`
        );
      }

      setTimeout(() => {
        onReportSubmitted(worker.id, isBlocked);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Spam report failed:', err);
      alert('Report submit karne mein dikkat aayi. Kripya dobara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {submittedMessage ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Shikayat Safalta se Darj Hui!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              {submittedMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Report Spam / Fake / Dalal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Worker: <span className="font-bold text-slate-800">{worker.name}</span> ({worker.category})
                </p>
              </div>
            </div>

            {/* Warning alert if already reported */}
            {checkAlreadyReported() || alreadyReported ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-2xl text-xs flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Aapne pehle hi is worker ke khilaaf shikayat darj kari hui hai. Ek device se baar-baar report karne ki zaroorat nahi hai.
                </span>
              </div>
            ) : null}

            {/* Quick Reason Options */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Shikayat Ka Mukhya Kaaran Chunein (Select Reason) *
              </label>
              <div className="space-y-2">
                {SPAM_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50/60 text-red-950 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="spamReason"
                        checked={isSelected}
                        onChange={() => setSelectedReason(reason)}
                        className="text-red-600 focus:ring-red-500 accent-red-600"
                      />
                      <span>{reason}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Optional Description Box */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-500" />
                <span>Isne kya galti kari? Apni shikayat detail mein likhein (Optional)...</span>
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Jaise: Phone uthakar bola doosra thekedar hoon ya bataye rate se zyada maanga..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-slate-900 bg-slate-50/50"
              />
            </div>

            {/* 3-Strike Warning Notice */}
            <div className="bg-slate-100 p-2.5 rounded-xl text-[11px] text-slate-600 leading-relaxed">
              <strong>3-Strike Niyam:</strong> RozgarHub par kisi bhi worker ko 3 shikayate milte hi unhe system turant block karke app se hata deta hai.
            </div>

            {/* Submit Action */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || checkAlreadyReported()}
                className="flex-1 py-3 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Report Submit Karein</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

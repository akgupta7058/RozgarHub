import React, { useState } from 'react';
import {
  Calculator,
  BadgeIndianRupee,
  Users,
  Calendar,
  Share2,
  Check,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { WorkCategory } from '../types/worker';

interface WageCalculatorProps {
  onFindWorkers: (category?: WorkCategory) => void;
}

export const WageCalculatorScreen: React.FC<WageCalculatorProps> = ({
  onFindWorkers,
}) => {
  // Counters
  const [rajmistriCount, setRajmistriCount] = useState(1);
  const [rajmistriRate, setRajmistriRate] = useState(850);

  const [labourCount, setLabourCount] = useState(2);
  const [labourRate, setLabourRate] = useState(550);

  const [specialistCount, setSpecialistCount] = useState(0);
  const [specialistRate, setSpecialistRate] = useState(750);
  const [specialistType, setSpecialistType] = useState<WorkCategory>('Plumber');

  const [workingDays, setWorkingDays] = useState(5);
  const [foodTeaAllowance, setFoodTeaAllowance] = useState(100); // Chai-Nashta per person per day

  const [copied, setCopied] = useState(false);

  // Calculations
  const dailyRajmistriTotal = rajmistriCount * rajmistriRate;
  const dailyLabourTotal = labourCount * labourRate;
  const dailySpecialistTotal = specialistCount * specialistRate;
  const totalWorkers = rajmistriCount + labourCount + specialistCount;

  const dailyAllowance = totalWorkers * foodTeaAllowance;
  const dailyGrandTotal = dailyRajmistriTotal + dailyLabourTotal + dailySpecialistTotal + dailyAllowance;
  const projectGrandTotal = dailyGrandTotal * workingDays;

  const handleShareCalculation = () => {
    const text = `*RozgarHub - Dihadi Hisaab (Labor Estimate)*\n` +
      `• Rajmistri: ${rajmistriCount} mistri @ ₹${rajmistriRate}/din = ₹${dailyRajmistriTotal}\n` +
      `• Labour: ${labourCount} labour @ ₹${labourRate}/din = ₹${dailyLabourTotal}\n` +
      (specialistCount > 0 ? `• ${specialistType}: ${specialistCount} @ ₹${specialistRate}/din = ₹${dailySpecialistTotal}\n` : '') +
      `• Chai/Nashta kharcha: ₹${dailyAllowance}/din\n` +
      `---------------------------\n` +
      `*1 Din Ka Kul Kharcha:* ₹${dailyGrandTotal}\n` +
      `*Kul Din (${workingDays} din):* ₹${projectGrandTotal}\n` +
      `RozgarHub app: Sahi Kaam, Sahi Daam`;

    if (navigator.share) {
      navigator.share({ title: 'Dihadi Hisaab', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    setRajmistriCount(1);
    setRajmistriRate(850);
    setLabourCount(2);
    setLabourRate(550);
    setSpecialistCount(0);
    setWorkingDays(5);
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-xl mx-auto space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-900 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center">
              <Calculator size={22} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Dihadi Hisaab Calculator</h1>
              <p className="text-xs text-blue-200">
                Makaan ya site ke liye kul mazdoori ka andaza lagayein
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-blue-200 hover:text-white p-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
            title="Reset"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Inputs Card: Mistri & Labour */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
        {/* Rajmistri Row */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-800">
              1. Rajmistri (राजमिस्त्री)
            </span>
            <span className="text-xs font-bold text-emerald-600">
              ₹{rajmistriCount * rajmistriRate}/din
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Kitne Mistri:</span>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setRajmistriCount(Math.max(0, rajmistriCount - 1))}
                  className="px-3 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-l-xl cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={rajmistriCount}
                  onChange={(e) => setRajmistriCount(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center text-xs font-bold outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setRajmistriCount(rajmistriCount + 1)}
                  className="px-3 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-r-xl cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Dihadi Rate (₹):</span>
              <input
                type="number"
                step="50"
                value={rajmistriRate}
                onChange={(e) => setRajmistriRate(Number(e.target.value))}
                className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Labour Row */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-800">
              2. Labour / Beldar (मजदूर)
            </span>
            <span className="text-xs font-bold text-emerald-600">
              ₹{labourCount * labourRate}/din
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Kitne Mazdoor:</span>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setLabourCount(Math.max(0, labourCount - 1))}
                  className="px-3 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-l-xl cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={labourCount}
                  onChange={(e) => setLabourCount(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center text-xs font-bold outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setLabourCount(labourCount + 1)}
                  className="px-3 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-r-xl cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Dihadi Rate (₹):</span>
              <input
                type="number"
                step="50"
                value={labourRate}
                onChange={(e) => setLabourRate(Number(e.target.value))}
                className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Other Specialist Row */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">
                3. Specialist (Plumber/Electrician/Painter)
              </span>
            </div>
            {specialistCount > 0 && (
              <span className="text-xs font-bold text-emerald-600">
                ₹{specialistCount * specialistRate}/din
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Category:</span>
              <select
                value={specialistType}
                onChange={(e) => setSpecialistType(e.target.value as WorkCategory)}
                className="w-full py-2 px-1 text-[11px] font-bold rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Painter / POP">Painter / POP</option>
                <option value="Carpenter (Badhai)">Carpenter (Badhai)</option>
                <option value="Tile & Marble Mistri">Tile & Marble Mistri</option>
                <option value="Welder (Lohe ka Kaam)">Welder (Lohe ka Kaam)</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Kitne Log:</span>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setSpecialistCount(Math.max(0, specialistCount - 1))}
                  className="px-2 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-l-xl cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={specialistCount}
                  onChange={(e) => setSpecialistCount(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center text-xs font-bold outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setSpecialistCount(specialistCount + 1)}
                  className="px-2 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-r-xl cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Rate (₹):</span>
              <input
                type="number"
                step="50"
                value={specialistRate}
                onChange={(e) => setSpecialistRate(Number(e.target.value))}
                className="w-full py-2 px-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Working Days & Chai Nashta */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-700 block mb-1">
              Kitne Din Kaam Chalega:
            </span>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setWorkingDays(Math.max(1, workingDays - 1))}
                className="px-3 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-l-xl cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={workingDays}
                onChange={(e) => setWorkingDays(Math.max(1, Number(e.target.value)))}
                className="w-full text-center text-xs font-bold outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setWorkingDays(workingDays + 1)}
                className="px-3 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-r-xl cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-700 block mb-1">
              Chai/Nashta (₹/log/din):
            </span>
            <input
              type="number"
              value={foodTeaAllowance}
              onChange={(e) => setFoodTeaAllowance(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Summary Cost Result Card */}
      <div className="bg-gradient-to-br from-slate-900 to-[#1E3A8A] text-white rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] text-blue-200 font-medium">1 Din Ka Kharcha (Daily)</span>
            <div className="text-xl font-black text-emerald-400">
              ₹{dailyGrandTotal.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-blue-200 font-medium">
              Kul Din ({workingDays} Din)
            </span>
            <div className="text-2xl font-black text-orange-400">
              ₹{projectGrandTotal.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="text-xs text-blue-100 space-y-1 pt-1">
          <div className="flex justify-between">
            <span>Kul Workers:</span>
            <span className="font-bold text-white">{totalWorkers} log ({rajmistriCount} mistri + {labourCount} labour)</span>
          </div>
          <div className="flex justify-between">
            <span>Chai/Nashta Kharcha:</span>
            <span className="font-bold text-white">₹{dailyAllowance * workingDays} ({workingDays} din)</span>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={handleShareCalculation}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
            <span>{copied ? 'Copied!' : 'Hisaab Share Karein'}</span>
          </button>

          <button
            onClick={() => onFindWorkers('Rajmistri')}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>Worker Khojein</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

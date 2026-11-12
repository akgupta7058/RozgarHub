import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  BadgeIndianRupee,
  Clock,
  Phone,
  MapPin,
  FileText,
  User,
  Camera,
  Upload,
  MessageCircle,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkCategory, NewWorkerInput } from '../types/worker';
import { createWorkerProfile } from '../services/workerService';
import { STRICT_12_CATEGORIES, POPULAR_CITIES } from '../data/sampleWorkers';
import { compressWorkerPhoto, validatePhoneNumber } from '../utils/validation';

interface RegistrationScreenProps {
  onBackToHome: () => void;
  onSuccessRegistered: (newWorkerId: string) => void;
}

export const WorkerRegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onBackToHome,
  onSuccessRegistered,
}) => {
  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkCategory>('Rajmistri');
  const [dailyRate, setDailyRate] = useState<string>('750');
  const [experienceYears, setExperienceYears] = useState<string>('5');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');

  // Real Photo Upload state (NO fake AI avatars)
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success & WhatsApp Verification Popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [registeredData, setRegisteredData] = useState<{
    id: string;
    name: string;
    category: string;
    area: string;
    dailyRate: number;
    phone: string;
  } | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setCompressing(true);

    try {
      const compressed = await compressWorkerPhoto(file);
      setPhotoBase64(compressed);
    } catch (err: any) {
      console.error('Photo compression error:', err);
      setErrorMsg(err.message || 'Photo upload karne mein dikkat aayi.');
    } finally {
      setCompressing(false);
    }
  };

  const validateForm = (): string | null => {
    if (!name.trim() || name.trim().length < 2) {
      return 'Kripya apna poora naam likhein (kam se kam 2 akshar).';
    }

    // Real Photo check
    if (!photoBase64) {
      return 'Kripya apni asli photo upload karein (Camera ya Gallery se). Bina photo profile darj nahi ho sakti.';
    }

    const rateNum = Number(dailyRate);
    if (isNaN(rateNum) || rateNum < 100 || rateNum > 50000) {
      return 'Sahi dihadi rate daalein (kam se kam ₹100).';
    }

    const expNum = Number(experienceYears);
    if (isNaN(expNum) || expNum < 0 || expNum > 60) {
      return 'Kitne saal ka anubhav hai sahi sankhya mein likhein.';
    }

    // Smart phone validation (blocks fakes, 0-prefixed, repeated digits)
    const phoneCheck = validatePhoneNumber(phone);
    if (!phoneCheck.valid) {
      return phoneCheck.error || 'Sahi 10-digit mobile number daalein.';
    }

    if (!city.trim()) {
      return 'Apna shehar chunein ya likhein.';
    }

    if (!area.trim() || area.trim().length < 2) {
      return 'Apna area ya mohalla likhein (jaise Sector 62, Kankarbagh, etc.).';
    }

    if (!description.trim() || description.trim().length < 5) {
      return 'Apne kaam ke baare mein thoda zaroor likhein (kam se kam 5 akshar).';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const payload: NewWorkerInput = {
        name: name.trim(),
        category,
        dailyRate: Number(dailyRate),
        experienceYears: Number(experienceYears),
        phone: cleanPhone,
        city: city.trim(),
        area: area.trim(),
        description: description.trim(),
        photoBase64,
        availableToday: true,
      };

      const newId = await createWorkerProfile(payload);

      setRegisteredData({
        id: newId,
        name: name.trim(),
        category,
        area: area.trim(),
        dailyRate: Number(dailyRate),
        phone: cleanPhone,
      });

      setShowSuccessPopup(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1E3A8A', '#F97316', '#22C55E', '#EAB308'],
        });
      } catch (err) {
        console.log('Confetti effect trigger:', err);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg('Profile save karne mein dikkat aayi. Kripya dobara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp verification message generator
  const getWhatsAppVerifyUrl = () => {
    if (!registeredData) return '#';
    const text = `Namaste RozgarHub, main ${registeredData.name} hoon, mera kaam ${registeredData.category} hai, area ${registeredData.area} aur mera rate ₹${registeredData.dailyRate}/din hai. Kripya meri profile verify karein.`;
    return `https://wa.me/919044719305?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#1E3A8A] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-white/90 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-semibold">Home par wapas</span>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold tracking-tight">Worker Registration</h1>
          <p className="text-[10px] text-orange-200">Asli Photo & Number Ke Saath</p>
        </div>
        <div className="w-16" />
      </div>

      {/* Main Registration Form */}
      <div className="max-w-xl mx-auto px-4 py-5">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-md mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                Asli Worker Profile Banayein
              </h2>
              <p className="text-xs text-orange-100 mt-0.5">
                Zero fake accounts: Apni asli photo upload karein aur WhatsApp se verify karwake direct live ho jayein!
              </p>
            </div>
          </div>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-start gap-2 shadow-xs">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SECTION 1: Real Worker Photo Upload (No fake AI avatars) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera size={16} className="text-orange-500" />
                  <span>Apni Asli Photo Upload Karein *</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Camera se live selfie lein ya gallery se photo chunein
                </p>
              </div>
              <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                Zaroori (Mandatory)
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              {/* Photo Preview box */}
              <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoBase64 ? (
                  <img
                    src={photoBase64}
                    alt="Uploaded selfie"
                    className="w-full h-full object-cover"
                  />
                ) : compressing ? (
                  <div className="text-center p-2">
                    <RefreshCw size={20} className="animate-spin text-orange-500 mx-auto" />
                    <span className="text-[10px] text-slate-500 block mt-1">Compressing...</span>
                  </div>
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <Camera size={26} className="mx-auto" />
                    <span className="text-[9px] block mt-1">No Photo</span>
                  </div>
                )}
              </div>

              {/* Upload Action Buttons */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={compressing}
                  className="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <Upload size={14} />
                  <span>{photoBase64 ? 'Photo Badlein (Change Photo)' : 'Camera / Gallery Se Photo Chunein'}</span>
                </button>

                <p className="text-[10px] text-slate-400 leading-tight">
                  Photo automatically 200x200 compress ho kar 100% free save hogi. Fake avatar allowed nahi hai.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Full Name */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <User size={15} className="text-blue-900" />
              <span>Full Name (Apna Poora Naam) *</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Jaise: Ramesh Kumar, Suresh Yadav, Bablu Vishwakarma
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apna Poora Naam Likhein"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-900 text-sm font-semibold transition-all bg-slate-50/50"
            />
          </div>

          {/* SECTION 3: Strict 12 Home Construction & Repair Categories (NO 'Other') */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Briefcase size={15} className="text-blue-900" />
              <span>Work Category (Aapka Kaam / Trade) *</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Kewal in 12 construction aur repair categories mein se chunein:
            </p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WorkCategory)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-900 text-sm font-bold transition-all bg-white cursor-pointer"
            >
              {STRICT_12_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* SECTION 4: Daily Rate & Experience */}
          <div className="grid grid-cols-2 gap-3">
            {/* Daily Rate */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <BadgeIndianRupee size={15} className="text-emerald-600" />
                <span>Daily Rate (Dihadi ₹) *</span>
              </label>
              <p className="text-[10px] text-slate-400 mb-2">1 din ki dihadi rate</p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  step="50"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="750"
                  required
                  className="w-full pl-8 pr-3 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-900 text-sm font-bold transition-all bg-slate-50/50"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Clock size={15} className="text-blue-900" />
                <span>Anubhav (Years) *</span>
              </label>
              <p className="text-[10px] text-slate-400 mb-2">Kitne saal ka tajurba</p>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="5"
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm font-bold transition-all bg-slate-50/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                  Saal
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Smart Mobile Number Validation */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Phone size={15} className="text-emerald-600" />
              <span>10-Digit Mobile Number (Phone Number) *</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Asli number daalein (0 se shuru na karein, fake numbers block honge):
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                required
                className="w-full pl-13 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-900 text-base font-bold tracking-wider transition-all bg-slate-50/50"
              />
            </div>
            {phone.length > 0 && phone.length !== 10 && (
              <p className="text-[11px] text-orange-600 mt-1 font-medium">
                10-digit number likhein ({phone.length}/10 digits)
              </p>
            )}
          </div>

          {/* SECTION 6: City & Area/Mohalla */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <MapPin size={15} className="text-orange-500" />
                <span>City (Shehar) *</span>
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-2 no-scrollbar">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors flex-shrink-0 cursor-pointer ${
                      city === c
                        ? 'bg-blue-900 text-white border-blue-900 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jaise: Delhi NCR, Patna, Lucknow, Mumbai"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-900 text-sm font-semibold transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Area / Mohalla (Apna Area) *
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Jaise: Noida Sector 62, Kankarbagh Main Road, Gomti Nagar"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-900 text-sm font-semibold transition-all bg-slate-50/50"
              />
            </div>
          </div>

          {/* SECTION 7: Short Work Description */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <FileText size={15} className="text-blue-900" />
              <span>Short Work Description (Apne kaam ke baare mein likhein) *</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jaise: Makaan ka plaster, chunaai aur tile ka badhiya kaam karte hain. Samay par kaam poora karne ki poori guarantee."
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-900 text-sm font-normal transition-all bg-slate-50/50"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || compressing}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base tracking-wide shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Profile Save Ho Rahi Hai...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Profile Save Karein (Submit)</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Anti-Fake Policy: Form bharne ke baad WhatsApp se self-verify karein.
            </p>
          </div>
        </form>
      </div>

      {/* WhatsApp Self-Verification + Admin Approval Popup */}
      {showSuccessPopup && registeredData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Status: Pending Verification
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2 leading-tight">
                Profile Darj Ho Gayi Hai!
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Asli workers ko turant live karne ke liye WhatsApp verification zaroori hai.
              </p>
            </div>

            {/* Worker Summary Card */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
              <div className="flex items-center gap-2">
                {photoBase64 && (
                  <img
                    src={photoBase64}
                    alt={registeredData.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                )}
                <div>
                  <div className="font-bold text-slate-900">{registeredData.name}</div>
                  <div className="text-slate-500 text-[11px]">
                    {registeredData.category} • ₹{registeredData.dailyRate}/din
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Verification Action */}
            <div className="space-y-2 pt-1">
              <a
                href={getWhatsAppVerifyUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} className="fill-white" />
                <span>Verify via WhatsApp (Turant)</span>
              </a>

              <p className="text-[10px] text-slate-400">
                Number 919044719305 par verification message bhejein. Admin turant live kar denge.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessPopup(false);
                  onBackToHome();
                }}
                className="w-full py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Baad mein karein, Home par jayein
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

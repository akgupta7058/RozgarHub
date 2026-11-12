import React, { useState } from 'react';
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
  Sparkles,
  Camera,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkCategory, NewWorkerInput } from '../types/worker';
import { createWorkerProfile } from '../services/workerService';
import { POPULAR_CITIES } from '../data/sampleWorkers';

interface RegistrationScreenProps {
  onBackToHome: () => void;
  onSuccessRegistered: (newWorkerId: string) => void;
}

const CATEGORIES: { id: WorkCategory; label: string; desc: string }[] = [
  { id: 'Rajmistri', label: 'Rajmistri (राजमिस्त्री)', desc: 'Chunaai, Plaster, Tile, Marble' },
  { id: 'Labour', label: 'Labour / Beldar (मजदूर)', desc: 'Helper, Ret-Cement bori, Shifting' },
  { id: 'Thekedar', label: 'Thekedar (ठेकेदार)', desc: 'Poora Makaan, Team & Material' },
  { id: 'Plumber', label: 'Plumber (प्लम्बर)', desc: 'Nal, Pipe, Motor, Bathroom' },
  { id: 'Electrician', label: 'Electrician (इलेक्ट्रीशियन)', desc: 'Wiring, MCB, Inverter, Light' },
  { id: 'Painter', label: 'Painter (पेंटर)', desc: 'Putty, Primer, Royale, Polish' },
  { id: 'Carpenter', label: 'Carpenter (बढ़ई)', desc: 'Darwaza, Almari, Furniture' },
  { id: 'Welder', label: 'Welder (वेल्डर / लोहार)', desc: 'Gate, Grill, Shed, Iron work' },
];

const PRESET_AVATARS = [
  {
    id: 'av1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&q=80',
    title: 'Mistri 1',
  },
  {
    id: 'av2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&q=80',
    title: 'Labour 1',
  },
  {
    id: 'av3',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&q=80',
    title: 'Thekedar',
  },
  {
    id: 'av4',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces&q=80',
    title: 'Plumber',
  },
  {
    id: 'av5',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces&q=80',
    title: 'Electrician',
  },
  {
    id: 'av6',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces&q=80',
    title: 'Painter',
  },
];

const CATEGORY_DEFAULT_SKILLS: Record<WorkCategory, string[]> = {
  Rajmistri: ['Chunaai', 'Plaster', 'Tile Fitting', 'Marble Ghasayi'],
  Labour: ['Masala Tayar Karna', 'Bori Uthana', 'Khudaai', 'Loading / Unloading'],
  Thekedar: ['Poora Makaan Theka', 'RCC Dhalai', 'Labour Team', 'Supervision'],
  Plumber: ['Pipe Leakage Fix', 'Bathroom Fittings', 'Water Tank', 'Motor Connection'],
  Electrician: ['House Wiring', 'MCB Tripping Fix', 'Fan Fitting', 'Inverter Fitting'],
  Painter: ['Wall Putty', 'Exterior Apex', 'Royale Emulsion', 'Door Polish'],
  Carpenter: ['Choukhat & Darwaza', 'Modular Kitchen', 'Almari', 'Lock Fitting'],
  Welder: ['Iron Gate & Grill', 'Tin Shed', 'Railing', 'Arc Welding'],
};

export const WorkerRegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onBackToHome,
  onSuccessRegistered,
}) => {
  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkCategory>('Rajmistri');
  const [dailyRate, setDailyRate] = useState<string>('700');
  const [experienceYears, setExperienceYears] = useState<string>('5');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Chunaai',
    'Plaster',
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [savedWorkerId, setSavedWorkerId] = useState<string | null>(null);

  // When category changes, update suggested skills
  const handleCategoryChange = (newCat: WorkCategory) => {
    setCategory(newCat);
    const defaults = CATEGORY_DEFAULT_SKILLS[newCat] || [];
    setSelectedSkills(defaults.slice(0, 3));
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const validateForm = (): string | null => {
    if (!name.trim() || name.trim().length < 2) {
      return 'Kripya apna poora naam likhein (kam se kam 2 akshar).';
    }
    const rateNum = Number(dailyRate);
    if (isNaN(rateNum) || rateNum < 100 || rateNum > 50000) {
      return 'Sahi dihadi rate daalein (kam se kam ₹100).';
    }
    const expNum = Number(experienceYears);
    if (isNaN(expNum) || expNum < 0 || expNum > 60) {
      return 'Kitne saal ka anubhav hai sahi sankhya mein likhein.';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return 'Sahi 10-digit mobile number daalein (shuruwat 6, 7, 8, ya 9 se honi chahiye).';
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
      const payload: NewWorkerInput = {
        name: name.trim(),
        category,
        dailyRate: Number(dailyRate),
        experienceYears: Number(experienceYears),
        phone: phone.replace(/\D/g, ''),
        city: city.trim(),
        area: area.trim(),
        description: description.trim(),
        avatarUrl: selectedAvatar,
        skills: selectedSkills,
        availableToday: true,
      };

      const newId = await createWorkerProfile(payload);
      setSavedWorkerId(newId);
      setShowSuccessPopup(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
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
          <p className="text-[10px] text-orange-200">Kaam Chahiye? Form Bharein</p>
        </div>
        <div className="w-16" />
      </div>

      {/* Main Registration Form */}
      <div className="max-w-xl mx-auto px-4 py-5">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-md mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                Apna Rozgar Profile Banayein
              </h2>
              <p className="text-xs text-orange-100 mt-0.5">
                Seedha customers aur thekedaro se phone aur WhatsApp par kaam paayein. Zero commission!
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
          {/* Section: Avatar Picker */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Camera size={15} className="text-orange-500" />
              <span>Apna Photo / Avatar Chunein</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Jo photo aapko theek lage use tap karke select karein:
            </p>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-200 scale-105'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.title}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                        <Check size={14} className="text-white bg-orange-500 rounded-full p-0.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Full Name */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <User size={15} className="text-blue-900" />
              <span>Full Name (Apna Poora Naam) *</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Jaise: Ramesh Kumar, Suresh Yadav, Mohammad Imran
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jaise: Ramesh Kumar Mistri"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-900 text-sm font-semibold transition-all bg-slate-50/50"
            />
          </div>

          {/* 2. Work Category Dropdown */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Briefcase size={15} className="text-blue-900" />
              <span>Work Category (Aapka Kaam / Trade) *</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Aap kis cheez ka kaam karte hain:
            </p>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as WorkCategory)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-900 text-sm font-bold transition-all bg-white cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} - {cat.desc}
                </option>
              ))}
            </select>
          </div>

          {/* 3 & 4. Daily Rate & Experience */}
          <div className="grid grid-cols-2 gap-3">
            {/* Daily Rate */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
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
                  placeholder="700"
                  required
                  className="w-full pl-8 pr-3 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-900 text-sm font-bold transition-all bg-slate-50/50"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
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

          {/* 5. Mobile Number */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Phone size={15} className="text-emerald-600" />
              <span>10-Digit Mobile Number (Phone Number) *</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Isi number par customers call aur WhatsApp karenge:
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

          {/* 6. City & Area/Mohalla */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
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

          {/* Specific Skills Chips */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Khaas Kaam / Skills (Tap karke select karein)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(CATEGORY_DEFAULT_SKILLS[category] || []).map((sk) => {
                const active = selectedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors cursor-pointer ${
                      active
                        ? 'bg-orange-500 text-white border-orange-500 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {sk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Short Work Description */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <FileText size={15} className="text-blue-900" />
              <span>Short Work Description (Apne kaam ke baare mein likhein) *</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Aap kaisa kaam karte hain, kya timing hai, kitne saal ka tajurba hai:
            </p>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jaise: Makaan ka plaster, chunaai aur tile ka badiya kaam karte hain. Samay par kaam poora karne ki poori guarantee."
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-900 text-sm font-normal transition-all bg-slate-50/50"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
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
              Profile banne ke turant baad aapka number live ho jayega. Koi charges nahi.
            </p>
          </div>
        </form>
      </div>

      {/* Success Modal Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Badhaai Ho!
            </span>

            <h3 className="text-xl font-black text-slate-900 mt-2">
              Aapki profile live ho gayi hai!
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Aapka profile <span className="font-bold text-[#1E3A8A]">RozgarHub</span> par safaltapoorvak jud gaya hai. Ab log aapko seedha Call aur WhatsApp kar sakte hain.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs">
              <div className="font-bold text-slate-900">{name}</div>
              <div className="text-slate-600 text-[11px]">
                {category} • ₹{dailyRate}/din • {city}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessPopup(false);
                  if (savedWorkerId) {
                    onSuccessRegistered(savedWorkerId);
                  } else {
                    onBackToHome();
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Home Par Worker List Dekhein
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

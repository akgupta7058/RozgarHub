import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertTriangle,
  Lock,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { Worker, WorkCategory } from './types/worker';
import { subscribeToWorkers } from './services/workerService';
import { TopHeader } from './components/TopHeader';
import { CategoryChips } from './components/CategoryChips';
import { WorkerCard } from './components/WorkerCard';
import { WorkerRegistrationScreen } from './components/WorkerRegistrationScreen';
import { WorkerProfileModal } from './components/WorkerProfileModal';
import { WageCalculatorScreen } from './components/WageCalculatorScreen';
import { SavedWorkersScreen } from './components/SavedWorkersScreen';
import { BottomNav, NavTab } from './components/BottomNav';
import { POPULAR_CITIES } from './data/sampleWorkers';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AdminDashboard } from './components/AdminDashboard';
import { SpamReportModal } from './components/SpamReportModal';

export default function App() {
  // Navigation & Screen View
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Data & Real-time Firestore state
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory | 'All'>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'rate-asc' | 'rate-desc' | 'exp' | 'rating'>('recommended');

  // Modals
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [reportingWorker, setReportingWorker] = useState<Worker | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Saved/Bookmarked workers
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('rozgarhubs_saved_workers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Real-time Firestore sync
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToWorkers(
      (data) => {
        setWorkers(data);
        setLoading(false);
      },
      (err) => {
        console.warn('Subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleSave = (workerId: string) => {
    setSavedIds((prev) => {
      const updated = prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId];
      try {
        localStorage.setItem('rozgarhubs_saved_workers', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }
      return updated;
    });
  };

  // Only approved live workers count towards categories on Home
  const approvedWorkers = useMemo(() => {
    return workers.filter((w) => w.status === 'approved');
  }, [workers]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    approvedWorkers.forEach((w) => {
      counts[w.category] = (counts[w.category] || 0) + 1;
    });
    return counts;
  }, [approvedWorkers]);

  // Filtered & Sorted live approved workers
  const filteredWorkers = useMemo(() => {
    return approvedWorkers.filter((worker) => {
      // Category filter
      if (selectedCategory !== 'All' && worker.category !== selectedCategory) {
        return false;
      }

      // City filter
      if (selectedCity !== 'All' && !worker.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }

      // Search query (matches Name, City, Area, Category, Description, Phone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = worker.name.toLowerCase().includes(q);
        const matchesCity = worker.city.toLowerCase().includes(q);
        const matchesArea = worker.area.toLowerCase().includes(q);
        const matchesCategory = worker.category.toLowerCase().includes(q);
        const matchesDesc = (worker.description || '').toLowerCase().includes(q);
        const matchesPhone = worker.phone.includes(q);
        if (!matchesName && !matchesCity && !matchesArea && !matchesCategory && !matchesDesc && !matchesPhone) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rate-asc') return a.dailyRate - b.dailyRate;
      if (sortBy === 'rate-desc') return b.dailyRate - a.dailyRate;
      if (sortBy === 'exp') return b.experienceYears - a.experienceYears;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      // Recommended: Available today first, then high rating
      if (a.availableToday && !b.availableToday) return -1;
      if (!a.availableToday && b.availableToday) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [approvedWorkers, selectedCategory, selectedCity, searchQuery, sortBy]);

  const savedWorkersList = useMemo(() => {
    return approvedWorkers.filter((w) => savedIds.includes(w.id));
  }, [approvedWorkers, savedIds]);

  const handleWorkerRegistered = () => {
    setActiveTab('home');
  };

  const handleReportSubmitted = (workerId: string, isBlocked: boolean) => {
    if (selectedWorker?.id === workerId && isBlocked) {
      setSelectedWorker(null);
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'register') {
      return (
        <WorkerRegistrationScreen
          onBackToHome={() => setActiveTab('home')}
          onSuccessRegistered={handleWorkerRegistered}
        />
      );
    }

    if (activeTab === 'calculator') {
      return (
        <WageCalculatorScreen
          onFindWorkers={(cat) => {
            if (cat) setSelectedCategory(cat);
            setActiveTab('home');
          }}
        />
      );
    }

    if (activeTab === 'saved') {
      return (
        <SavedWorkersScreen
          savedWorkers={savedWorkersList}
          onOpenProfile={(w) => setSelectedWorker(w)}
          onToggleSave={handleToggleSave}
          onGoHome={() => setActiveTab('home')}
        />
      );
    }

    // Default: Home Screen (Discovery)
    return (
      <div className="pb-28 max-w-xl mx-auto space-y-3.5">
        {/* PWA Install Banner */}
        <div className="mt-3">
          <PWAInstallButton variant="banner" />
        </div>

        {/* Search Bar by Name or City/Area */}
        <div className="px-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Worker ka naam, trade ya Shehar / Area khojein..."
              className="w-full pl-10 pr-9 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold shadow-xs focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Popular City filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto mt-2 pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
              <MapPin size={12} className="text-orange-500" />
              Shehar:
            </span>
            <button
              onClick={() => setSelectedCity('All')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex-shrink-0 cursor-pointer ${
                selectedCity === 'All'
                  ? 'bg-blue-900 text-white font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Sabhi Shehar
            </button>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(selectedCity === c ? 'All' : c)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex-shrink-0 cursor-pointer ${
                  selectedCity === c
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* REQUIREMENT 3: Prominent Customer Safety & Anti-Dalal Banner */}
        <div className="mx-4 bg-amber-50/90 border border-amber-300/80 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldAlert size={18} className="text-amber-700" />
            </div>
            <div className="text-left leading-relaxed">
              <span className="text-xs font-black text-amber-950 block">
                Grahak Suraksha (Anti-Dalal Caution):
              </span>
              <p className="text-[11px] font-medium text-amber-900 mt-0.5">
                Agar koi vyakti fake, dalal, ya galat vyavahar karta hai, toh turant use chhodkar doosra worker chunein aur card par diye gaye <strong>"Report Spam"</strong> button par click karein.
              </p>
            </div>
          </div>
        </div>

        {/* Strict 12 Category Chips Carousel */}
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          categoryCounts={categoryCounts}
        />

        {/* Filter / Sort bar & Results count */}
        <div className="px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Users size={14} className="text-[#1E3A8A]" />
            <span>
              {filteredWorkers.length} Verified {selectedCategory === 'All' ? 'Worker' : selectedCategory} Live
            </span>
            {(selectedCategory !== 'All' || selectedCity !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCity('All');
                  setSearchQuery('');
                }}
                className="text-[10px] text-orange-600 underline ml-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-[11px] font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="rate-asc">Dihadi: Kam se Jyada</option>
              <option value="rate-desc">Dihadi: Jyada se Kam</option>
              <option value="exp">Anubhav (Experience)</option>
              <option value="rating">Top Rating ★</option>
            </select>
          </div>
        </div>

        {/* REQUIREMENT 4: Clean Start & Zero Fake Profiles */}
        <div className="px-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : approvedWorkers.length === 0 ? (
            // Clean Start Empty state when no verified workers exist yet
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-16 h-16 bg-blue-50 text-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Abhi koi verified worker available nahi hai. Pehle worker banein!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                RozgarHub par fake profiles poori tarah hata di gayi hain. Asli mistri aur labour registration karke WhatsApp se self-verify kar sakte hain.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('register')}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle size={16} />
                  <span>Pehle Worker Banein (Register)</span>
                </button>
              </div>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm space-y-3">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Search size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Aapke filter ke anusaar worker nahi mila
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Shehar ya category badal kar dekhein.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedCity('All');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onOpenProfile={(w) => setSelectedWorker(w)}
                isSaved={savedIds.includes(worker.id)}
                onToggleSave={handleToggleSave}
                onReportSpam={(w) => setReportingWorker(w)}
              />
            ))
          )}
        </div>

        {/* Footer with Secret Admin Link */}
        <div className="px-4 pt-6 text-center text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-500">
            RozgarHub — 100% Asli Mistri & Labour Platform • Zero Commission
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px]">
            <span>Anti-Fake & 3-Strike Auto-Block Protection</span>
            <span>•</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
              title="Admin Portal"
            >
              <Lock size={10} />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-[#F8FAFC] flex justify-center ${
        isMobileFrame ? 'p-0 sm:py-6 sm:px-4 bg-slate-800' : ''
      }`}
    >
      {/* Container - Native Mobile frame or responsive wrapper */}
      <div
        className={`w-full bg-[#F8FAFC] min-h-screen relative flex flex-col ${
          isMobileFrame
            ? 'max-w-[420px] sm:rounded-[36px] sm:border-[8px] sm:border-slate-900 sm:shadow-2xl overflow-hidden'
            : 'max-w-2xl shadow-sm'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          onOpenRegistration={() => setActiveTab('register')}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Main Body */}
        <main className="flex-1">{renderTabContent()}</main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          savedCount={savedIds.length}
        />

        {/* Worker Full Profile Modal */}
        {selectedWorker && (
          <WorkerProfileModal
            worker={selectedWorker}
            onClose={() => setSelectedWorker(null)}
            isSaved={savedIds.includes(selectedWorker.id)}
            onToggleSave={handleToggleSave}
            onReportSpam={(w) => setReportingWorker(w)}
          />
        )}

        {/* Customer Spam Report Modal */}
        {reportingWorker && (
          <SpamReportModal
            worker={reportingWorker}
            onClose={() => setReportingWorker(null)}
            onReportSubmitted={handleReportSubmitted}
          />
        )}

        {/* Secret Admin Dashboard */}
        <AdminDashboard
          workers={workers}
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />

        {/* Offline Connectivity Indicator */}
        <OfflineIndicator />
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Users,
  CheckCircle2,
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

export default function App() {
  // Navigation & Screen View
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Data & Real-time Firestore state
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory | 'All'>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'rate-asc' | 'rate-desc' | 'exp' | 'rating'>('recommended');
  const [maxRate, setMaxRate] = useState<number>(2000);

  // Modals & Bookmarks
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('rozgarhubs_saved_workers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToWorkers(
      (data) => {
        setWorkers(data);
        setLoading(false);
        setFirestoreError(null);
      },
      (err) => {
        console.warn('Subscription error handled:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save bookmarks to localStorage
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

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    workers.forEach((w) => {
      counts[w.category] = (counts[w.category] || 0) + 1;
    });
    return counts;
  }, [workers]);

  // Filtered & Sorted Workers
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      // Category filter
      if (selectedCategory !== 'All' && worker.category !== selectedCategory) {
        return false;
      }

      // City filter
      if (selectedCity !== 'All' && !worker.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }

      // Search query (matches Name, City, Area, Category, Description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = worker.name.toLowerCase().includes(q);
        const matchesCity = worker.city.toLowerCase().includes(q);
        const matchesArea = worker.area.toLowerCase().includes(q);
        const matchesCategory = worker.category.toLowerCase().includes(q);
        const matchesDesc = (worker.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesArea && !matchesCategory && !matchesDesc) {
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
  }, [workers, selectedCategory, selectedCity, searchQuery, sortBy]);

  // Saved workers list
  const savedWorkersList = useMemo(() => {
    return workers.filter((w) => savedIds.includes(w.id));
  }, [workers, savedIds]);

  // After registration, open the created worker profile or go to home
  const handleWorkerRegistered = (newWorkerId: string) => {
    setActiveTab('home');
    const newlyCreated = workers.find((w) => w.id === newWorkerId);
    if (newlyCreated) {
      setSelectedWorker(newlyCreated);
    }
  };

  // Content for each tab
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
      <div className="pb-24 max-w-xl mx-auto space-y-3.5">
        {/* Top Trust Banner */}
        <div className="mx-4 mt-3 bg-gradient-to-r from-blue-900 via-[#1E3A8A] to-blue-800 text-white rounded-2xl p-3 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="text-left leading-tight">
              <span className="text-xs font-bold text-white block">
                100% Seedha Rabta • Zero Commission
              </span>
              <span className="text-[10px] text-blue-200">
                Direct phone dialer aur WhatsApp se mistri aur labour bulayein
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
            Free
          </span>
        </div>

        {/* PWA Install Banner */}
        <PWAInstallButton variant="banner" />

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
              placeholder="Worker ka naam ya Shehar / Area khojein..."
              className="w-full pl-10 pr-9 py-3 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-semibold shadow-xs focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
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

        {/* Horizontal Category Chips */}
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
              {filteredWorkers.length} {selectedCategory === 'All' ? 'Karmachari' : selectedCategory} Uplabdh
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
              <option value="recommended">Recommended (Haazri)</option>
              <option value="rate-asc">Dihadi: Kam se Jyada</option>
              <option value="rate-desc">Dihadi: Jyada se Kam</option>
              <option value="exp">Anubhav (Experience)</option>
              <option value="rating">Top Rating ★</option>
            </select>
          </div>
        </div>

        {/* Worker Cards List */}
        <div className="px-4 space-y-3">
          {loading ? (
            // Shimmer skeletons
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
          ) : filteredWorkers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm space-y-3">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Search size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Koi worker nahi mila
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Aapke search ke anusaar koi worker uplabdh nahi hai. Search query badal kar dekhein ya apna khud ka profile register karein.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedCity('All');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Filter Hatayein
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Worker Register Karein
                </button>
              </div>
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onOpenProfile={(w) => setSelectedWorker(w)}
                isSaved={savedIds.includes(worker.id)}
                onToggleSave={handleToggleSave}
              />
            ))
          )}
        </div>

        {/* Footer info in Hinglish */}
        <div className="px-4 pt-4 text-center text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-500">
            RozgarHub — Bharat ke sabhi mistri aur labour ka bharosemand platform.
          </p>
          <p className="text-[11px]">
            Direct Call & WhatsApp connect • Real-time Firebase Firestore Sync
          </p>
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
          />
        )}

        {/* Offline Connectivity Indicator */}
        <OfflineIndicator />
      </div>
    </div>
  );
}

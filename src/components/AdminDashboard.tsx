import React, { useState, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  Phone,
  Shield,
  ShieldCheck,
  MapPin,
  Calendar,
  X,
  FileText,
  Clock,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';
import { Worker, WorkerStatus } from '../types/worker';
import { updateWorkerStatus, deleteWorkerPermanently } from '../services/workerService';

interface AdminDashboardProps {
  workers: Worker[];
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_SECRET_CODE = '7080567668';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  workers,
  isOpen,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rozgarhubs_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Admin filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'blocked'>('pending');
  const [deleteConfirmWorker, setDeleteConfirmWorker] = useState<Worker | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_SECRET_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rozgarhubs_admin_auth', 'true');
      setErrorMsg(null);
      setPasswordInput('');
    } else {
      setErrorMsg('Galat secret code! Kripya sahi code daalein.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('rozgarhubs_admin_auth');
    onClose();
  };

  const handleApprove = async (workerId: string) => {
    setActionLoadingId(workerId);
    try {
      await updateWorkerStatus(workerId, 'approved', true);
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Approve karne mein error aayi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlock = async (workerId: string) => {
    setActionLoadingId(workerId);
    try {
      await updateWorkerStatus(workerId, 'blocked');
    } catch (err) {
      console.error('Block failed:', err);
      alert('Block karne mein error aayi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmWorker) return;
    setActionLoadingId(deleteConfirmWorker.id);
    try {
      await deleteWorkerPermanently(deleteConfirmWorker.id);
      setDeleteConfirmWorker(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete karne mein error aayi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered workers for the selected tab and search
  const tabCounts = {
    pending: workers.filter((w) => w.status === 'pending').length,
    approved: workers.filter((w) => w.status === 'approved').length,
    blocked: workers.filter((w) => w.status === 'blocked').length,
  };

  const filteredWorkers = workers.filter((w) => {
    if (w.status !== activeTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = w.name.toLowerCase().includes(q);
      const matchPhone = w.phone.includes(q);
      const matchArea = w.area.toLowerCase().includes(q) || w.city.toLowerCase().includes(q);
      const matchCategory = w.category.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchArea && !matchCategory) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-center overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#F8FAFC] min-h-screen flex flex-col shadow-2xl relative">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-30 bg-[#0F172A] text-white px-4 py-3 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center font-bold text-xs">
              🔒
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight leading-none text-white">
                RozgarHub Admin Panel
              </h2>
              <span className="text-[10px] text-slate-400">
                Worker Verification & Complaints Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Logout
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Not Authenticated: Password Screen */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Lock size={30} />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Secret Admin Login
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Yahan sirf autorized admin access kar sakte hain. Secret code darj karein:
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={15} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                {/* Masked Password Input with NO length limit, NO digit counter, NO hint */}
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Secret Code..."
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-lg font-black tracking-widest focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Admin Panel Kholein
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Portal */
          <div className="p-4 space-y-4 flex-1 pb-20">
            {/* Prominent Admin Search Bar */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Worker Name, Phone (+91), ya Area se khojein..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold shadow-xs focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
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

            {/* 3 Filter Tabs: 'Pending', 'Approved Live', 'Spam/Blocked' */}
            <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Pending</span>
                <span className="bg-white/25 px-1.5 py-0.2 rounded-full text-[10px]">
                  {tabCounts.pending}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('approved')}
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Approved Live</span>
                <span className="bg-white/25 px-1.5 py-0.2 rounded-full text-[10px]">
                  {tabCounts.approved}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('blocked')}
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'blocked'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Spam/Blocked</span>
                <span className="bg-white/25 px-1.5 py-0.2 rounded-full text-[10px]">
                  {tabCounts.blocked}
                </span>
              </button>
            </div>

            {/* Workers List */}
            {filteredWorkers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm space-y-2">
                <Users size={32} className="mx-auto text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">
                  Is tab mein koi worker nahi hai
                </h4>
                <p className="text-xs text-slate-400">
                  {searchQuery ? 'Search filter ko clear karein.' : 'Koi record maujood nahi hai.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorkers.map((worker) => {
                  const initials = worker.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={worker.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
                    >
                      {/* Top Row: Photo, Name, Category, Phone */}
                      <div className="flex items-start gap-3">
                        {worker.photoBase64 ? (
                          <img
                            src={worker.photoBase64}
                            alt={worker.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] text-white font-extrabold text-base flex items-center justify-center flex-shrink-0 shadow-xs">
                            {initials || 'WK'}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="font-extrabold text-slate-900 text-sm truncate">
                                {worker.name}
                              </h4>
                              {worker.verified && (
                                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                              )}
                            </div>

                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                worker.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : worker.status === 'blocked'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {worker.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-600">
                            <span className="font-bold text-[#1E3A8A]">
                              {worker.category}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-emerald-600">
                              ₹{worker.dailyRate}/din
                            </span>
                            <span>•</span>
                            <span>{worker.experienceYears} saal exp</span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <a
                              href={`tel:${worker.phone}`}
                              className="font-bold text-slate-800 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Phone size={11} className="text-emerald-600" />
                              <span>+91 {worker.phone}</span>
                            </a>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-500 text-[11px] truncate flex items-center gap-0.5">
                              <MapPin size={11} className="text-orange-500" />
                              {worker.area}, {worker.city}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Work description snippet */}
                      {worker.description && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          "{worker.description}"
                        </p>
                      )}

                      {/* Complaint Logs section if spamCount > 0 or reports exist */}
                      {worker.reports && worker.reports.length > 0 && (
                        <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-red-800">
                            <span className="flex items-center gap-1">
                              <AlertTriangle size={14} className="text-red-600" />
                              <span>Customer Shikayatein (Complaints: {worker.reports.length})</span>
                            </span>
                            <span className="text-[10px] bg-red-200/60 px-2 py-0.5 rounded-full text-red-900">
                              Spam Strikes: {worker.spamCount}
                            </span>
                          </div>

                          <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                            {worker.reports.map((rep) => (
                              <div
                                key={rep.id}
                                className="bg-white p-2 rounded-lg border border-red-100 text-slate-800 text-[11px] space-y-0.5"
                              >
                                <div className="font-bold text-red-900">{rep.reason}</div>
                                {rep.details && (
                                  <div className="text-slate-600 italic">
                                    "{rep.details}"
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-400">
                                  {new Date(rep.createdAt).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3 Clear Action Buttons: Approve, Block, Permanent Delete */}
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                        {/* 1. Approve / Rakhna Hai */}
                        <button
                          onClick={() => handleApprove(worker.id)}
                          disabled={actionLoadingId === worker.id}
                          className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve / Rakhna Hai</span>
                        </button>

                        {/* 2. Block / Hide */}
                        <button
                          onClick={() => handleBlock(worker.id)}
                          disabled={actionLoadingId === worker.id}
                          className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          <span>Block / Hide</span>
                        </button>

                        {/* 3. Permanent Delete / Hatayein */}
                        <button
                          onClick={() => setDeleteConfirmWorker(worker)}
                          disabled={actionLoadingId === worker.id}
                          className="py-2.5 px-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          <span>Delete / Hatayein</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {deleteConfirmWorker && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl text-center space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 size={28} />
              </div>

              <h4 className="text-base font-black text-slate-900">
                Permanent Delete Karein?
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                Kya aap sach mein <strong>{deleteConfirmWorker.name}</strong> ({deleteConfirmWorker.category}) ka profile Firestore database se permanently hatana chahte hain? Yeh wapas nahi aayega.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmWorker(null)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Ruk Jayein (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Haan, Delete Karein
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

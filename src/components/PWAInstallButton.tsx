import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share, ArrowDownToLine, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  // If already installed and running standalone, do not show install CTA
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General Android / Chrome instruction if beforeinstallprompt hasn't fired yet
      setShowAndroidHelp(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className="mx-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-[#1E3A8A] text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Download size={20} className="text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-white">
                  Android App Install Karein
                </span>
                <span className="text-[9px] bg-white/20 text-emerald-100 font-bold px-1.5 py-0.2 rounded-full uppercase">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5 leading-tight">
                Phone ke home screen par app icon jodein — fast aur offline chalegi!
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="flex-shrink-0 bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowDownToLine size={14} />
            <span>Install</span>
          </button>
        </div>

        {/* Android Help Modal */}
        {showAndroidHelp && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Smartphone size={28} />
              </div>

              <h3 className="text-base font-extrabold text-slate-900">
                Android Chrome Par Install Karein
              </h3>

              <div className="text-left text-xs text-slate-600 mt-3 space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]">
                    1
                  </span>
                  <span>Chrome browser ke oopar daayein kone mein <strong>3 dots (⋮)</strong> tap karein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]">
                    2
                  </span>
                  <span><strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> chunein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]">
                    3
                  </span>
                  <span>RozgarHub app icon aapke mobile par jud jayega!</span>
                </div>
              </div>

              <button
                onClick={() => setShowAndroidHelp(false)}
                className="mt-4 w-full py-2.5 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Samajh Gaya (Close)
              </button>
            </div>
          </div>
        )}

        {/* iOS Safari Guide Modal */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl">
              <div className="w-14 h-14 bg-blue-100 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Share size={26} />
              </div>

              <h3 className="text-base font-extrabold text-slate-900">
                iPhone / iPad Par Install Karein
              </h3>

              <div className="text-left text-xs text-slate-600 mt-3 space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-900 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]">
                    1
                  </span>
                  <span>Safari browser ke neeche <strong>Share icon (डब्बा और तीर)</strong> tap karein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-900 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]">
                    2
                  </span>
                  <span>Neeche scroll karein aur <strong>"Add to Home Screen"</strong> par tap karein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-900 bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]">
                    3
                  </span>
                  <span>Kone mein <strong>"Add"</strong> dabayein.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-4 w-full py-2.5 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Theek Hai (Done)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Header variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-2.5 py-1 rounded-full shadow-xs transition-all cursor-pointer border border-emerald-400/40"
        title="Install RozgarHub Android App"
      >
        <Download size={11} className="stroke-[2.5]" />
        <span>Install App</span>
      </button>

      {/* Modals */}
      {showAndroidHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              Android Chrome Par Install Karein
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Chrome menu (⋮) khol kar <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par click karein.
            </p>
            <button
              onClick={() => setShowAndroidHelp(false)}
              className="mt-4 w-full py-2 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              iOS Par Install Karein
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Safari mein <strong>Share</strong> button dabakar <strong>"Add to Home Screen"</strong> chunein.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

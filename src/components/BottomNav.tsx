import React from 'react';
import { Search, UserPlus, Calculator, Bookmark } from 'lucide-react';

export type NavTab = 'home' | 'register' | 'calculator' | 'saved';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  savedCount,
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      labelHinglish: 'Khojein',
      labelHindi: 'खोजें',
      icon: Search,
    },
    {
      id: 'register' as NavTab,
      labelHinglish: 'Kaam Chahiye',
      labelHindi: 'रजिस्टर',
      icon: UserPlus,
      highlight: true,
    },
    {
      id: 'calculator' as NavTab,
      labelHinglish: 'Dihadi Hisaab',
      labelHindi: 'कैलकुलेटर',
      icon: Calculator,
    },
    {
      id: 'saved' as NavTab,
      labelHinglish: 'Saved',
      labelHindi: 'पसंदीदा',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="w-full max-w-xl grid grid-cols-4 px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-active:scale-95 ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-orange-500/40'
                      : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-orange-500/25'
                  }`}
                >
                  <IconComponent size={22} />
                </div>
                <span className="text-[10px] font-bold text-orange-600 mt-1 leading-tight">
                  {tab.labelHinglish}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative ${
                isActive ? 'text-[#1E3A8A]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <IconComponent
                  size={20}
                  className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] leading-tight mt-0.5 ${
                  isActive ? 'font-extrabold text-[#1E3A8A]' : 'font-medium'
                }`}
              >
                {tab.labelHinglish}
              </span>
              <span className="text-[8px] opacity-70 leading-none">
                {tab.labelHindi}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-[#1E3A8A] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

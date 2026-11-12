import React from 'react';
import {
  LayoutGrid,
  Hammer,
  HardHat,
  Briefcase,
  Grid,
  Wrench,
  Zap,
  Paintbrush,
  Axe,
  Flame,
  Square,
  Droplets,
  Fan,
} from 'lucide-react';
import { CATEGORIES } from '../data/sampleWorkers';
import { WorkCategory } from '../types/worker';

interface CategoryChipsProps {
  selectedCategory: WorkCategory | 'All';
  onSelectCategory: (category: WorkCategory | 'All') => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  const getCategoryIcon = (iconName: string, isSelected: boolean) => {
    const size = 18;
    const colorClass = isSelected ? 'text-white' : 'text-slate-700';

    switch (iconName) {
      case 'Hammer':
        return <Hammer size={size} className={colorClass} />;
      case 'HardHat':
        return <HardHat size={size} className={colorClass} />;
      case 'Briefcase':
        return <Briefcase size={size} className={colorClass} />;
      case 'Grid':
        return <Grid size={size} className={colorClass} />;
      case 'Wrench':
        return <Wrench size={size} className={colorClass} />;
      case 'Zap':
        return <Zap size={size} className={colorClass} />;
      case 'Paintbrush':
        return <Paintbrush size={size} className={colorClass} />;
      case 'Axe':
        return <Axe size={size} className={colorClass} />;
      case 'Flame':
        return <Flame size={size} className={colorClass} />;
      case 'Square':
        return <Square size={size} className={colorClass} />;
      case 'Droplets':
        return <Droplets size={size} className={colorClass} />;
      case 'Fan':
        return <Fan size={size} className={colorClass} />;
      default:
        return <LayoutGrid size={size} className={colorClass} />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Kaam Ka Category Chunein (Select Trade)
        </h2>
        <span className="text-[11px] font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full">
          12 Mukhya Kaam
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 pt-1 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? (cat.id === 'All' ? Object.values(categoryCounts).reduce((a, b) => a + b, 0) : 0);

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md shadow-blue-900/20 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-white/20' : 'bg-slate-100'
                }`}
              >
                {getCategoryIcon(cat.iconName, isSelected)}
              </div>
              <div className="text-left leading-tight">
                <div className="font-bold flex items-center gap-1.5">
                  <span>{cat.labelHinglish}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[10px] font-normal ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {cat.labelHindi}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

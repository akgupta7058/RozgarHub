export type WorkCategory =
  | 'Rajmistri'
  | 'Labour / Majdoor'
  | 'Thekedar'
  | 'Tile & Marble Mistri'
  | 'Plumber'
  | 'Electrician'
  | 'Painter / POP'
  | 'Carpenter (Badhai)'
  | 'Welder (Lohe ka Kaam)'
  | 'Glass & Aluminium Work'
  | 'Boring & Submersible Mistri'
  | 'AC & Cooler Mistri';

export type WorkerStatus = 'pending' | 'approved' | 'blocked';

export interface SpamReport {
  id: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  category: WorkCategory;
  dailyRate: number; // in Rupees
  experienceYears: number; // in Years
  phone: string; // 10-digit phone
  city: string;
  area: string;
  description: string;
  photoBase64?: string; // Real compressed client-side JPEG data URL
  status: WorkerStatus; // 'pending' | 'approved' | 'blocked'
  spamCount: number; // 0, 1, 2, >= 3
  reports?: SpamReport[]; // Customer complaints
  verified?: boolean;
  rating?: number;
  reviewsCount?: number;
  availableToday?: boolean;
  skills?: string[];
  createdAt?: string;
}

export interface NewWorkerInput {
  name: string;
  category: WorkCategory;
  dailyRate: number;
  experienceYears: number;
  phone: string;
  city: string;
  area: string;
  description: string;
  photoBase64: string; // Mandatory real photo
  skills?: string[];
  availableToday?: boolean;
}

export interface CategoryInfo {
  id: WorkCategory | 'All';
  labelHindi: string;
  labelHinglish: string;
  subtitle: string;
  iconName: string;
  color: string;
}

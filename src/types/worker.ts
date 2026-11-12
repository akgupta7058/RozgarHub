export type WorkCategory =
  | 'Rajmistri'
  | 'Labour'
  | 'Thekedar'
  | 'Plumber'
  | 'Electrician'
  | 'Painter'
  | 'Carpenter'
  | 'Welder';

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
  verified?: boolean;
  rating?: number; // e.g. 4.9
  reviewsCount?: number;
  availableToday?: boolean;
  avatarUrl?: string;
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
  avatarUrl?: string;
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

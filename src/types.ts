export type UserRole = 'founder' | 'admin' | 'staff' | 'student' | 'client' | null;

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

export type CraftCategory =
  | 'Woodworking'
  | 'Textiles'
  | 'Ceramics'
  | 'Metalwork'
  | 'Heritage Skills'
  | 'Digital Craft'
  | 'Other';

export interface Course {
  id: string;
  title: string;
  description: string;
  craftCategory: CraftCategory;
  instructor: string;
  thumbnailUrl: string;
  videoUrl?: string;
  price: number;
  isFree: boolean;
  published: boolean;
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  transcript?: string;
  order: number;
  durationSeconds?: number;
  published: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  completedAt: string;
  watchedSeconds: number;
}

export interface ServiceInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  serviceType: ServiceType;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'active' | 'closed';
  createdAt: string;
}

export type ServiceType =
  | 'social_media'
  | 'video_production'
  | 'website'
  | 'branding'
  | 'photography'
  | 'custom_strategy'
  | 'other';

export interface ClientOnboarding {
  id: string;
  clientName: string;
  email: string;
  businessName: string;
  serviceType: ServiceType;
  goals: string;
  currentPlatforms: string[];
  budget?: string;
  status: 'pending' | 'in_progress' | 'complete';
  createdAt: string;
}

export interface FreeResource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  category: 'guide' | 'template' | 'checklist' | 'video' | 'other';
  craftCategory?: CraftCategory;
  downloadCount: number;
  published: boolean;
  createdAt: string;
}

export interface GeneratedContent {
  id: string;
  userId?: string;
  contentType: 'social_bio' | 'welcome_post' | 'promo' | 'username' | 'other';
  title: string;
  content: string;
  status: 'draft' | 'approved' | 'published';
  createdAt: string;
}

export interface SocialMediaAccount {
  id: string;
  userId: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'other';
  handle: string;
  profileUrl: string;
  followers?: number;
  connected: boolean;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface SetupTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'profile' | 'social' | 'payment' | 'course' | 'branding' | 'other';
  completed: boolean;
  order: number;
}

export interface SetupProgress {
  id: string;
  userId: string;
  totalTasks: number;
  completedTasks: number;
  percentComplete: number;
  lastUpdated: string;
}

export interface APICredentials {
  id: string;
  userId: string;
  service: string;
  label: string;
  connected: boolean;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  functionName: string;
  status: 'success' | 'error';
  message: string;
  triggeredAt: string;
}

export interface EnergyLog {
  id: string;
  userId: string;
  date: string;
  level: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface SessionNotes {
  id: string;
  clientId: string;
  date: string;
  notes: string;
  nextSteps: string;
  createdBy: string;
}

export interface GlobalSettings {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

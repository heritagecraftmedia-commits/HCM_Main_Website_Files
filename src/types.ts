export type ListingTier = 'free' | 'supporter' | 'featured';

export interface MakerProfile {
  id: string;
  name: string;
  craft: string;
  email: string;
  location: string;
  postcode: string;
  website: string;
  rating: number;
  phone: string;
  tier: ListingTier;
}

export interface MakerListing {
  id: string;
  name: string;
  craft: string;
  businessName: string;
  instagram: string;
  instagramUrl: string;
  tier: ListingTier;
}

export type UserRole = 'founder' | 'admin' | 'staff' | 'rep' | 'student' | 'client' | 'customer' | null;

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

export interface RawLead {
  id: string;
  sourcePlatform: string;
  profileUrl: string;
  displayName: string;
  bioText: string;
  locationHint: string;
  categoryHint: string;
  discoveredAt: string;
}

export interface QualifiedLead {
  id: string;
  rawLeadId: string;
  artisanScore: number;
  qualificationNotes: string;
  qualified: boolean;
  reviewed: boolean;
  createdAt: string;
}

export interface EnrichedLead {
  id: string;
  makerName: string;
  makerType: string;
  craftCategory: string;
  location: string;
  website: string;
  publicEmail: string;
  socialLinks: Record<string, string>;
  summary: string;
  status: 'draft' | 'invited' | 'claimed';
  createdAt: string;
}

export interface OutreachLog {
  id: string;
  enrichedLeadId: string;
  contactMethod: string;
  messageSent: string;
  sentAt: string;
  response?: string;
}

export interface ClaimedMaker {
  id: string;
  userId: string;
  makerProfile: any;
  approved: boolean;
  published: boolean;
  claimedAt: string;
}

export type CraftCategory = 'Wood & Furniture' | 'Textiles & Clothing' | 'Pottery & Ceramics' | 'Metal & Tools' | 'Heritage & Skills' | 'Workshops & Talks' | 'Food & Produce' | 'Community' | 'Other';

export interface HubEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  websiteUrl: string;
  craftType: CraftCategory;
  source: string;
  approved: boolean;
  createdAt: string;
}

export interface DirectoryListing {
  id: string;
  enrichedLeadId?: string;
  makerName: string;
  craftCategory: string;
  location: string;
  bio: string;
  website: string;
  socialLinks: Record<string, string>;
  listingTier: 'free' | 'supporter' | 'featured';
  featuredUntil?: string;
  approved: boolean;
  published: boolean;
  claimedAt: string;
  email?: string;
  phone?: string;
  displayCategory: 'Wood & Furniture' | 'Textiles & Clothing' | 'Pottery & Ceramics' | 'Metal & Tools' | 'Heritage & Skills' | 'Workshops & Talks' | 'Community' | 'Other';
  affiliateLinks?: { label: string; url: string }[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'on-leave' | 'inactive';
  joinedAt: string;
}

export interface RadioShow {
  id: string;
  title: string;
  host: string;
  schedule: string;
  status: 'live' | 'pre-recorded' | 'planned';
  lastBroadcast?: string;
}

export interface FounderJob {
  id: string;
  task: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'completed';
  dueDate?: string;
}

export interface MakerStory {
  id: string;
  makerName: string;
  craft: string;
  image: string;
  q1: string;
  q2: string;
  q3: string;
  published: boolean;
}

export interface EventMakerLink {
  eventId: string;
  makerId: string;
  makerName?: string;
}

export interface HubEventWithMakers extends HubEvent {
  attendingMakers?: DirectoryListing[];
}

export interface MakerWithEvents extends DirectoryListing {
  upcomingEvents?: HubEvent[];
}

// Stub service — data managed directly via Supabase in the dashboard
import type { HubEvent, StaffMember, RadioShow, FounderJob, MakerStory, DirectoryListing } from '../types';

const hubService = {
  getSystemSettings: () => ({
    discoveryAgent: false,
    qualificationAgent: false,
    enrichmentAgent: false,
    outreachAgent: false,
    maintenanceMode: false,
  }),
  updateSystemSettings: (update: Record<string, boolean>) => ({
    discoveryAgent: false,
    qualificationAgent: false,
    enrichmentAgent: false,
    outreachAgent: false,
    maintenanceMode: false,
    ...update,
  }),
  getEvents: async (): Promise<HubEvent[]> => [],
  getEventMakerLinks: async (): Promise<{ eventId: string; makerId: string; makerName?: string }[]> => [],
  getStaff: async (): Promise<StaffMember[]> => [],
  getRadioShows: async (): Promise<RadioShow[]> => [],
  getFounderJobs: async (): Promise<FounderJob[]> => [],
  getMakerStories: async (): Promise<MakerStory[]> => [],
  getListings: async (): Promise<DirectoryListing[]> => [],
  approveEvent: async (_id: string) => {},
  deleteEvent: async (_id: string) => {},
  addEvent: async (_ev: Omit<HubEvent, 'id' | 'createdAt'>) => {},
  addStaff: async (_m: Omit<StaffMember, 'id' | 'joinedAt'>) => {},
  removeStaff: async (_id: string) => {},
  completeJob: async (_id: string) => {},
  addJob: async (_task: string, _priority: string) => {},
  updateRadioStatus: async (_id: string, _status: string) => {},
  linkMakerToEvent: async (_eventId: string, _makerId: string, _makerName?: string) => {},
  unlinkMakerFromEvent: async (_eventId: string, _makerId: string) => {},
  publishStory: async (_id: string) => {},
  deleteMakerStory: async (_id: string) => {},
  addMakerStory: async (_story: Omit<MakerStory, 'id'>) => {},
  approveListing: async (_id: string) => {},
  deleteListing: async (_id: string) => {},
  updateAffiliateLinks: async (_id: string, _links: { label: string; url: string }[]) => {},
};

export { hubService };

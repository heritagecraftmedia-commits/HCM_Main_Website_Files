// Stub service — AI agent functionality
import type { RawLead, EnrichedLead, OutreachLog } from '../types';

const aiAgentService = {
  getRawLeads: async (): Promise<RawLead[]> => [],
  getEnrichedLeads: async (): Promise<EnrichedLead[]> => [],
  getOutreachLogs: async (): Promise<OutreachLog[]> => [],
  runDiscoveryAgent: async (_location: string, _craft: string) => {},
  enrichLead: async (_lead: RawLead) => {},
  draftOutreach: async (_lead: EnrichedLead) => {},
  discardRawLead: async (_id: string) => {},
};

export { aiAgentService };

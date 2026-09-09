export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED';
export type LeadSource = 'WEBSITE_FORM' | 'REFERRAL' | 'LINKEDIN' | 'INSTAGRAM' | 'EMAIL' | 'ADVERTISEMENT' | 'OTHER';

export interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  source?: LeadSource;
  status?: LeadStatus;
}

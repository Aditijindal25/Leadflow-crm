export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED';
export type LeadSource = 'WEBSITE_FORM' | 'REFERRAL' | 'LINKEDIN' | 'INSTAGRAM' | 'EMAIL' | 'ADVERTISEMENT' | 'OTHER';

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  source?: LeadSource;
  status?: LeadStatus;
}

export interface LeadRecord extends LeadInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

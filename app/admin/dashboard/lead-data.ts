export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED';

export const demoLeads = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    source: 'Website Form',
    status: 'NEW' as LeadStatus,
    createdAt: '2026-09-01',
  },
  {
    id: '2',
    name: 'Mark Smith',
    email: 'mark@example.com',
    source: 'Referral',
    status: 'CONTACTED' as LeadStatus,
    createdAt: '2026-09-02',
  },
  {
    id: '3',
    name: 'Alicia Brown',
    email: 'alicia@example.com',
    source: 'LinkedIn',
    status: 'CONVERTED' as LeadStatus,
    createdAt: '2026-09-03',
  },
];

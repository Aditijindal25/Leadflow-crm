const stats = [
  { label: 'Total Leads', value: '24' },
  { label: 'New', value: '8' },
  { label: 'Contacted', value: '10' },
  { label: 'Converted', value: '6' },
];

export function LeadStats() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-4">
      {stats.map((item) => (
        <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

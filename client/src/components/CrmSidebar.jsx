import { Link, NavLink } from 'react-router-dom';

const navigation = [
  { label: 'Overview', to: '/dashboard', end: true },
  { label: 'Leads', to: '/leads' },
  { label: 'Pipeline', to: '/pipeline' },
  { label: 'Tasks', to: '/tasks' },
  { label: 'Reports', to: '/reports' },
];

export default function CrmSidebar({ open, onClose }) {
  return <aside className={`crm-sidebar ${open ? 'is-open' : ''}`}><div className="sidebar-top"><Link className="brand sidebar-brand" to="/" onClick={onClose}><span className="brand-mark">LF</span><span>LEADFLOW <b>CRM</b></span></Link><button className="sidebar-close" type="button" onClick={onClose} aria-label="Close sidebar">×</button><span className="sidebar-label">Workspace</span></div><nav className="sidebar-nav" aria-label="CRM sections">{navigation.map((item, index) => <NavLink key={item.label} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={item.end} to={item.to} onClick={onClose}><span className="nav-index">{String(index + 1).padStart(2, '0')}</span><span>{item.label}</span></NavLink>)}</nav><div className="sidebar-card"><p>Next action</p><strong>Follow up with 4 warm leads</strong><Link className="button button-primary" to="/tasks" onClick={onClose}>Review queue</Link></div></aside>;
}

import { Link } from 'react-router-dom';
import CrmPageFrame from '../components/CrmPageFrame';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const name = user?.name || user?.email || 'Workspace user';
  const email = user?.email || 'Account email unavailable';
  const role = user?.role || 'Member';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return <CrmPageFrame eyebrow="Account workspace" title="Profile settings" description="Manage your identity and review the access connected to this workspace."><div className="profile-layout"><section className="panel profile-hero"><div className="profile-avatar-large">{initials}</div><div><p className="eyebrow">Current account</p><h2>{name}</h2><p className="muted">{email}</p></div><span className="status-pill">Active</span></section><div className="profile-columns"><section className="panel profile-card"><div className="section-head"><div><p className="eyebrow">Personal details</p><h2>Account identity</h2></div></div><div className="profile-detail-list"><div><span>Full name</span><strong>{name}</strong></div><div><span>Email address</span><strong>{email}</strong></div><div><span>Role</span><strong>{role}</strong></div><div><span>Workspace</span><strong>LeadFlow Demo Workspace</strong></div></div><button className="button button-primary" type="button" disabled>Edit profile details</button></section><section className="panel profile-card"><div className="section-head"><div><p className="eyebrow">Access overview</p><h2>Workspace permissions</h2></div></div><div className="permission-list"><div><span className="permission-dot" />View leads and pipeline</div><div><span className="permission-dot" />Manage tasks and follow-ups</div><div><span className="permission-dot" />Review performance reports</div><div><span className="permission-dot" />Manage workspace settings</div></div><Link className="text-link" to="/dashboard">Back to dashboard</Link></section></div></div></CrmPageFrame>;
}

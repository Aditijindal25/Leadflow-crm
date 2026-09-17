import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const initials = (user?.name || user?.email || 'User').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const displayName = user?.name || user?.email || 'Workspace user';
  const headerName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayRole = 'User';
  const displayEmail = user?.email || 'Account email unavailable';

  return <div className="profile-menu"><button className="profile-trigger profile-trigger-compact" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={`Open profile menu for ${displayName}`}><span className="avatar">{initials}</span><span className="profile-copy"><strong>{headerName}</strong><small>{displayRole}</small></span><span className="profile-chevron">⌄</span></button>{open && <div className="profile-dropdown" role="menu"><div className="profile-dropdown-head"><span className="avatar avatar-large">{initials}</span><div><strong>{displayName}</strong><small>{displayEmail}</small></div></div><Link to="/profile" role="menuitem" onClick={() => setOpen(false)}>Profile settings</Link><button type="button" role="menuitem" onClick={onLogout}>Logout</button></div>}</div>;
}

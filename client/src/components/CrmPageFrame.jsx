import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CrmSidebar from './CrmSidebar';
import ProfileMenu from './ProfileMenu';
import { useState } from 'react';

export default function CrmPageFrame({ eyebrow, title, description, children }) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 850);

  if (loading) return <main className="shell auth-loading"><div className="data-skeleton"><span /><span /><span /></div></main>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <main className={`shell crm-shell ${sidebarOpen ? 'sidebar-visible' : ''}`}><button className="sidebar-toggle" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">☰<span>Menu</span></button><div className="crm-layout"><CrmSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><section className="crm-main"><header className="crm-topbar"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div><div className="topbar-actions"><button className="theme-toggle icon-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀' : '☾'}</button><Link className="button button-primary" to="/contact">Add lead</Link><ProfileMenu user={user} onLogout={logout} /></div></header>{children}</section></div></main>;
}

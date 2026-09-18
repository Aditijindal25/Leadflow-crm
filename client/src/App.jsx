import { Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Contact from './pages/Contact';
import Dashboard from './pages/DashboardRedesign';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Login from './pages/Login';
import Pipeline from './pages/Pipeline';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Tasks from './pages/Tasks';

function Home() {
  return <main className="shell"><nav className="nav"><Link className="brand" to="/">LEADFLOW <span>CRM</span></Link><div className="nav-links"><Link to="/">Home</Link><Link to="/contact">Contact</Link><ThemeToggle /><Link className="button button-dark" to="/login">Login</Link></div></nav><section className="hero"><p className="eyebrow">Client lead management system</p><h1>Turn every inbound inquiry into a revenue opportunity.</h1><p className="hero-copy">LeadFlow CRM centralizes lead capture, qualification, follow-up tracking, and conversion workflows so your team can move faster and close more business.</p><div className="actions"><Link className="button button-primary" to="/contact">Get started</Link><Link className="button button-light" to="/dashboard">View dashboard</Link></div></section></main>;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button>;
}

export default function App() {
  return <ThemeProvider><AuthProvider><Routes><Route path="/" element={<Home />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Login />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/leads" element={<Leads />} /><Route path="/leads/:id" element={<LeadDetail />} /><Route path="/pipeline" element={<Pipeline />} /><Route path="/reports" element={<Reports />} /><Route path="/tasks" element={<Tasks />} /><Route path="/profile" element={<Profile />} /><Route path="*" element={<Home />} /></Routes></AuthProvider></ThemeProvider>;
}

import { Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Tasks from './pages/Tasks';

function Home() {
  return <main className="shell"><nav className="nav"><Link className="brand" to="/">LEADFLOW <span>CRM</span></Link><div className="nav-links"><Link to="/">Home</Link><Link to="/contact">Contact</Link><ThemeToggle /><Link className="button button-dark" to="/login">Login</Link></div></nav><section className="hero"><p className="eyebrow">Client relationship intelligence</p><h1>Turn every lead into an opportunity.</h1><p className="hero-copy">LeadFlow keeps your pipeline focused, your follow-ups timely, and your next best action clear.</p><div className="actions"><Link className="button button-primary" to="/contact">Get started</Link><Link className="button button-light" to="/contact">Contact us</Link></div></section></main>;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button>;
}

export default function App() {
  return <ThemeProvider><AuthProvider><Routes><Route path="/" element={<Home />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Login />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/tasks" element={<Tasks />} /><Route path="*" element={<Home />} /></Routes></AuthProvider></ThemeProvider>;
}

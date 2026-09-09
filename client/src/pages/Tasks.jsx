import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

const views = [{ key: '', label: 'All tasks' }, { key: 'overdue', label: 'Overdue' }, { key: 'today', label: 'Today' }, { key: 'tomorrow', label: 'Tomorrow' }, { key: 'upcoming', label: 'Upcoming' }];

export default function Tasks() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const query = view ? `?view=${view}` : '';
    api.get(`/tasks${query}`).then(({ data }) => setTasks(data.data || [])).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [view]);

  async function completeTask(task) {
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { status: 'COMPLETED' });
      setTasks((current) => current.map((item) => item._id === task._id ? data.data : item));
    } catch (requestError) { setError(requestError.message); }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <main className="shell"><nav className="nav"><Link className="brand" to="/">LEADFLOW <span>CRM</span></Link><div className="nav-links"><Link to="/dashboard">Dashboard</Link><span className="profile-chip"><span className="avatar">{user?.name?.slice(0, 2).toUpperCase() || 'U'}</span></span><button className="theme-toggle" type="button" onClick={toggleTheme}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button><button className="button button-dark" onClick={logout}>Logout</button></div></nav><section className="dashboard-head"><div><p className="eyebrow">Work queue</p><h1>Tasks and follow-ups.</h1><p className="hero-copy">Keep every commitment visible and every next step owned.</p></div></section><div className="task-filters">{views.map((item) => <button key={item.key} className={`filter-button ${view === item.key ? 'active' : ''}`} onClick={() => setView(item.key)}>{item.label}</button>)}</div><section className="panel table-panel">{error && <p className="notice error">{error}</p>}{loading ? <p className="muted">Loading tasks...</p> : tasks.length === 0 ? <p className="muted">No tasks in this view.</p> : <div className="task-list">{tasks.map((task) => <article className={`task-card ${task.status === 'COMPLETED' ? 'completed' : ''}`} key={task._id}><div><p className="task-title">{task.title}</p><p className="muted">{task.lead?.name || 'Linked lead'}{task.lead?.company ? ` · ${task.lead.company}` : ''}</p></div><div className="task-meta"><span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span><time>{new Date(task.dueDate).toLocaleDateString()}</time>{task.status !== 'COMPLETED' && <button className="button button-light" onClick={() => completeTask(task)}>Complete</button>}</div></article>)}</div>}</section></main>;
}

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { listLeads } from '../services/leadService';
import CrmPageFrame from '../components/CrmPageFrame';

const views = [{ key: '', label: 'All tasks' }, { key: 'overdue', label: 'Overdue' }, { key: 'today', label: 'Today' }, { key: 'tomorrow', label: 'Tomorrow' }, { key: 'upcoming', label: 'Upcoming' }];
const emptyTask = { title: '', lead: '', priority: 'MEDIUM', dueDate: '' };

export default function Tasks() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [view, setView] = useState('');
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const query = view ? `?view=${view}` : '';
    api.get(`/tasks${query}`).then(({ data }) => setTasks(data.data || [])).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [view]);

  useEffect(() => {
    listLeads({ limit: 100 }).then((result) => setLeads(result.data)).catch(() => setLeads([]));
  }, []);

  async function createTask(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/tasks', { ...taskForm, status: 'TODO' });
      setTasks((current) => [data.data, ...current]);
      setTaskForm(emptyTask);
      setShowForm(false);
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function completeTask(task) {
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { status: 'COMPLETED' });
      setTasks((current) => current.map((item) => item._id === task._id ? data.data : item));
    } catch (requestError) { setError(requestError.message); }
  }

  if (authLoading) return <main className="shell auth-loading"><div className="data-skeleton"><span /><span /><span /></div></main>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <CrmPageFrame eyebrow="Follow-up tasks" title="Tasks" description="Stay ahead of follow-ups and keep opportunities moving."><div className="task-toolbar"><div><strong>{tasks.filter((task) => task.status !== 'COMPLETED').length} open tasks</strong><span className="muted"> Prioritized by due date</span></div><div className="task-toolbar-actions"><div className="task-filters">{views.map((item) => <button key={item.key} className={`filter-button ${view === item.key ? 'active' : ''}`} onClick={() => setView(item.key)}>{item.label}</button>)}</div><button className="button button-primary" type="button" onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close' : 'New task'}</button></div></div>{showForm && <form className="panel task-create-panel" onSubmit={createTask}><div className="section-head"><div><p className="eyebrow">Task creation</p><h2>Assign the next action</h2></div></div><div className="form-grid"><label className="field"><span>Task title</span><input required minLength="2" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} placeholder="Follow up with a lead" /></label><label className="field"><span>Lead</span><select required value={taskForm.lead} onChange={(event) => setTaskForm({ ...taskForm, lead: event.target.value })}><option value="">Select a lead</option>{leads.map((lead) => <option key={lead._id || lead.id} value={lead._id || lead.id}>{lead.name}{lead.company ? ` · ${lead.company}` : ''}</option>)}</select></label><label className="field"><span>Priority</span><select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label><label className="field"><span>Due date</span><input required type="datetime-local" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} /></label></div><button className="button button-primary" disabled={saving || !leads.length}>{saving ? 'Creating task...' : 'Create task'}</button>{!leads.length && <p className="muted">Add a lead before assigning a follow-up.</p>}</form>}<section className="panel table-panel task-panel">{error && <p className="notice error" role="alert">Something went wrong while loading your tasks. Please try again.</p>}{loading ? <TaskSkeleton /> : tasks.length === 0 ? <div className="empty-state"><strong>{view === 'overdue' ? 'No overdue follow-ups' : view === 'today' ? 'No tasks due today' : 'You\'re all caught up'}</strong><span>{view === 'overdue' ? 'Your pipeline has no overdue tasks.' : view === 'today' ? 'No follow-ups require attention right now.' : 'Follow-ups will appear here when they are assigned.'}</span></div> : <div className="task-list">{tasks.map((task) => <article className={`task-card ${task.status === 'COMPLETED' ? 'completed' : ''}`} key={task._id}><div><p className="task-title">{task.title}</p><p className="muted">{task.lead?.name || 'Linked lead'}{task.lead?.company ? ` · ${task.lead.company}` : ''}</p></div><div className="task-meta"><span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span><time>{new Date(task.dueDate).toLocaleDateString()}</time>{task.status !== 'COMPLETED' && <button className="button button-light" onClick={() => completeTask(task)}>Complete</button>}</div></article>)}</div>}</section></CrmPageFrame>;
}

function TaskSkeleton() { return <div className="task-skeleton" aria-label="Loading tasks"><span /><span /><span /></div>; }

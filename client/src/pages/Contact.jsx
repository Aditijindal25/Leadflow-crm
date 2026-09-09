import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const initialForm = { name: '', email: '', phone: '', company: '', projectType: 'Website', budgetRange: 'Under $500', preferredContact: 'EMAIL', preferredContactDetail: '', message: '' };

export default function Contact() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState({ loading: false, success: '', error: '' });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setState({ loading: true, success: '', error: '' });
    try {
      await api.post('/leads', { ...form, source: 'WEBSITE' });
      setForm(initialForm);
      setState({ loading: false, success: "Thanks! Your request has been received. We'll get back to you soon.", error: '' });
    } catch (error) {
      setState({ loading: false, success: '', error: error.message });
    }
  }

  return <main className="shell"><nav className="nav"><Link className="brand" to="/">LEADFLOW <span>CRM</span></Link><div className="nav-links"><button className="theme-toggle" type="button" onClick={toggleTheme}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button><Link className="button button-dark" to="/">Back home</Link></div></nav><section className="form-layout"><div><p className="eyebrow">Start a conversation</p><h1>Bring your next opportunity into focus.</h1><p className="hero-copy">Tell us what you are building. A member of the team will follow up using your preferred contact method.</p></div><form className="panel lead-form" onSubmit={submit}>
    <div className="form-grid"><Field label="Name" name="name" value={form.name} onChange={update} required /><Field label="Email" name="email" type="email" value={form.email} onChange={update} required /><Field label="Phone" name="phone" value={form.phone} onChange={update} /><Field label="Company" name="company" value={form.company} onChange={update} /></div>
    <div className="form-grid"><Select label="Project type" name="projectType" value={form.projectType} onChange={update} options={['Website', 'Web Application', 'Mobile Application', 'AI/ML', 'E-commerce', 'UI/UX Design', 'Consulting', 'Other']} /><Select label="Budget range" name="budgetRange" value={form.budgetRange} onChange={update} options={['Under $500', '$500 - $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+']} /></div>
    <Select label="Preferred contact" name="preferredContact" value={form.preferredContact} onChange={update} options={['EMAIL', 'PHONE', 'WHATSAPP', 'ANY']} />{form.preferredContact && <Field label={form.preferredContact === 'PHONE' ? 'Preferred phone number' : form.preferredContact === 'WHATSAPP' ? 'WhatsApp number' : form.preferredContact === 'EMAIL' ? 'Preferred email address' : 'How should we reach you?'} name="preferredContactDetail" type={form.preferredContact === 'EMAIL' ? 'email' : 'text'} value={form.preferredContactDetail} onChange={update} placeholder={form.preferredContact === 'ANY' ? 'Email, phone, or another preference' : 'Write your preferred contact detail'} required /> }<label className="field"><span>Message</span><textarea name="message" value={form.message} onChange={update} maxLength={5000} rows="5" placeholder="What would you like to build?" /></label>
    {state.success && <p className="notice success" role="status">{state.success}</p>}{state.error && <p className="notice error" role="alert">{state.error}</p>}<button className="button button-primary submit-button" disabled={state.loading}>{state.loading ? 'Sending...' : 'Submit lead'}</button>
  </form></section></main>;
}

function Field({ label, name, type = 'text', ...props }) { return <label className="field"><span>{label}{props.required && ' *'}</span><input name={name} type={type} {...props} /></label>; }
function Select({ label, name, options, ...props }) { return <label className="field"><span>{label}</span><select name={name} {...props}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }

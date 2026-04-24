import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Phone, Clock, CheckCircle2 } from 'lucide-react';
import { API } from '../../App';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';

export default function Grievance() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/compliance/grievance`, form);
      setSubmitted(res.data);
      toast.success('Grievance submitted. We will respond within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" data-testid="grievance-page">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/">
          <Button variant="ghost" className="mb-6" data-testid="back-home-btn">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Button>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Grievance Redressal</h1>
          <p className="text-slate-600 mb-8">
            Per the IT Act, 2000 and IT (Intermediary Guidelines) Rules, 2021, you may
            contact our Grievance Officer for any concerns regarding data, security, or service.
          </p>

          <Card className="p-6 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100" data-testid="grievance-officer-card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Grievance Officer</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <span className="text-blue-600 font-semibold">MS</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Mehul Shrishrimal</p>
                  <p className="text-xs text-slate-500">Grievance Officer, Arth-Verse (Sole Proprietorship)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <a href="mailto:grievance@arth-verse.in" className="text-blue-700 hover:underline" data-testid="grievance-email">
                  grievance@arth-verse.in
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-500" />
                <a href="tel:+919111349710" className="text-blue-700 hover:underline" data-testid="grievance-phone">
                  +91-91113-49710
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
                <p className="text-slate-700">
                  Acknowledgement within <strong>24 hours</strong>. Resolution within{' '}
                  <strong>15 days</strong>.
                </p>
              </div>
            </div>
          </Card>

          {submitted ? (
            <Card className="p-8 text-center bg-emerald-50 border-emerald-200" data-testid="grievance-success">
              <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-600 mb-3" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Grievance recorded</h3>
              <p className="text-sm text-slate-600">
                Reference ID:{' '}
                <code className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  {submitted.grievance_id}
                </code>
              </p>
              <p className="text-sm text-slate-600 mt-2">
                A confirmation has been sent to {submitted.email}. Please save this
                reference ID for follow-ups.
              </p>
              <Button className="mt-6" onClick={() => setSubmitted(null)} data-testid="file-another-btn">
                File another grievance
              </Button>
            </Card>
          ) : (
            <form onSubmit={submit} className="space-y-4" data-testid="grievance-form">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Submit a grievance</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grv-name">Your name *</Label>
                  <Input
                    id="grv-name"
                    data-testid="grievance-name-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="grv-email">Email *</Label>
                  <Input
                    id="grv-email"
                    type="email"
                    data-testid="grievance-email-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="grv-subject">Subject</Label>
                <Input
                  id="grv-subject"
                  data-testid="grievance-subject-input"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="mt-1"
                  placeholder="Short description"
                />
              </div>
              <div>
                <Label htmlFor="grv-message">Details *</Label>
                <Textarea
                  id="grv-message"
                  data-testid="grievance-message-input"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1 min-h-[140px]"
                  placeholder="Please describe your concern in detail…"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                data-testid="submit-grievance-btn"
              >
                {submitting ? 'Submitting…' : 'Submit grievance'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, Trash2, LogOut, Shield, FileText, Mail, ExternalLink } from 'lucide-react';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Settings({ token, onLogout }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const downloadMyData = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(`${API}/compliance/export-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arth-verse-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Your data has been downloaded.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Export failed');
    } finally {
      setDownloading(false);
    }
  };

  const deleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type DELETE MY ACCOUNT to confirm');
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`${API}/compliance/account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { confirmation: 'DELETE MY ACCOUNT' },
      });
      toast.success('Account deleted. Redirecting…');
      onLogout?.();
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deletion failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-24" data-testid="settings-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
          data-testid="settings-back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Settings &amp; Privacy</h1>

        {/* Data Rights Section (DPDP Act) */}
        <Card className="p-5 sm:p-6 mb-4" data-testid="data-rights-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-brand-blue" />
            <h2 className="text-lg font-semibold">Your Data Rights</h2>
          </div>
          <p className="text-sm text-slate-600 mb-5">
            Per the <strong>Digital Personal Data Protection Act, 2023</strong>, you have
            the right to access, correct, and erase your personal data held by Arth-Verse.
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={downloadMyData}
              disabled={downloading}
              className="w-full justify-between"
              data-testid="download-my-data-btn"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download my data (JSON)
              </span>
              <span className="text-xs text-slate-400">
                {downloading ? 'Preparing…' : 'Right to Access'}
              </span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  data-testid="delete-account-btn"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete my account
                  </span>
                  <span className="text-xs text-red-400">Right to Erasure</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-testid="delete-confirm-dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-700">
                    Permanently delete your account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This erases your profile, questionnaire, transactions, insurance
                    policies, and all connected data. This action <strong>cannot be
                    undone</strong>. Per the DPDP Act, deletion is permanent within 30 days.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-3">
                  <Label htmlFor="delete-confirm" className="text-xs font-medium">
                    Type{' '}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-700 font-mono">
                      DELETE MY ACCOUNT
                    </code>{' '}
                    to confirm:
                  </Label>
                  <Input
                    id="delete-confirm"
                    data-testid="delete-confirm-input"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="mt-2"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setConfirmText('')}
                    data-testid="delete-cancel-btn"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAccount}
                    disabled={deleting || confirmText !== 'DELETE MY ACCOUNT'}
                    className="bg-red-600 hover:bg-red-700"
                    data-testid="delete-confirm-action"
                  >
                    {deleting ? 'Deleting…' : 'Delete permanently'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>

        {/* Legal Section */}
        <Card className="p-5 sm:p-6 mb-4" data-testid="legal-card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-brand-blue" />
            <h2 className="text-lg font-semibold">Legal &amp; Policies</h2>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition"
              data-testid="link-privacy-policy"
            >
              <span>Privacy Policy</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition"
              data-testid="link-terms"
            >
              <span>Terms of Service</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href="/grievance"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition"
              data-testid="link-grievance"
            >
              <span>Grievance Redressal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href="mailto:grievance@arth-verse.in"
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition"
              data-testid="link-contact"
            >
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                grievance@arth-verse.in
              </span>
            </a>
          </div>
        </Card>

        {/* Session */}
        <Card className="p-5 sm:p-6" data-testid="session-card">
          <h2 className="text-lg font-semibold mb-4">Session</h2>
          <Button
            variant="outline"
            onClick={() => {
              onLogout?.();
              navigate('/');
            }}
            className="w-full justify-center"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </Card>

        {/* SEBI disclaimer footer */}
        <div className="mt-8 text-center text-xs text-slate-500 leading-relaxed">
          Arth-Verse is an educational tool. We are NOT a SEBI-registered investment
          advisor, RBI-registered lender, or IRDAI-licensed insurance distributor.
          Consult a qualified professional before making financial decisions.
        </div>
      </div>
    </div>
  );
}

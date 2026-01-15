import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function PolicyCoverageModal({ isOpen, onClose, policy, token }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checklist, setChecklist] = useState({ inclusions: [], exclusions: [] });
  const [coverage, setCoverage] = useState({
    inclusions: {},
    exclusions: {},
    custom_notes: ''
  });

  useEffect(() => {
    if (isOpen && policy) {
      fetchData();
    }
  }, [isOpen, policy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch checklist for this category
      const checklistRes = await axios.get(
        `${API}/arthrakshak/coverage-checklist/${policy.category}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChecklist(checklistRes.data);

      // Fetch existing coverage
      const coverageRes = await axios.get(
        `${API}/arthrakshak/policies/${policy.id}/coverage`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoverage(coverageRes.data);
    } catch (error) {
      console.error('Failed to fetch coverage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInclusion = (key) => {
    setCoverage(prev => ({
      ...prev,
      inclusions: {
        ...prev.inclusions,
        [key]: !prev.inclusions[key]
      }
    }));
  };

  const toggleExclusion = (key) => {
    setCoverage(prev => ({
      ...prev,
      exclusions: {
        ...prev.exclusions,
        [key]: !prev.exclusions[key]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API}/arthrakshak/policies/${policy.id}/coverage`,
        coverage,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Coverage details saved');
      onClose();
    } catch (error) {
      toast.error('Failed to save coverage');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !policy) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="coverage-modal">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Policy Coverage Details</h2>
            <p className="text-sm text-slate-500">{policy.insurer_name} - {policy.policy_number}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-coverage-modal-btn">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">Loading coverage details...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Info Banner */}
            <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Review your policy coverage</p>
                <p className="text-sm text-blue-700 mt-1">
                  Mark what's included and excluded in your policy to get accurate protection gap analysis.
                </p>
              </div>
            </div>

            {/* Inclusions */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                What's Covered (Inclusions)
              </h3>
              <div className="space-y-2">
                {checklist.inclusions.map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      coverage.inclusions[item.key]
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    data-testid={`inclusion-${item.key}`}
                  >
                    <input
                      type="checkbox"
                      checked={coverage.inclusions[item.key] || false}
                      onChange={() => toggleInclusion(item.key)}
                      className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span className={coverage.inclusions[item.key] ? 'text-green-900' : 'text-slate-700'}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            {checklist.exclusions.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  What's NOT Covered (Exclusions)
                </h3>
                <div className="space-y-2">
                  {checklist.exclusions.map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        coverage.exclusions[item.key]
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      data-testid={`exclusion-${item.key}`}
                    >
                      <input
                        type="checkbox"
                        checked={coverage.exclusions[item.key] || false}
                        onChange={() => toggleExclusion(item.key)}
                        className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className={coverage.exclusions[item.key] ? 'text-red-900' : 'text-slate-700'}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Notes */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Additional Notes</h3>
              <textarea
                value={coverage.custom_notes}
                onChange={(e) => setCoverage(prev => ({ ...prev, custom_notes: e.target.value }))}
                placeholder="Add any additional notes about your policy coverage..."
                className="w-full p-3 border rounded-lg min-h-[100px] resize-none"
                data-testid="custom-notes-textarea"
              />
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-full"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-brand-blue hover:bg-brand-blue/90 rounded-full"
                disabled={saving}
                data-testid="save-coverage-btn"
              >
                {saving ? 'Saving...' : 'Save Coverage Details'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

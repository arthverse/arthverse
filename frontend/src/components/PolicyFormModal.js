import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const POLICY_TYPES = {
  life: [
    { value: 'term_insurance', label: 'Term Insurance' },
    { value: 'lic_endowment', label: 'LIC Endowment' },
    { value: 'ulip', label: 'ULIP' }
  ],
  health: [
    { value: 'health_individual', label: 'Individual Health' },
    { value: 'health_family_floater', label: 'Family Floater' },
    { value: 'health_corporate', label: 'Corporate Health' }
  ],
  vehicle: [
    { value: 'vehicle_car', label: 'Car Insurance' },
    { value: 'vehicle_two_wheeler', label: 'Two Wheeler Insurance' }
  ],
  cards: [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'loan_linked', label: 'Loan Linked Insurance' }
  ]
};

const PREMIUM_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One Time' }
];

export default function PolicyFormModal({ isOpen, onClose, onSave, policy, token }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'life',
    policy_type: 'term_insurance',
    insurer_name: '',
    policy_number: '',
    start_date: '',
    end_date: '',
    premium_amount: '',
    premium_frequency: 'yearly',
    sum_assured: '',
    nominee_added: false,
    nominees: [],
    document_url: ''
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        category: policy.category || 'life',
        policy_type: policy.policy_type || 'term_insurance',
        insurer_name: policy.insurer_name || '',
        policy_number: policy.policy_number || '',
        start_date: policy.start_date || '',
        end_date: policy.end_date || '',
        premium_amount: policy.premium_amount || '',
        premium_frequency: policy.premium_frequency || 'yearly',
        sum_assured: policy.sum_assured || '',
        nominee_added: policy.nominee_added || false,
        nominees: policy.nominees || [],
        document_url: policy.document_url || ''
      });
    } else {
      // Reset form for new policy
      setFormData({
        category: 'life',
        policy_type: 'term_insurance',
        insurer_name: '',
        policy_number: '',
        start_date: '',
        end_date: '',
        premium_amount: '',
        premium_frequency: 'yearly',
        sum_assured: '',
        nominee_added: false,
        nominees: [],
        document_url: ''
      });
    }
  }, [policy, isOpen]);

  const handleCategoryChange = (category) => {
    const defaultType = POLICY_TYPES[category]?.[0]?.value || '';
    setFormData(prev => ({
      ...prev,
      category,
      policy_type: defaultType
    }));
  };

  const handleAddNominee = () => {
    setFormData(prev => ({
      ...prev,
      nominee_added: true,
      nominees: [...prev.nominees, { name: '', relationship: '', percentage: 100 }]
    }));
  };

  const handleRemoveNominee = (index) => {
    setFormData(prev => ({
      ...prev,
      nominees: prev.nominees.filter((_, i) => i !== index),
      nominee_added: prev.nominees.length > 1
    }));
  };

  const handleNomineeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      nominees: prev.nominees.map((n, i) => 
        i === index ? { ...n, [field]: value } : n
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        premium_amount: parseFloat(formData.premium_amount) || 0,
        sum_assured: parseFloat(formData.sum_assured) || 0
      };

      if (policy) {
        // Update existing policy
        await axios.put(`${API}/arthrakshak/policies/${policy.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Policy updated successfully');
      } else {
        // Create new policy
        await axios.post(`${API}/arthrakshak/policies`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Policy added successfully');
      }
      
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="policy-form-modal">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">{policy ? 'Edit Policy' : 'Add New Policy'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-modal-btn">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Insurance Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(POLICY_TYPES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                    formData.category === cat
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  data-testid={`category-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Policy Type */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Policy Type</Label>
            <select
              value={formData.policy_type}
              onChange={(e) => setFormData(prev => ({ ...prev, policy_type: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              data-testid="policy-type-select"
            >
              {POLICY_TYPES[formData.category]?.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Insurer Name</Label>
              <Input
                value={formData.insurer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, insurer_name: e.target.value }))}
                placeholder="e.g., HDFC Life, ICICI Prudential"
                required
                data-testid="insurer-name-input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Policy Number</Label>
              <Input
                value={formData.policy_number}
                onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                placeholder="e.g., POL123456789"
                required
                data-testid="policy-number-input"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
                data-testid="start-date-input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
                data-testid="end-date-input"
              />
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Sum Assured (₹)</Label>
              <Input
                type="number"
                value={formData.sum_assured}
                onChange={(e) => setFormData(prev => ({ ...prev, sum_assured: e.target.value }))}
                placeholder="e.g., 5000000"
                required
                data-testid="sum-assured-input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Premium Amount (₹)</Label>
              <Input
                type="number"
                value={formData.premium_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, premium_amount: e.target.value }))}
                placeholder="e.g., 15000"
                required
                data-testid="premium-amount-input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Premium Frequency</Label>
              <select
                value={formData.premium_frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, premium_frequency: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                data-testid="premium-frequency-select"
              >
                {PREMIUM_FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nominees Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Nominees</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNominee}
                className="rounded-full"
                data-testid="add-nominee-btn"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Nominee
              </Button>
            </div>
            
            {formData.nominees.length > 0 ? (
              <div className="space-y-3">
                {formData.nominees.map((nominee, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <Input
                        value={nominee.name}
                        onChange={(e) => handleNomineeChange(idx, 'name', e.target.value)}
                        placeholder="Nominee Name"
                        className="mb-2"
                        data-testid={`nominee-name-${idx}`}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={nominee.relationship}
                          onChange={(e) => handleNomineeChange(idx, 'relationship', e.target.value)}
                          placeholder="Relationship"
                          data-testid={`nominee-relationship-${idx}`}
                        />
                        <Input
                          type="number"
                          value={nominee.percentage}
                          onChange={(e) => handleNomineeChange(idx, 'percentage', parseFloat(e.target.value))}
                          placeholder="Share %"
                          max={100}
                          data-testid={`nominee-percentage-${idx}`}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveNominee(idx)}
                      className="text-red-500 hover:bg-red-50"
                      data-testid={`remove-nominee-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 p-3 bg-slate-50 rounded-lg">
                No nominees added. Click "Add Nominee" to add beneficiaries.
              </p>
            )}
          </div>

          {/* Document URL (optional) */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Document URL (Optional)</Label>
            <Input
              value={formData.document_url}
              onChange={(e) => setFormData(prev => ({ ...prev, document_url: e.target.value }))}
              placeholder="Link to policy document"
              data-testid="document-url-input"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-blue hover:bg-brand-blue/90 rounded-full"
              disabled={loading}
              data-testid="save-policy-btn"
            >
              {loading ? 'Saving...' : (policy ? 'Update Policy' : 'Add Policy')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Shield, Plus, AlertTriangle, CheckCircle, 
  XCircle, HelpCircle, ChevronRight, FileText,
  Heart, Car, CreditCard, User, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import PolicyFormModal from '../components/PolicyFormModal';
import RiskProfileModal from '../components/RiskProfileModal';
import PolicyCoverageModal from '../components/PolicyCoverageModal';

const STATUS_CONFIG = {
  covered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Covered' },
  underinsured: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Underinsured' },
  not_insured: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Not Insured' },
  unknown: { icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Unknown' }
};

const CATEGORY_CONFIG = {
  life: { icon: User, color: 'bg-blue-500', label: 'Life Insurance' },
  health: { icon: Heart, color: 'bg-red-500', label: 'Health Insurance' },
  vehicle: { icon: Car, color: 'bg-green-500', label: 'Vehicle Insurance' },
  cards: { icon: CreditCard, color: 'bg-purple-500', label: 'Cards/Credit Insurance' }
};

export default function ArthRakshakDashboard({ token, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [protectionGap, setProtectionGap] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, gapRes] = await Promise.all([
        axios.get(`${API}/arthrakshak/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/arthrakshak/protection-gap`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setSummary(summaryRes.data);
      setProtectionGap(gapRes.data);
    } catch (error) {
      toast.error('Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPolicy = () => {
    setEditingPolicy(null);
    setShowPolicyModal(true);
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setShowPolicyModal(true);
  };

  const handleViewCoverage = (policy) => {
    setSelectedPolicy(policy);
    setShowCoverageModal(true);
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      await axios.delete(`${API}/arthrakshak/policies/${policyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Policy deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const handlePolicySaved = () => {
    setShowPolicyModal(false);
    setEditingPolicy(null);
    fetchData();
  };

  const handleRiskProfileSaved = () => {
    setShowRiskModal(false);
    fetchData();
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-orange-500';
    if (score >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return 'Well Protected';
    if (score >= 50) return 'Partially Protected';
    if (score >= 25) return 'Underprotected';
    return 'At Risk';
  };

  if (loading) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="flex items-center justify-center h-96" data-testid="arthrakshak-loading">
          <div className="text-lg text-slate-600">Loading ArthRakshak...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto p-6" data-testid="arthrakshak-dashboard">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/arthverse/portal')}
              className="rounded-full"
              data-testid="back-to-portal-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
            <div>
              <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2" data-testid="arthrakshak-title">
                <img src="/logo-rakshak.png" alt="Arth-Rakshak" className="h-12 object-contain" />
              </h1>
              <p className="text-slate-600 font-body">"Your financial shield." - Insurance & Risk Coverage</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowRiskModal(true)}
              variant="outline"
              className="rounded-full"
              data-testid="risk-profile-btn"
            >
              <User className="w-4 h-4 mr-2" />
              Risk Profile
            </Button>
            <Button
              onClick={handleAddPolicy}
              className="bg-brand-orange hover:bg-brand-orange/90 rounded-full"
              data-testid="add-policy-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Policy
            </Button>
          </div>
        </div>

        {/* Protection Score Card */}
        <Card className="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl" data-testid="protection-score-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center relative">
                <div className={`text-5xl font-bold font-mono ${getScoreColor(protectionGap?.protection_score || 0)}`}>
                  {protectionGap?.protection_score || 0}
                </div>
                <div className="absolute -bottom-2 text-sm text-slate-400">/100</div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Protection Score</h2>
                <p className={`text-xl font-medium ${getScoreColor(protectionGap?.protection_score || 0)}`}>
                  {getScoreLabel(protectionGap?.protection_score || 0)}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Based on your insurance coverage and risk profile
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-slate-400 text-sm">Total Policies</p>
                <p className="text-3xl font-bold" data-testid="total-policies">{summary?.total_policies || 0}</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-slate-400 text-sm">Annual Premium</p>
                <p className="text-3xl font-bold" data-testid="total-premium">₹{(summary?.total_annual_premium || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk Categories Grid */}
        <h2 className="text-2xl font-bold font-heading mb-4">Coverage Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {['life_insurance', 'health_insurance', 'vehicle_insurance', 'cards_insurance'].map((key) => {
            const data = protectionGap?.[key];
            const status = STATUS_CONFIG[data?.status] || STATUS_CONFIG.unknown;
            const StatusIcon = status.icon;
            const categoryKey = key.replace('_insurance', '');
            const category = CATEGORY_CONFIG[categoryKey === 'cards' ? 'cards' : categoryKey];
            const CategoryIcon = category?.icon || Shield;
            
            return (
              <Card key={key} className="p-5 rounded-2xl border-2 hover:shadow-lg transition-all" data-testid={`coverage-${categoryKey}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${category?.color || 'bg-slate-500'} flex items-center justify-center`}>
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{data?.category || category?.label}</h3>
                <p className="text-slate-600 text-sm mb-3">{data?.message}</p>
                {data?.gap_amount > 0 && (
                  <p className="text-red-600 text-sm font-medium">
                    Gap: ₹{(data.gap_amount / 100000).toFixed(1)} Lakh
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Action Items */}
        {protectionGap?.action_items?.length > 0 && (
          <Card className="mb-8 p-6 rounded-2xl border-2 border-orange-200 bg-orange-50" data-testid="action-items-card">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Recommended Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {protectionGap.action_items.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded-lg border">
                  <ChevronRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{action}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Unprotected Areas */}
        {protectionGap?.unprotected_areas?.length > 0 && (
          <Card className="mb-8 p-6 rounded-2xl border-2 border-red-200 bg-red-50" data-testid="unprotected-areas-card">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Unprotected Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {protectionGap.unprotected_areas.map((area, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {area}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Policies List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-heading">Your Insurance Policies</h2>
            <Button
              onClick={handleAddPolicy}
              variant="outline"
              className="rounded-full"
              data-testid="add-policy-btn-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Policy
            </Button>
          </div>
          
          {summary?.policies?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.policies.map((policy) => {
                const category = CATEGORY_CONFIG[policy.category];
                const CategoryIcon = category?.icon || Shield;
                
                return (
                  <Card key={policy.id} className="p-5 rounded-2xl border hover:shadow-lg transition-all" data-testid={`policy-card-${policy.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${category?.color || 'bg-slate-500'} flex items-center justify-center`}>
                        <CategoryIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600 capitalize">
                        {policy.policy_type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{policy.insurer_name}</h4>
                    <p className="text-slate-500 text-sm mb-3">Policy #{policy.policy_number}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sum Assured</span>
                        <span className="font-semibold">₹{(policy.sum_assured / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Premium</span>
                        <span className="font-medium">₹{policy.premium_amount?.toLocaleString()}/{policy.premium_frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expiry</span>
                        <span className="text-slate-700">{policy.end_date}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full text-xs"
                        onClick={() => handleViewCoverage(policy)}
                        data-testid={`coverage-btn-${policy.id}`}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Coverage
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full text-xs"
                        onClick={() => handleEditPolicy(policy)}
                        data-testid={`edit-btn-${policy.id}`}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs text-red-600 hover:bg-red-50"
                        onClick={() => handleDeletePolicy(policy.id)}
                        data-testid={`delete-btn-${policy.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center rounded-2xl border-2 border-dashed" data-testid="no-policies-card">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Policies Added Yet</h3>
              <p className="text-slate-500 mb-6">Start by adding your insurance policies to track coverage</p>
              <Button
                onClick={handleAddPolicy}
                className="bg-brand-orange hover:bg-brand-orange/90 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Policy
              </Button>
            </Card>
          )}
        </div>

        {/* Modals */}
        <PolicyFormModal
          isOpen={showPolicyModal}
          onClose={() => { setShowPolicyModal(false); setEditingPolicy(null); }}
          onSave={handlePolicySaved}
          policy={editingPolicy}
          token={token}
        />
        
        <RiskProfileModal
          isOpen={showRiskModal}
          onClose={() => setShowRiskModal(false)}
          onSave={handleRiskProfileSaved}
          token={token}
        />
        
        <PolicyCoverageModal
          isOpen={showCoverageModal}
          onClose={() => { setShowCoverageModal(false); setSelectedPolicy(null); }}
          policy={selectedPolicy}
          token={token}
        />
      </div>
    </Layout>
  );
}

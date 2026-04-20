import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function StabilityStep({ formData, setFormData }) {
  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2" data-testid="stability-step-title">4. Insurance & Financial Habits</h2>
      <p className="text-sm text-slate-600 mb-6">Section F (Insurance) and Section G (Financial Habits).</p>
      
      <div className="space-y-6">
        {/* Life Insurance - Term */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-brand-blue mb-4">Term Life Insurance (F1-F3)</h3>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              checked={formData.has_term_life_insurance}
              onCheckedChange={(v) => setFormData({ ...formData, has_term_life_insurance: v })}
              data-testid="has-term-life-checkbox"
            />
            <Label className="text-sm">I have a pure Term Life Insurance policy</Label>
          </div>
          {formData.has_term_life_insurance && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">F2. Sum Assured (Cover)</Label>
                <Input type="number" data-testid="term-cover-input" value={formData.term_insurance_cover} onChange={(e) => setFormData({ ...formData, term_insurance_cover: Number(e.target.value) || 0 })} className="mt-1" placeholder="e.g., 1,00,00,000" />
              </div>
              <div>
                <Label className="text-sm font-medium">F3. Annual Premium</Label>
                <Input type="number" value={formData.term_insurance_premium_annual} onChange={(e) => setFormData({ ...formData, term_insurance_premium_annual: Number(e.target.value) || 0 })} className="mt-1" placeholder="Yearly premium" />
              </div>
            </div>
          )}
        </div>

        {/* ULIP / Endowment */}
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">ULIP / Endowment (F4-F6)</h3>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              checked={formData.has_ulip_endowment}
              onCheckedChange={(v) => setFormData({ ...formData, has_ulip_endowment: v })}
            />
            <Label className="text-sm">I have ULIP / Endowment / Money-back plan</Label>
          </div>
          {formData.has_ulip_endowment && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">F5. Sum Assured</Label>
                <Input type="number" value={formData.ulip_endowment_cover} onChange={(e) => setFormData({ ...formData, ulip_endowment_cover: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
              </div>
              <div>
                <Label className="text-sm font-medium">F6. Annual Premium</Label>
                <Input type="number" value={formData.ulip_endowment_premium_annual} onChange={(e) => setFormData({ ...formData, ulip_endowment_premium_annual: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
              </div>
            </div>
          )}
        </div>

        {/* Health Insurance */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Health Insurance (F7-F12)</h3>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              checked={formData.has_health_insurance}
              onCheckedChange={(v) => setFormData({ ...formData, has_health_insurance: v })}
              data-testid="has-health-insurance-checkbox"
            />
            <Label className="text-sm">I have health insurance</Label>
          </div>
          {formData.has_health_insurance && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">F8. Insurance Type</Label>
                <Select value={formData.health_insurance_type} onValueChange={(val) => setFormData({ ...formData, health_insurance_type: val })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal / Family Floater</SelectItem>
                    <SelectItem value="employer">Employer Only</SelectItem>
                    <SelectItem value="both">Both Personal + Employer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">F9. Sum Insured (Cover)</Label>
                <Input type="number" data-testid="health-cover-input" value={formData.health_insurance_cover} onChange={(e) => setFormData({ ...formData, health_insurance_cover: Number(e.target.value) || 0 })} className="mt-1" placeholder="e.g., 10,00,000" />
              </div>
              <div>
                <Label className="text-sm font-medium">F10. Annual Premium</Label>
                <Input type="number" value={formData.health_insurance_premium_annual} onChange={(e) => setFormData({ ...formData, health_insurance_premium_annual: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
              </div>
              <div>
                <Label className="text-sm font-medium">F11. Family Members Covered</Label>
                <Input type="number" value={formData.family_members_covered} onChange={(e) => setFormData({ ...formData, family_members_covered: Number(e.target.value) || 1 })} className="mt-1" placeholder="Including self" min={1} />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Checkbox checked={formData.dependent_parents_covered} onCheckedChange={(v) => setFormData({ ...formData, dependent_parents_covered: v })} />
                <Label className="text-sm">F12. Dependent parents also covered?</Label>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Insurance */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Vehicle Insurance (F13-F16)</h3>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox checked={formData.has_vehicle} onCheckedChange={(v) => setFormData({ ...formData, has_vehicle: v })} data-testid="has-vehicle-checkbox" />
            <Label className="text-sm">I own a vehicle</Label>
          </div>
          {formData.has_vehicle && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">F14. Insurance Type</Label>
                <Select value={formData.vehicle_insurance_type} onValueChange={(val) => setFormData({ ...formData, vehicle_insurance_type: val })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive (OD + TP)</SelectItem>
                    <SelectItem value="third_party">Third Party Only</SelectItem>
                    <SelectItem value="none">No Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">F15. Annual Premium</Label>
                <Input type="number" value={formData.vehicle_insurance_premium_annual} onChange={(e) => setFormData({ ...formData, vehicle_insurance_premium_annual: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
              </div>
              <div>
                <Label className="text-sm font-medium">F16. IDV (Insured Declared Value)</Label>
                <Input type="number" value={formData.vehicle_idv} onChange={(e) => setFormData({ ...formData, vehicle_idv: Number(e.target.value) || 0 })} className="mt-1" placeholder="Vehicle insured value" />
              </div>
            </div>
          )}
        </div>

        {/* Section G: Financial Habits */}
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">Financial Stability Checkpoints (G1-G7)</h3>
          <p className="text-xs text-slate-500 mb-4">Select the option that best describes your current situation.</p>
          <div className="space-y-5">
            {/* G1 */}
            <div>
              <Label className="text-sm font-semibold text-slate-800">G1. Do you have a personal health insurance policy?</Label>
              <Select value={formData.habit_q1_health_insurance} onValueChange={(val) => setFormData({ ...formData, habit_q1_health_insurance: val })}>
                <SelectTrigger className="mt-1" data-testid="habit-g1-select"><SelectValue placeholder="Select answer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A. Yes - Personal/family floater (5L+ cover)</SelectItem>
                  <SelectItem value="B">B. No - Only employer-provided cover</SelectItem>
                  <SelectItem value="C">C. No health insurance at all</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* G2 */}
            <div>
              <Label className="text-sm font-semibold text-slate-800">G2. Do you have a pure Term Life Insurance policy?</Label>
              <Select value={formData.habit_q2_term_insurance} onValueChange={(val) => setFormData({ ...formData, habit_q2_term_insurance: val })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select answer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A. Yes - Pure term plan (10x+ annual income)</SelectItem>
                  <SelectItem value="B">B. No - Only ULIP/Endowment</SelectItem>
                  <SelectItem value="C">C. No life insurance at all</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* G3 */}
            <div>
              <Label className="text-sm font-semibold text-slate-800">G3. Do you file ITR every year before deadline?</Label>
              <Select value={formData.habit_q3_itr_filing} onValueChange={(val) => setFormData({ ...formData, habit_q3_itr_filing: val })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select answer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A. Yes - Always on time, check 26AS</SelectItem>
                  <SelectItem value="B">B. Yes - But usually after deadline</SelectItem>
                  <SelectItem value="C">C. Only when required (loan/visa)</SelectItem>
                  <SelectItem value="D">D. No - I do not file ITR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* G4 */}
            <div>
              <Label className="text-sm font-semibold text-slate-800">G4. Do you carry a credit card?</Label>
              <Select value={formData.habit_q4_credit_card} onValueChange={(val) => setFormData({ ...formData, habit_q4_credit_card: val, has_credit_card: val === 'A' })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select answer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A. Yes</SelectItem>
                  <SelectItem value="B">B. No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* G5 */}
            <div>
              <Label className="text-sm font-semibold text-slate-800">G5. Do you carry a revolving credit card balance?</Label>
              <Select value={formData.habit_q5_cc_revolving} onValueChange={(val) => setFormData({ ...formData, habit_q5_cc_revolving: val })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select answer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A. No - Always pay full outstanding</SelectItem>
                  <SelectItem value="B">B. Occasionally - A few times a year</SelectItem>
                  <SelectItem value="C">C. Yes - Regularly carry balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* G6 */}
            <div>
              <Label className="text-sm font-semibold text-slate-800">G6. Active personal loan for consumption?</Label>
              <Select value={formData.habit_q6_personal_loan} onValueChange={(val) => setFormData({ ...formData, habit_q6_personal_loan: val })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select answer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A. No personal loan for consumption</SelectItem>
                  <SelectItem value="B">B. Yes - One loan, paying off</SelectItem>
                  <SelectItem value="C">C. Yes - Multiple consumer loans</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* G7 */}
            <div>
              <Label className="text-sm font-semibold text-slate-800">G7. Do you invest regularly beyond FD/savings?</Label>
              <Select value={formData.habit_q7_invest_beyond_fd} onValueChange={(val) => setFormData({ ...formData, habit_q7_invest_beyond_fd: val })}>
                <SelectTrigger className="mt-1" data-testid="habit-g7-select"><SelectValue placeholder="Select answer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A. Yes - Regular SIP/stocks/MF</SelectItem>
                  <SelectItem value="B">B. No - Only FD/savings account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

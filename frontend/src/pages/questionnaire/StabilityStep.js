import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function StabilityStep({ 
  formData, 
  setFormData, 
  addCreditCard, 
  removeCreditCard,
  creditCardsList
}) {
  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">4. Financial Profile & Stability</h2>
      
      <div className="space-y-6">
        {/* NEW: Profile & Demographics Section */}
        <div>
          <h3 className="text-lg font-semibold text-brand-blue mb-4">Profile & Demographics</h3>
          <p className="text-sm text-slate-500 mb-4">This helps us customize benchmarks based on your location and family situation.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block mb-2 font-medium">City Tier</Label>
              <Select value={formData.city_tier} onValueChange={(value) => setFormData({ ...formData, city_tier: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select city tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier_1">Tier 1 (Mumbai, Delhi, Bangalore, etc.)</SelectItem>
                  <SelectItem value="tier_2">Tier 2 (Pune, Jaipur, Lucknow, etc.)</SelectItem>
                  <SelectItem value="tier_3">Tier 3 (Smaller cities)</SelectItem>
                  <SelectItem value="tier_4">Tier 4 (District headquarters)</SelectItem>
                  <SelectItem value="town">Town</SelectItem>
                  <SelectItem value="village">Village</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block mb-2 font-medium">Family Situation</Label>
              <Select value={formData.family_situation} onValueChange={(value) => setFormData({ ...formData, family_situation: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select family situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_stable">Single / Stable Job</SelectItem>
                  <SelectItem value="married_children">Married / With Children</SelectItem>
                  <SelectItem value="family_elderly">Family with Elderly Parents</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur / Variable Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* NEW: Insurance Coverage Section */}
        <div>
          <h3 className="text-lg font-semibold text-brand-blue mb-4">Insurance Coverage Details</h3>
          <p className="text-sm text-slate-500 mb-4">Enter your insurance coverage amounts and annual premiums.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Life Insurance</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Coverage Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.life_insurance_coverage || ''}
                    onChange={(e) => setFormData({ ...formData, life_insurance_coverage: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 10000000"
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm">Annual Premium (₹)</Label>
                  <Input
                    type="number"
                    value={formData.life_insurance_premium || ''}
                    onChange={(e) => setFormData({ ...formData, life_insurance_premium: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 15000"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">Health Insurance</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Coverage Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.health_insurance_coverage || ''}
                    onChange={(e) => setFormData({ ...formData, health_insurance_coverage: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 1000000"
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm">Annual Premium (₹)</Label>
                  <Input
                    type="number"
                    value={formData.health_insurance_premium || ''}
                    onChange={(e) => setFormData({ ...formData, health_insurance_premium: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 25000"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 md:col-span-2">
              <h4 className="font-semibold text-amber-900 mb-3">Vehicle Insurance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Do you own a vehicle?</Label>
                  <Select value={formData.has_vehicle ? 'yes' : 'no'} onValueChange={(value) => setFormData({ ...formData, has_vehicle: value === 'yes' })}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.has_vehicle && (
                  <>
                    <div>
                      <Label className="text-sm">Insurance Type</Label>
                      <Select value={formData.vehicle_insurance_type} onValueChange={(value) => setFormData({ ...formData, vehicle_insurance_type: value })}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprehensive">Comprehensive (Own Damage + TP)</SelectItem>
                          <SelectItem value="third_party">Third Party Only</SelectItem>
                          <SelectItem value="none">No Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Annual Premium (₹)</Label>
                      <Input
                        type="number"
                        value={formData.vehicle_insurance_premium || ''}
                        onChange={(e) => setFormData({ ...formData, vehicle_insurance_premium: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 8000"
                        className="bg-white"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-brand-blue mb-4">Financial Stability Checkpoints</h3>
          <p className="text-sm text-slate-500 mb-4">Answer these 7 questions to help us assess your financial discipline and stability.</p>
          
          <div className="space-y-5">
            {/* Q1 - Health Insurance */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Label className="block mb-2 font-semibold text-amber-900">
                Q1. Do you have a personal health insurance policy (not just employer-provided)?
              </Label>
              <Select value={formData.q1_health_insurance} onValueChange={(value) => setFormData({ ...formData, q1_health_insurance: value, has_health_insurance: value === 'yes_personal' })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_personal">Yes – Personal/family floater policy (≥ ₹5L cover)</SelectItem>
                  <SelectItem value="only_employer">No – Only employer-provided health cover</SelectItem>
                  <SelectItem value="no_insurance">No health insurance at all</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Q2 - Term Life Insurance */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <Label className="block mb-2 font-semibold text-orange-900">
                Q2. Do you have a pure Term Life Insurance policy?
              </Label>
              <Select value={formData.q2_term_insurance} onValueChange={(value) => setFormData({ ...formData, q2_term_insurance: value, has_term_insurance: value === 'yes_term' })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_term">Yes – Pure term plan (coverage ≥ 10× annual income)</SelectItem>
                  <SelectItem value="only_ulip">No – Only ULIP/Endowment/LIC money-back plan</SelectItem>
                  <SelectItem value="no_insurance">No life insurance at all</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Q3 - ITR Filing */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <Label className="block mb-2 font-semibold text-green-900">
                Q3. Do you file your Income Tax Return (ITR) every year before the deadline?
              </Label>
              <Select value={formData.q3_itr_filing} onValueChange={(value) => setFormData({ ...formData, q3_itr_filing: value, files_itr_yearly: value === 'yes_ontime' || value === 'yes_late', takes_tds_refund: value === 'yes_ontime' })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_ontime">Yes – Always on time, and I check Form 26AS/claim TDS refunds</SelectItem>
                  <SelectItem value="yes_late">Yes – But usually after the deadline</SelectItem>
                  <SelectItem value="only_required">Only when required (loan/visa application)</SelectItem>
                  <SelectItem value="no_file">No – I do not file ITR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Q4 - Credit Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <Label className="block mb-2 font-semibold text-slate-900">
                Q4. Do you carry a credit card?
              </Label>
              <Select value={formData.q4_credit_card} onValueChange={(value) => setFormData({ ...formData, q4_credit_card: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Q5 - Revolving CC Balance */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <Label className="block mb-2 font-semibold text-red-900">
                Q5. Do you carry a revolving credit card balance (i.e., not paying the full amount each month)?
              </Label>
              <Select value={formData.q5_cc_balance} onValueChange={(value) => setFormData({ ...formData, q5_cc_balance: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_always_full">No – I always pay the full outstanding amount</SelectItem>
                  <SelectItem value="occasionally">Occasionally – a few times a year</SelectItem>
                  <SelectItem value="yes_minimum">Yes – I regularly carry a balance and pay only minimum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Q6 - Personal Loan */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <Label className="block mb-2 font-semibold text-rose-900">
                Q6. Do you have an active personal loan taken for consumption (not for buying an asset)?
              </Label>
              <Select value={formData.q6_personal_loan} onValueChange={(value) => setFormData({ ...formData, q6_personal_loan: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_loan">No personal loan for consumption</SelectItem>
                  <SelectItem value="one_loan">Yes – one loan, actively paying it off</SelectItem>
                  <SelectItem value="multiple_loans">Yes – multiple personal/consumer loans active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Q7 - Regular Investing */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <Label className="block mb-2 font-semibold text-blue-900">
                Q7. Do you invest regularly beyond savings accounts and Fixed Deposits?
              </Label>
              <Select value={formData.q7_regular_investing} onValueChange={(value) => setFormData({ ...formData, q7_regular_investing: value, invests_in_mutual_funds: value === 'yes_regular' })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_regular">Yes – Regular SIP/stocks/MF investments</SelectItem>
                  <SelectItem value="no_fd_only">No – All savings kept only in FD or savings account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-brand-blue mb-3">Your Credit Cards</h3>
          <div className="flex gap-2 mb-3">
            <Select value={formData.selected_credit_card} onValueChange={(value) => setFormData({ ...formData, selected_credit_card: value })}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a credit card" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {creditCardsList.map((card) => (
                  <SelectItem key={card} value={card}>{card}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={addCreditCard} className="bg-brand-blue">Add</Button>
          </div>
          
          {formData.credit_cards.length > 0 && (
            <div className="space-y-2">
              {formData.credit_cards.map((card) => (
                <div key={card} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">{card}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCreditCard(card)}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

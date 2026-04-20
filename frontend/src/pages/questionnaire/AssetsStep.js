import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';

export default function AssetsStep({ formData, setFormData }) {
  const totalAssets = (
    Number(formData.bank_savings_balance || 0) +
    Number(formData.cash_in_hand || 0) +
    Number(formData.sweep_fd_balance || 0) +
    Number(formData.regular_fd_balance || 0) +
    Number(formData.liquid_mf_balance || 0) +
    Number(formData.equity_mf_current_value || 0) +
    Number(formData.direct_stocks_value || 0) +
    Number(formData.debt_mf_bonds_value || 0) +
    Number(formData.ppf_nps_balance || 0) +
    Number(formData.gold_silver_value || 0) +
    Number(formData.real_estate_primary_value || 0) +
    Number(formData.real_estate_investment_value || 0) +
    Number(formData.ulip_endowment_value || 0) +
    Number(formData.other_assets || 0)
  );

  const totalLiabilities = (
    Number(formData.home_loan_outstanding || 0) +
    Number(formData.vehicle_loan_outstanding || 0) +
    Number(formData.education_loan_outstanding || 0) +
    Number(formData.personal_loan_outstanding || 0) +
    Number(formData.credit_card_outstanding || 0)
  );

  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2" data-testid="assets-step-title">3. Assets & Liabilities</h2>
      <p className="text-sm text-slate-600 mb-6">Section D (Assets) and Section E (Liabilities) from your balance sheet.</p>
      
      <div className="space-y-6">
        {/* Liquid Assets */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-brand-blue mb-4">Liquid Assets (D1-D5)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">D1. Bank Savings Balance</Label>
              <Input type="number" data-testid="bank-savings-input" value={formData.bank_savings_balance} onChange={(e) => setFormData({ ...formData, bank_savings_balance: Number(e.target.value) || 0 })} className="mt-1" placeholder="All savings accounts" />
            </div>
            <div>
              <Label className="text-sm font-medium">D2. Cash in Hand</Label>
              <Input type="number" data-testid="cash-in-hand-input" value={formData.cash_in_hand} onChange={(e) => setFormData({ ...formData, cash_in_hand: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">D3. Sweep-in FD</Label>
              <Input type="number" value={formData.sweep_fd_balance} onChange={(e) => setFormData({ ...formData, sweep_fd_balance: Number(e.target.value) || 0 })} className="mt-1" placeholder="Highly liquid" />
            </div>
            <div>
              <Label className="text-sm font-medium">D4. Regular FD</Label>
              <Input type="number" value={formData.regular_fd_balance} onChange={(e) => setFormData({ ...formData, regular_fd_balance: Number(e.target.value) || 0 })} className="mt-1" placeholder="With lock-in" />
            </div>
            <div>
              <Label className="text-sm font-medium">D5. Liquid / Overnight MF</Label>
              <Input type="number" value={formData.liquid_mf_balance} onChange={(e) => setFormData({ ...formData, liquid_mf_balance: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Equity Investments */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Equity Investments (D6-D9)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">D6. Equity MF — Current Value</Label>
              <Input type="number" data-testid="equity-mf-value-input" value={formData.equity_mf_current_value} onChange={(e) => setFormData({ ...formData, equity_mf_current_value: Number(e.target.value) || 0 })} className="mt-1" placeholder="Market value today" />
            </div>
            <div>
              <Label className="text-sm font-medium">D7. Equity MF — Amount Invested</Label>
              <Input type="number" data-testid="equity-mf-cost-input" value={formData.equity_mf_invested_amount} onChange={(e) => setFormData({ ...formData, equity_mf_invested_amount: Number(e.target.value) || 0 })} className="mt-1" placeholder="Total invested (cost)" />
            </div>
            <div>
              <Label className="text-sm font-medium">D8. Direct Stocks — Current Value</Label>
              <Input type="number" data-testid="stocks-value-input" value={formData.direct_stocks_value} onChange={(e) => setFormData({ ...formData, direct_stocks_value: Number(e.target.value) || 0 })} className="mt-1" placeholder="Market value" />
            </div>
            <div>
              <Label className="text-sm font-medium">D9. Direct Stocks — Purchase Cost</Label>
              <Input type="number" value={formData.direct_stocks_cost} onChange={(e) => setFormData({ ...formData, direct_stocks_cost: Number(e.target.value) || 0 })} className="mt-1" placeholder="Total purchase cost" />
            </div>
          </div>
        </div>

        {/* Debt & Retirement */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Debt & Retirement (D10-D14)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">D10. Debt MF / Bonds — Value</Label>
              <Input type="number" value={formData.debt_mf_bonds_value} onChange={(e) => setFormData({ ...formData, debt_mf_bonds_value: Number(e.target.value) || 0 })} className="mt-1" placeholder="Current value" />
            </div>
            <div>
              <Label className="text-sm font-medium">D11. Debt MF / Bonds — Invested</Label>
              <Input type="number" value={formData.debt_mf_bonds_invested} onChange={(e) => setFormData({ ...formData, debt_mf_bonds_invested: Number(e.target.value) || 0 })} className="mt-1" placeholder="Amount invested" />
            </div>
            <div>
              <Label className="text-sm font-medium">D12. PPF + NPS Balance</Label>
              <Input type="number" data-testid="ppf-nps-input" value={formData.ppf_nps_balance} onChange={(e) => setFormData({ ...formData, ppf_nps_balance: Number(e.target.value) || 0 })} className="mt-1" placeholder="Total contributions" />
            </div>
            <div>
              <Label className="text-sm font-medium">D13. Gold & Silver — Value</Label>
              <Input type="number" value={formData.gold_silver_value} onChange={(e) => setFormData({ ...formData, gold_silver_value: Number(e.target.value) || 0 })} className="mt-1" placeholder="Current market value" />
            </div>
            <div>
              <Label className="text-sm font-medium">D14. Gold & Silver — Cost</Label>
              <Input type="number" value={formData.gold_silver_cost} onChange={(e) => setFormData({ ...formData, gold_silver_cost: Number(e.target.value) || 0 })} className="mt-1" placeholder="Purchase cost" />
            </div>
          </div>
        </div>

        {/* Real Estate & Other */}
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">Real Estate & Other (D15-D18)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">D15. Primary Home — Market Value</Label>
              <Input type="number" value={formData.real_estate_primary_value} onChange={(e) => setFormData({ ...formData, real_estate_primary_value: Number(e.target.value) || 0 })} className="mt-1" placeholder="Current value" />
            </div>
            <div>
              <Label className="text-sm font-medium">D16. Investment Property — Value</Label>
              <Input type="number" value={formData.real_estate_investment_value} onChange={(e) => setFormData({ ...formData, real_estate_investment_value: Number(e.target.value) || 0 })} className="mt-1" placeholder="If any" />
            </div>
            <div>
              <Label className="text-sm font-medium">D17. ULIP/Endowment Surrender Value</Label>
              <Input type="number" value={formData.ulip_endowment_value} onChange={(e) => setFormData({ ...formData, ulip_endowment_value: Number(e.target.value) || 0 })} className="mt-1" placeholder="Current surrender value" />
            </div>
            <div>
              <Label className="text-sm font-medium">D18. Other Assets (EPF, Gratuity, etc.)</Label>
              <Input type="number" value={formData.other_assets} onChange={(e) => setFormData({ ...formData, other_assets: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Section E: Liabilities */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Liabilities (E1-E14)</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Home Loan */}
            <div className="col-span-3"><p className="text-xs uppercase font-bold text-slate-500 mt-2">Home Loan</p></div>
            <div>
              <Label className="text-sm font-medium">E1. Outstanding</Label>
              <Input type="number" data-testid="home-loan-outstanding-input" value={formData.home_loan_outstanding} onChange={(e) => setFormData({ ...formData, home_loan_outstanding: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E2. Monthly EMI</Label>
              <Input type="number" data-testid="home-loan-emi-input" value={formData.home_loan_emi} onChange={(e) => setFormData({ ...formData, home_loan_emi: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E3. Interest Rate (%)</Label>
              <Input type="number" value={formData.home_loan_interest_rate} onChange={(e) => setFormData({ ...formData, home_loan_interest_rate: Number(e.target.value) || 0 })} className="mt-1" placeholder="8.5" step="0.1" />
            </div>

            {/* Vehicle Loan */}
            <div className="col-span-3"><p className="text-xs uppercase font-bold text-slate-500 mt-2">Vehicle Loan</p></div>
            <div>
              <Label className="text-sm font-medium">E4. Outstanding</Label>
              <Input type="number" value={formData.vehicle_loan_outstanding} onChange={(e) => setFormData({ ...formData, vehicle_loan_outstanding: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E5. Monthly EMI</Label>
              <Input type="number" value={formData.vehicle_loan_emi} onChange={(e) => setFormData({ ...formData, vehicle_loan_emi: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E6. Interest Rate (%)</Label>
              <Input type="number" value={formData.vehicle_loan_interest_rate} onChange={(e) => setFormData({ ...formData, vehicle_loan_interest_rate: Number(e.target.value) || 0 })} className="mt-1" placeholder="9.0" step="0.1" />
            </div>

            {/* Education Loan */}
            <div className="col-span-3"><p className="text-xs uppercase font-bold text-slate-500 mt-2">Education Loan</p></div>
            <div>
              <Label className="text-sm font-medium">E7. Outstanding</Label>
              <Input type="number" value={formData.education_loan_outstanding} onChange={(e) => setFormData({ ...formData, education_loan_outstanding: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E8. Monthly EMI</Label>
              <Input type="number" value={formData.education_loan_emi} onChange={(e) => setFormData({ ...formData, education_loan_emi: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E9. Interest Rate (%)</Label>
              <Input type="number" value={formData.education_loan_interest_rate} onChange={(e) => setFormData({ ...formData, education_loan_interest_rate: Number(e.target.value) || 0 })} className="mt-1" placeholder="9.0" step="0.1" />
            </div>

            {/* Personal Loan + CC + Other */}
            <div className="col-span-3"><p className="text-xs uppercase font-bold text-slate-500 mt-2">Personal Loan, Credit Card & Other</p></div>
            <div>
              <Label className="text-sm font-medium">E10. Personal Loan Outstanding</Label>
              <Input type="number" value={formData.personal_loan_outstanding} onChange={(e) => setFormData({ ...formData, personal_loan_outstanding: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E11. Personal Loan EMI</Label>
              <Input type="number" value={formData.personal_loan_emi} onChange={(e) => setFormData({ ...formData, personal_loan_emi: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E12. Credit Card Outstanding</Label>
              <Input type="number" data-testid="cc-outstanding-input" value={formData.credit_card_outstanding} onChange={(e) => setFormData({ ...formData, credit_card_outstanding: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E13. CC EMI (Revolving)</Label>
              <Input type="number" value={formData.credit_card_emi_monthly} onChange={(e) => setFormData({ ...formData, credit_card_emi_monthly: Number(e.target.value) || 0 })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">E14. Other Loans EMI</Label>
              <Input type="number" value={formData.other_loans_emi} onChange={(e) => setFormData({ ...formData, other_loans_emi: Number(e.target.value) || 0 })} className="mt-1" placeholder="Gold loan, LAP, etc." />
            </div>
          </div>
        </div>

        {/* Net Worth Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-xl border border-blue-300 text-center">
            <span className="text-xs uppercase text-blue-600 font-semibold">Total Assets</span>
            <p className="text-lg font-bold font-mono text-blue-700">₹{totalAssets.toLocaleString()}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-xl border border-red-300 text-center">
            <span className="text-xs uppercase text-red-600 font-semibold">Total Liabilities</span>
            <p className="text-lg font-bold font-mono text-red-700">₹{totalLiabilities.toLocaleString()}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-xl border border-green-300 text-center">
            <span className="text-xs uppercase text-green-600 font-semibold">Net Worth</span>
            <p className="text-lg font-bold font-mono text-green-700" data-testid="net-worth-display">₹{(totalAssets - totalLiabilities).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

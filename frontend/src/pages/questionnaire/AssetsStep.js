import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';

export default function AssetsStep({ 
  formData, 
  setFormData, 
  addProperty, 
  removeProperty, 
  updateProperty, 
  addVehicle, 
  removeVehicle, 
  updateVehicle,
  calculateEMI,
  totalPropertyValue,
  total2WheelerValue,
  total4WheelerValue,
  totalVehicleValue,
  totalLoanPrincipal,
  totalAssets,
  totalLiabilities
}) {
  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">3. Assets & Liabilities</h2>
      
      <div className="space-y-8">
        {/* Properties Section - NEW */}
        <div className="bg-blue-50 p-6 rounded-xl border border-brand-blue/20">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-brand-blue">Real Estate Properties</h3>
              <p className="text-sm text-slate-500">Add all your properties with details</p>
            </div>
            <Button
              type="button"
              onClick={addProperty}
              className="bg-brand-blue hover:bg-brand-blue/90 rounded-full"
            >
              + Add Property
            </Button>
          </div>
          
          {formData.properties.length > 0 ? (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-brand-blue/10 rounded-lg text-sm font-medium text-brand-blue">
                <div className="col-span-4">Property Name</div>
                <div className="col-span-3">Estimated Value (₹)</div>
                <div className="col-span-2">Area (sqft)</div>
                <div className="col-span-2">₹/sqft</div>
                <div className="col-span-1"></div>
              </div>
              {formData.properties.map((prop, index) => (
                <div key={prop.id || `prop-${index}`} className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border">
                  <div className="col-span-4">
                    <Input
                      placeholder="e.g., Flat in Mumbai"
                      value={prop.name}
                      onChange={(e) => updateProperty(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="0"
                      value={prop.estimated_value}
                      onChange={(e) => updateProperty(index, 'estimated_value', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={prop.area_sqft}
                      onChange={(e) => updateProperty(index, 'area_sqft', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm font-mono text-slate-600">
                      ₹{prop.area_sqft > 0 ? Math.round((parseFloat(prop.estimated_value) || 0) / parseFloat(prop.area_sqft)).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProperty(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <span className="text-sm font-semibold text-brand-blue">
                  Total Property Value: ₹{Math.round(totalPropertyValue).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">No properties added yet. Click "Add Property" to start.</p>
          )}
        </div>

        {/* Vehicles Section - NEW */}
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-700">Vehicles</h3>
            <p className="text-sm text-slate-500">Add your 2-wheelers and 4-wheelers with details</p>
          </div>
          
          {/* 2-Wheeler Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-purple-600">2-Wheeler Vehicles</h4>
              <Button
                type="button"
                onClick={() => addVehicle('2-Wheeler')}
                className="bg-purple-600 hover:bg-purple-700 rounded-full text-white text-sm"
              >
                + Add 2-Wheeler
              </Button>
            </div>
            
            {formData.vehicles.filter(v => v.vehicle_type === '2-Wheeler').length > 0 ? (
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-purple-100 rounded-lg text-xs font-medium text-purple-700">
                  <div className="col-span-3">Vehicle Name</div>
                  <div className="col-span-3">Registration No.</div>
                  <div className="col-span-3">Estimated Value (₹)</div>
                  <div className="col-span-2">Insured?</div>
                  <div className="col-span-1"></div>
                </div>
                {formData.vehicles.map((vehicle, index) => (
                  vehicle.vehicle_type === '2-Wheeler' && (
                    <div key={vehicle.id || `2w-${index}`} className="grid grid-cols-12 gap-2 p-2 bg-white rounded-lg border">
                      <div className="col-span-3">
                        <Input
                          placeholder="e.g., Honda Activa"
                          value={vehicle.name}
                          onChange={(e) => updateVehicle(index, 'name', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="e.g., CG04ND1195"
                          value={vehicle.registration_number}
                          onChange={(e) => updateVehicle(index, 'registration_number', e.target.value.toUpperCase())}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="0"
                          value={vehicle.estimated_value}
                          onChange={(e) => updateVehicle(index, 'estimated_value', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2 flex items-center">
                        <Checkbox
                          checked={vehicle.is_insured}
                          onCheckedChange={(checked) => updateVehicle(index, 'is_insured', checked)}
                        />
                        <span className="ml-2 text-xs text-slate-600">{vehicle.is_insured ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVehicle(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )
                ))}
                <div className="flex justify-end pt-1">
                  <span className="text-sm font-semibold text-purple-700">
                    Total 2-Wheeler Value: ₹{Math.round(total2WheelerValue).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-400 py-3 text-sm">No 2-wheelers added yet.</p>
            )}
          </div>
          
          {/* 4-Wheeler Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-purple-600">4-Wheeler Vehicles</h4>
              <Button
                type="button"
                onClick={() => addVehicle('4-Wheeler')}
                className="bg-purple-600 hover:bg-purple-700 rounded-full text-white text-sm"
              >
                + Add 4-Wheeler
              </Button>
            </div>
            
            {formData.vehicles.filter(v => v.vehicle_type === '4-Wheeler').length > 0 ? (
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-purple-100 rounded-lg text-xs font-medium text-purple-700">
                  <div className="col-span-3">Vehicle Name</div>
                  <div className="col-span-3">Registration No.</div>
                  <div className="col-span-3">Estimated Value (₹)</div>
                  <div className="col-span-2">Insured?</div>
                  <div className="col-span-1"></div>
                </div>
                {formData.vehicles.map((vehicle, index) => (
                  vehicle.vehicle_type === '4-Wheeler' && (
                    <div key={vehicle.id || `4w-${index}`} className="grid grid-cols-12 gap-2 p-2 bg-white rounded-lg border">
                      <div className="col-span-3">
                        <Input
                          placeholder="e.g., Maruti Swift"
                          value={vehicle.name}
                          onChange={(e) => updateVehicle(index, 'name', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="e.g., CG04AB1234"
                          value={vehicle.registration_number}
                          onChange={(e) => updateVehicle(index, 'registration_number', e.target.value.toUpperCase())}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="0"
                          value={vehicle.estimated_value}
                          onChange={(e) => updateVehicle(index, 'estimated_value', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2 flex items-center">
                        <Checkbox
                          checked={vehicle.is_insured}
                          onCheckedChange={(checked) => updateVehicle(index, 'is_insured', checked)}
                        />
                        <span className="ml-2 text-xs text-slate-600">{vehicle.is_insured ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVehicle(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )
                ))}
                <div className="flex justify-end pt-1">
                  <span className="text-sm font-semibold text-purple-700">
                    Total 4-Wheeler Value: ₹{Math.round(total4WheelerValue).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-400 py-3 text-sm">No 4-wheelers added yet.</p>
            )}
          </div>
          
          {/* Total Vehicles Value */}
          <div className="mt-4 pt-3 border-t border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-purple-700">Total Vehicles Value:</span>
              <span className="text-lg font-bold font-mono text-purple-700">₹{Math.round(totalVehicleValue).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Other Assets */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Other Assets</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Gold Value (₹)</Label>
              <Input
                type="number"
                value={formData.gold_value}
                onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Silver Value (₹)</Label>
              <Input
                type="number"
                value={formData.silver_value}
                onChange={(e) => setFormData({ ...formData, silver_value: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Stocks (₹)</Label>
              <Input
                type="number"
                value={formData.stocks_value}
                onChange={(e) => setFormData({ ...formData, stocks_value: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Mutual Funds (₹)</Label>
              <Input
                type="number"
                value={formData.mutual_funds_value}
                onChange={(e) => setFormData({ ...formData, mutual_funds_value: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">PF / NPS (₹)</Label>
              <Input
                type="number"
                value={formData.pf_nps_value}
                onChange={(e) => setFormData({ ...formData, pf_nps_value: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Bank Balance (₹)</Label>
              <Input
                type="number"
                value={formData.bank_balance}
                onChange={(e) => setFormData({ ...formData, bank_balance: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Cash in Hand (₹)</Label>
              <Input
                type="number"
                value={formData.cash_in_hand}
                onChange={(e) => setFormData({ ...formData, cash_in_hand: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl">
            <p className="text-sm font-semibold text-slate-700">Total Assets:</p>
            <p className="text-2xl font-bold font-mono text-green-600">₹{Math.round(totalAssets).toLocaleString()}</p>
          </div>
        </div>

        {/* Loans Summary (Auto-populated from Step 1) */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-red-600">Loans Summary</h3>
            <p className="text-sm text-slate-500">Auto-populated from Income tab. Edit loans in Step 1.</p>
          </div>
          
          {formData.loans.length > 0 ? (
            <div className="space-y-2">
              {formData.loans.map((loan, index) => (
                <div key={loan.id || `loan-summary-${index}`} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <div>
                    <span className="font-medium">{loan.name || loan.loan_type + ' Loan'}</span>
                    <span className="text-sm text-slate-500 ml-2">({loan.loan_type})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-red-600">₹{Math.round(parseFloat(loan.principal_amount) || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">EMI: ₹{Math.round(calculateEMI(
                      parseFloat(loan.principal_amount) || 0,
                      parseFloat(loan.interest_rate) || 0,
                      parseInt(loan.tenure_months) || 0
                    )).toLocaleString()}/month</div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-2 border-t">
                <span className="font-semibold text-red-700">Total Loan Principal:</span>
                <span className="font-bold font-mono text-red-700">₹{Math.round(totalLoanPrincipal).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">No loans added. Add loans in Step 1 (Income tab).</p>
          )}
        </div>

        {/* Credit Card Outstanding */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Other Liabilities</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Credit Card Outstanding (₹)</Label>
              <Input
                type="number"
                value={formData.credit_card_outstanding}
                onChange={(e) => setFormData({ ...formData, credit_card_outstanding: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between items-center bg-red-50 p-4 rounded-xl">
            <p className="text-sm font-semibold text-slate-700">Total Liabilities:</p>
            <p className="text-2xl font-bold font-mono text-red-600">₹{Math.round(totalLiabilities).toLocaleString()}</p>
          </div>
        </div>

        {/* Net Worth Calculation */}
        <div className="bg-gradient-to-r from-brand-blue/10 to-brand-orange/10 rounded-xl p-6 border-2 border-brand-blue/30">
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold text-slate-800">Net Worth (Assets - Liabilities):</p>
            <p className="text-4xl font-bold font-mono text-brand-blue">₹{Math.round(totalAssets - totalLiabilities).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

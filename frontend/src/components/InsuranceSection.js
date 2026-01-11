import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Plus } from 'lucide-react';

export default function InsuranceSection({ insurancePolicies, onChange, onAutoPopulateVehicle }) {
  
  const addInsurance = () => {
    const newInsurance = {
      type: '',
      insurance_amount: '',
      // Health/Life fields
      cover_self: false,
      cover_spouse: false,
      cover_dependents: false,
      self_name: '',
      spouse_name: '',
      dependents: [], // Changed to array for multiple dependents
      // Vehicle fields
      vehicle_type: '', // 2-wheeler or 4-wheeler
      vehicle_number: ''
    };
    onChange([...insurancePolicies, newInsurance]);
  };

  const updateInsurance = (index, field, value) => {
    const updated = [...insurancePolicies];
    updated[index] = { ...updated[index], [field]: value };
    
    // If vehicle insurance and vehicle details are complete, auto-populate to assets
    if (updated[index].type === 'vehicle' && updated[index].vehicle_number && updated[index].vehicle_type) {
      onAutoPopulateVehicle({
        name: `${updated[index].vehicle_type} - ${updated[index].vehicle_number}`,
        vehicle_number: updated[index].vehicle_number,
        vehicle_type: updated[index].vehicle_type,
        estimated_value: '' // User will fill this in assets section
      });
    }
    
    onChange(updated);
  };

  const removeInsurance = (index) => {
    const updated = insurancePolicies.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Dependent management functions
  const addDependent = (insuranceIndex) => {
    const updated = [...insurancePolicies];
    if (!updated[insuranceIndex].dependents) {
      updated[insuranceIndex].dependents = [];
    }
    updated[insuranceIndex].dependents.push({ name: '', relationship: '' });
    onChange(updated);
  };

  const updateDependent = (insuranceIndex, dependentIndex, field, value) => {
    const updated = [...insurancePolicies];
    updated[insuranceIndex].dependents[dependentIndex][field] = value;
    onChange(updated);
  };

  const removeDependent = (insuranceIndex, dependentIndex) => {
    const updated = [...insurancePolicies];
    updated[insuranceIndex].dependents = updated[insuranceIndex].dependents.filter((_, i) => i !== dependentIndex);
    onChange(updated);
  };

  return (
    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-purple-600">Insurance Policies</h3>
          <p className="text-sm text-slate-500">Add all your insurance policies with details</p>
        </div>
        <Button
          type="button"
          onClick={addInsurance}
          className="bg-purple-600 hover:bg-purple-700 rounded-full text-white"
        >
          + Add Insurance
        </Button>
      </div>

      {insurancePolicies.length > 0 ? (
        <div className="space-y-4">
          {insurancePolicies.map((insurance, index) => (
            <div key={index} className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-purple-600">Insurance Policy {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInsurance(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type of Insurance */}
                <div>
                  <Label className="text-sm font-medium">Type of Insurance</Label>
                  <Select
                    value={insurance.type}
                    onValueChange={(value) => updateInsurance(index, 'type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health Insurance</SelectItem>
                      <SelectItem value="life">Life Insurance / Term Insurance</SelectItem>
                      <SelectItem value="vehicle">Vehicle Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Insurance Amount */}
                <div>
                  <Label className="text-sm font-medium">Insurance Premium (₹/year)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={insurance.insurance_amount}
                    onChange={(e) => updateInsurance(index, 'insurance_amount', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Health/Life Insurance - Coverage Details */}
                {(insurance.type === 'health' || insurance.type === 'life') && (
                  <>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium mb-2 block">Coverage Details</Label>
                      <div className="space-y-3 pl-2">
                        {/* Self */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={insurance.cover_self}
                            onChange={(e) => updateInsurance(index, 'cover_self', e.target.checked)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label className="text-sm">Self</Label>
                            {insurance.cover_self && (
                              <Input
                                placeholder="Your name"
                                value={insurance.self_name}
                                onChange={(e) => updateInsurance(index, 'self_name', e.target.value)}
                                className="mt-1"
                              />
                            )}
                          </div>
                        </div>

                        {/* Spouse */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={insurance.cover_spouse}
                            onChange={(e) => updateInsurance(index, 'cover_spouse', e.target.checked)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label className="text-sm">Spouse</Label>
                            {insurance.cover_spouse && (
                              <Input
                                placeholder="Spouse name"
                                value={insurance.spouse_name}
                                onChange={(e) => updateInsurance(index, 'spouse_name', e.target.value)}
                                className="mt-1"
                              />
                            )}
                          </div>
                        </div>

                        {/* Dependents - Multiple */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={insurance.cover_dependents}
                            onChange={(e) => {
                              updateInsurance(index, 'cover_dependents', e.target.checked);
                              if (e.target.checked && (!insurance.dependents || insurance.dependents.length === 0)) {
                                addDependent(index);
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm">Dependents</Label>
                              {insurance.cover_dependents && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addDependent(index)}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Dependent
                                </Button>
                              )}
                            </div>
                            {insurance.cover_dependents && insurance.dependents && insurance.dependents.length > 0 && (
                              <div className="space-y-2">
                                {insurance.dependents.map((dependent, depIndex) => (
                                  <div key={depIndex} className="flex gap-2 items-start">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                      <Input
                                        placeholder="Name"
                                        value={dependent.name}
                                        onChange={(e) => updateDependent(index, depIndex, 'name', e.target.value)}
                                      />
                                      <Input
                                        placeholder="Relationship (e.g., Son, Daughter, Parent)"
                                        value={dependent.relationship}
                                        onChange={(e) => updateDependent(index, depIndex, 'relationship', e.target.value)}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeDependent(index, depIndex)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Vehicle Insurance - Vehicle Details */}
                {insurance.type === 'vehicle' && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Vehicle Type</Label>
                      <Select
                        value={insurance.vehicle_type}
                        onValueChange={(value) => updateInsurance(index, 'vehicle_type', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2-wheeler">2-Wheeler</SelectItem>
                          <SelectItem value="4-wheeler">4-Wheeler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Vehicle Number</Label>
                      <Input
                        placeholder="e.g., MH02AB1234"
                        value={insurance.vehicle_number}
                        onChange={(e) => updateInsurance(index, 'vehicle_number', e.target.value.toUpperCase())}
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">Format: MH02AB1234</p>
                    </div>

                    <div className="col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        ℹ️ This vehicle will be auto-added to your Assets section. You'll just need to add the estimated value there.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <p>No insurance policies added yet.</p>
          <p className="text-sm mt-1">Click "+ Add Insurance" to add your policies</p>
        </div>
      )}
    </div>
  );
}

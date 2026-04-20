import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function CreditCardStep({ formData, setFormData }) {
  return (
    <Card className="p-6 bg-white border border-slate-200 rounded-2xl">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">5. Credit Card Preferences</h2>
      <p className="text-slate-600 font-body mb-6">Help us understand your preferences to recommend the best credit cards for you.</p>
      
      {/* Redemption Preferences */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-brand-blue mb-4">How would you like to redeem your reward points?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.redeem_free_flights ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-brand-blue'}`}
            onClick={() => setFormData({...formData, redeem_free_flights: !formData.redeem_free_flights})}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Free Flights</p>
                <p className="text-sm text-slate-500">Up to 15% reward value</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">HIGH REWARD</span>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.redeem_hotel_stays ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-brand-blue'}`}
            onClick={() => setFormData({...formData, redeem_hotel_stays: !formData.redeem_hotel_stays})}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Free Hotel Stays</p>
                <p className="text-sm text-slate-500">Up to 25% reward value</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">HIGH REWARD</span>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.redeem_direct_cashback ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 hover:border-brand-blue'}`}
            onClick={() => setFormData({...formData, redeem_direct_cashback: !formData.redeem_direct_cashback})}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Direct Cashback</p>
                <p className="text-sm text-slate-500">Up to 10% reward value</p>
              </div>
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">MEDIUM REWARD</span>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.redeem_vouchers ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-brand-blue'}`}
            onClick={() => setFormData({...formData, redeem_vouchers: !formData.redeem_vouchers})}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Products & Vouchers</p>
                <p className="text-sm text-slate-500">Up to 2% reward value</p>
              </div>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">LOW REWARD</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lifestyle Perks */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-brand-blue mb-4">What lifestyle perks matter to you?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium">Domestic Lounge Visits (times/year)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="range"
                min="0"
                max="50"
                value={formData.domestic_lounge_visits}
                onChange={(e) => setFormData({...formData, domestic_lounge_visits: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold text-brand-blue">{formData.domestic_lounge_visits}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">International Lounge Visits (times/year)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="range"
                min="0"
                max="20"
                value={formData.international_lounge_visits}
                onChange={(e) => setFormData({...formData, international_lounge_visits: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold text-brand-blue">{formData.international_lounge_visits}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Golf Sessions (times/year)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="range"
                min="0"
                max="24"
                value={formData.golf_sessions}
                onChange={(e) => setFormData({...formData, golf_sessions: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold text-brand-blue">{formData.golf_sessions}</span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Movies & Events (times/month)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="range"
                min="0"
                max="10"
                value={formData.movies_events_monthly}
                onChange={(e) => setFormData({...formData, movies_events_monthly: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold text-brand-blue">{formData.movies_events_monthly}</span>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Label className="text-sm font-medium">Your Ideal Number of Credit Cards</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="range"
                min="1"
                max="10"
                value={formData.ideal_card_count}
                onChange={(e) => setFormData({...formData, ideal_card_count: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold text-brand-blue">{formData.ideal_card_count}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Monthly Spend Categories */}
      <div>
        <h3 className="text-lg font-semibold text-brand-blue mb-4">Your Monthly Spend by Category</h3>
        <p className="text-sm text-slate-500 mb-4">Select your spending level for each category (Low / Medium / High)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'spend_bills_utilities', label: 'Bills & Utilities' },
            { key: 'spend_groceries', label: 'Groceries & Quick Commerce' },
            { key: 'spend_online_shopping', label: 'Online Shopping' },
            { key: 'spend_dining_food', label: 'Dining & Food Delivery' },
            { key: 'spend_upi_merchants', label: 'UPI Payments (Merchants)' },
            { key: 'spend_instore_shopping', label: 'In-Store Shopping' },
            { key: 'spend_flights_hotels', label: 'Flights & Hotels' },
            { key: 'spend_rent_payments', label: 'Rent Payments' },
            { key: 'spend_insurance', label: 'Insurance' },
            { key: 'spend_forex', label: 'Forex Spends' },
            { key: 'spend_fuel', label: 'Fuel' },
            { key: 'spend_jewellery_gold', label: 'Jewellery & Gold' },
            { key: 'spend_government_tax', label: 'Government/Tax Payments' },
            { key: 'spend_education', label: 'Education' }
          ].map(category => (
            <div key={category.key} className="p-3 border border-slate-200 rounded-xl">
              <p className="font-medium text-slate-700 mb-2">{category.label}</p>
              <div className="flex gap-2">
                {['low', 'mid', 'high'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, [category.key]: level})}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      formData[category.key] === level
                        ? level === 'low' 
                          ? 'bg-blue-500 text-white' 
                          : level === 'mid' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-green-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {level === 'low' ? 'Low' : level === 'mid' ? 'Medium' : 'High'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

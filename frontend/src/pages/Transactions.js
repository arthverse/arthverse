import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Sparkles } from 'lucide-react';

export default function Transactions({ token, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
  };

  const handleAICategorize = async () => {
    if (!formData.description || !formData.amount) {
      toast.error('Please enter description and amount first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await axios.post(
        `${API}/ai/categorize`,
        { description: formData.description, amount: parseFloat(formData.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ ...formData, category: response.data.category });
      toast.success(`AI suggests: ${response.data.category}`);
    } catch (error) {
      toast.error('AI categorization failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API}/transactions`,
        {
          ...formData,
          amount: parseFloat(formData.amount)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Transaction added successfully');
      setOpen(false);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Entertainment',
    'Travel',
    'Education',
    'Investment',
    'Salary',
    'Business',
    'Other'
  ];

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto p-6" data-testid="transactions-page">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2" data-testid="transactions-title">Transactions</h1>
            <p className="text-slate-600 font-body">Track all your income and expenses</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full px-6" data-testid="add-transaction-btn">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-testid="add-transaction-dialog">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Add Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4" data-testid="transaction-form">
                <div data-testid="description-input-container">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    data-testid="description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div data-testid="amount-input-container">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    data-testid="amount-input"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div data-testid="type-select-container">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="mt-1" data-testid="type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income" data-testid="type-income">Income</SelectItem>
                      <SelectItem value="expense" data-testid="type-expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div data-testid="category-container">
                  <div className="flex items-center justify-between mb-1">
                    <Label>Category</Label>
                    <Button
                      type="button"
                      onClick={handleAICategorize}
                      disabled={aiLoading}
                      className="text-xs bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 rounded-full px-3 py-1"
                      data-testid="ai-categorize-btn"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      {aiLoading ? 'AI thinking...' : 'AI Suggest'}
                    </Button>
                  </div>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="mt-1" data-testid="category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} data-testid={`category-${cat.toLowerCase().replace(/\s+/g, '-')}`}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div data-testid="date-input-container">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    data-testid="date-input"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full"
                  data-testid="submit-transaction-btn"
                >
                  {loading ? 'Adding...' : 'Add Transaction'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white border border-slate-200 rounded-2xl p-6" data-testid="transactions-list-card">
          {transactions.length === 0 ? (
            <div className="text-center py-12" data-testid="no-transactions-state">
              <p className="text-slate-500 mb-4">No transactions yet</p>
              <p className="text-sm text-slate-400">Click "Add Transaction" to get started</p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="transactions-list">
              {transactions.map((transaction, idx) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  data-testid={`transaction-item-${idx}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-semibold font-body text-slate-900" data-testid={`transaction-desc-${idx}`}>{transaction.description}</p>
                        <p className="text-sm text-slate-500 font-mono" data-testid={`transaction-category-${idx}`}>{transaction.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className={`text-lg font-bold font-mono ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`} data-testid={`transaction-amount-${idx}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500" data-testid={`transaction-date-${idx}`}>{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      data-testid={`delete-transaction-${idx}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}\
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Building2, TrendingUp, Shield, RefreshCw, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

export default function AggregatedFinancialData({ token }) {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAccount, setExpandedAccount] = useState(null);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/setu/financial-data`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFinancialData(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load financial data');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalBalance = () => {
    if (!financialData?.accounts) return 0;
    return financialData.accounts.reduce((sum, acc) => {
      return sum + parseFloat(acc.summary?.currentBalance || 0);
    }, 0);
  };

  const calculateMutualFundsValue = () => {
    if (!financialData?.mutualFunds) return 0;
    return financialData.mutualFunds.reduce((sum, mf) => {
      const holdings = mf.holdings || [];
      return sum + holdings.reduce((mfSum, holding) => {
        return mfSum + parseFloat(holding.currentValue || 0);
      }, 0);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-slate-600">Loading financial data...</div>
        </div>
      </Card>
    );
  }

  if (!financialData || financialData.accounts?.length === 0) {
    return null; // Don't show if no data
  }

  const totalBalance = calculateTotalBalance();
  const totalMutualFunds = calculateMutualFundsValue();

  return (
    <div className="space-y-6" data-testid="aggregated-financial-data">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-2 border-brand-blue/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-brand-blue" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Total Bank Balance</h3>
          </div>
          <p className="text-3xl font-bold text-brand-blue font-mono">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Across {financialData.accounts?.length || 0} accounts
          </p>
        </Card>

        <Card className="p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Mutual Funds</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 font-mono">
            {formatCurrency(totalMutualFunds)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {financialData.mutualFunds?.length || 0} holdings
          </p>
        </Card>

        <Card className="p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Insurance Policies</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 font-mono">
            {financialData.insurance?.length || 0}
          </p>
          <p className="text-xs text-slate-500 mt-2">Active policies</p>
        </Card>
      </div>

      {/* Bank Accounts Section */}
      {financialData.accounts?.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-heading text-brand-blue">
              Linked Bank Accounts
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFinancialData}
              className="text-brand-blue"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {financialData.accounts.map((account, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => setExpandedAccount(expandedAccount === idx ? null : idx)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {account.fipName || 'Bank Account'}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {account.maskedAccNumber} • {account.accType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-blue font-mono">
                        {formatCurrency(parseFloat(account.summary?.currentBalance || 0))}
                      </p>
                      <p className="text-xs text-slate-500">
                        {account.summary?.balanceDateTime && formatDate(account.summary.balanceDateTime)}
                      </p>
                    </div>
                    {expandedAccount === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedAccount === idx && account.transactions?.transaction?.length > 0 && (
                  <div className="p-4 border-t">
                    <h5 className="font-semibold text-slate-900 mb-3">Recent Transactions</h5>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {account.transactions.transaction.slice(0, 5).map((txn, txnIdx) => (
                          <TableRow key={txnIdx}>
                            <TableCell className="text-sm">
                              {formatDate(txn.transactionTimestamp)}
                            </TableCell>
                            <TableCell className="text-sm">{txn.narration}</TableCell>
                            <TableCell>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  txn.type === 'CREDIT'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {txn.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              <span
                                className={
                                  txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                }
                              >
                                {txn.type === 'CREDIT' ? '+' : '-'}
                                {formatCurrency(parseFloat(txn.amount))}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mutual Funds Section */}
      {financialData.mutualFunds?.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold font-heading text-green-600 mb-4">
            Mutual Fund Holdings
          </h3>
          <div className="space-y-4">
            {financialData.mutualFunds.map((mf, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{mf.fipName}</h4>
                    <p className="text-sm text-slate-600">Folio: {mf.folioNumber}</p>
                  </div>
                </div>
                {mf.holdings?.map((holding, hIdx) => (
                  <div
                    key={hIdx}
                    className="flex items-center justify-between py-2 border-t"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{holding.schemeName}</p>
                      <p className="text-sm text-slate-600">
                        {holding.units} units @ ₹{holding.nav}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600 font-mono">
                      {formatCurrency(parseFloat(holding.currentValue))}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insurance Section */}
      {financialData.insurance?.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold font-heading text-purple-600 mb-4">
            Insurance Policies
          </h3>
          <div className="space-y-4">
            {financialData.insurance.map((policy, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{policy.fipName}</h4>
                    <p className="text-sm text-slate-600">
                      Policy: {policy.policyNumber}
                    </p>
                    <p className="text-sm text-slate-600">
                      Type: {policy.policyDetails?.policyType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Sum Assured</p>
                    <p className="text-xl font-bold text-purple-600 font-mono">
                      {formatCurrency(parseFloat(policy.policyDetails?.sumAssured || 0))}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Premium: {formatCurrency(parseFloat(policy.policyDetails?.premium || 0))}/{policy.policyDetails?.premiumFrequency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {financialData.fetched_at && (
        <p className="text-xs text-slate-500 text-center">
          Last updated: {formatDate(financialData.fetched_at)}
        </p>
      )}
    </div>
  );
}

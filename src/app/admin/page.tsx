'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownRight, ArrowUpRight, Clock, CheckCircle, XCircle, AlertCircle, Users, DollarSign, Loader2, Eye, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Deposit {
  id: number;
  telegram_id: number;
  user_display: string;
  amount: number;
  merchant_amount?: number;
  currency: string;
  status: string;
  network_code: string;
  address?: string;
  provider_tx_id?: string;
  created_at: string;
  confirmed_at?: string;
}

interface Withdrawal {
  id: number;
  telegram_id: number;
  user_display: string;
  amount: number;
  address: string;
  fee: number;
  currency: string;
  status: string;
  network_code: string;
  provider_tx_id?: string;
  created_at: string;
  processed_at?: string;
}

export default function AdminPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [depositsLoading, setDepositsLoading] = useState(true);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<number | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const { toast } = useToast();

  // Загрузка депозитов
  const loadDeposits = useCallback(async () => {
    try {
      setDepositsLoading(true);
      const response = await fetch('/api/admin/deposits?limit=50');
      const result = await response.json();

      if (result.success) {
        setDeposits(result.data.deposits);
      } else {
        toast({
          title: "Error",
          description: "Failed to load deposits",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Deposits loading error:', error);
      toast({
        title: "Error",
        description: "Failed to load deposits",
        variant: "destructive",
      });
    } finally {
      setDepositsLoading(false);
    }
  }, [toast]);

  // Загрузка выводов
  const loadWithdrawals = useCallback(async () => {
    try {
      setWithdrawalsLoading(true);
      const response = await fetch('/api/admin/withdrawals?limit=50');
      const result = await response.json();

      if (result.success) {
        setWithdrawals(result.data.withdrawals);
      } else {
        toast({
          title: "Error",
          description: "Failed to load withdrawals",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Withdrawals loading error:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawals",
        variant: "destructive",
      });
    } finally {
      setWithdrawalsLoading(false);
    }
  }, [toast]);

  // Обработка вывода
  const processWithdrawal = async (withdrawalId: number, action: 'approve' | 'reject') => {
    try {
      setProcessingWithdrawal(withdrawalId);

      const response = await fetch('/api/admin/withdrawals/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawal_id: withdrawalId,
          action: action,
          admin_id: 1, // В реальном приложении получаем из сессии
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: `Withdrawal ${action}ed successfully`,
        });

        // Обновляем список выводов
        loadWithdrawals();
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${action} withdrawal`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Withdrawal processing error:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} withdrawal`,
        variant: "destructive",
      });
    } finally {
      setProcessingWithdrawal(null);
    }
  };

  useEffect(() => {
    loadDeposits();
    loadWithdrawals();
  }, [loadDeposits, loadWithdrawals]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock size={16} className="text-yellow-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'failed':
      case 'rejected':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">TMA Admin Panel</h1>
        {pendingWithdrawals.length > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {pendingWithdrawals.length} Pending Withdrawals
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deposits.filter(d => d.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {withdrawals.filter(w => w.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingWithdrawals.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(deposits.reduce((sum, d) => sum + (d.merchant_amount || d.amount), 0)).toFixed(0)} USDT
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdrawals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="withdrawals">
            Withdrawals {pendingWithdrawals.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingWithdrawals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading withdrawals...</span>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No withdrawals found
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{withdrawal.user_display}</p>
                          <p className="text-sm text-gray-500">ID: {withdrawal.telegram_id}</p>
                          <p className="text-sm text-gray-500">{withdrawal.network_code}</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="font-bold text-lg">{withdrawal.amount.toFixed(2)} USDT</p>
                        <p className="text-sm text-gray-500">Fee: {withdrawal.fee.toFixed(2)} USDT</p>
                      </div>

                      <div className="text-center">
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {getStatusIcon(withdrawal.status)}
                          <span className="ml-1 capitalize">{withdrawal.status}</span>
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedWithdrawal(withdrawal)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Withdrawal Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">User:</label>
                                <p>{withdrawal.user_display} (ID: {withdrawal.telegram_id})</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Amount:</label>
                                <p>{withdrawal.amount.toFixed(2)} USDT</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Address:</label>
                                <p className="break-all">{withdrawal.address}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Network:</label>
                                <p>{withdrawal.network_code}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Fee:</label>
                                <p>{withdrawal.fee.toFixed(2)} USDT</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status:</label>
                                <Badge className={getStatusColor(withdrawal.status)}>
                                  {withdrawal.status}
                                </Badge>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {withdrawal.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => processWithdrawal(withdrawal.id, 'approve')}
                              disabled={processingWithdrawal === withdrawal.id}
                            >
                              {processingWithdrawal === withdrawal.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => processWithdrawal(withdrawal.id, 'reject')}
                              disabled={processingWithdrawal === withdrawal.id}
                            >
                              {processingWithdrawal === withdrawal.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              {depositsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading deposits...</span>
                </div>
              ) : deposits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No deposits found
                </div>
              ) : (
                <div className="space-y-4">
                  {deposits.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <ArrowDownRight className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{deposit.user_display}</p>
                          <p className="text-sm text-gray-500">ID: {deposit.telegram_id}</p>
                          <p className="text-sm text-gray-500">{deposit.network_code}</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="font-bold text-lg">{deposit.amount.toFixed(2)} USDT</p>
                        {deposit.merchant_amount && (
                          <p className="text-sm text-gray-500">Received: {deposit.merchant_amount.toFixed(2)} USDT</p>
                        )}
                      </div>

                      <div className="text-center">
                        <Badge className={getStatusColor(deposit.status)}>
                          {getStatusIcon(deposit.status)}
                          <span className="ml-1 capitalize">{deposit.status}</span>
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(deposit.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDeposit(deposit)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Deposit Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">User:</label>
                                <p>{deposit.user_display} (ID: {deposit.telegram_id})</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Amount:</label>
                                <p>{deposit.amount.toFixed(2)} USDT</p>
                              </div>
                              {deposit.merchant_amount && (
                                <div>
                                  <label className="text-sm font-medium">Received Amount:</label>
                                  <p>{deposit.merchant_amount.toFixed(2)} USDT</p>
                                </div>
                              )}
                              {deposit.address && (
                                <div>
                                  <label className="text-sm font-medium">Address:</label>
                                  <p className="break-all">{deposit.address}</p>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-medium">Network:</label>
                                <p>{deposit.network_code}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status:</label>
                                <Badge className={getStatusColor(deposit.status)}>
                                  {deposit.status}
                                </Badge>
                              </div>
                              {deposit.provider_tx_id && (
                                <div>
                                  <label className="text-sm font-medium">Transaction Hash:</label>
                                  <p className="break-all text-sm">{deposit.provider_tx_id}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

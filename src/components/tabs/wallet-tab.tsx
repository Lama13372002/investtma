'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowDownRight, ArrowUpRight, Copy, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, Wallet, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTelegram } from '@/components/providers/telegram-provider';

interface UserBalance {
  available: number;
  bonus: number;
  locked: number;
  total_invested: number;
  total_balance: number;
}

interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  network: string;
  tx_hash?: string;
  date: string;
  fee: number;
}

export function WalletTab() {
  const { user } = useTelegram();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('TRON');
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [balance, setBalance] = useState<UserBalance>({
    available: 0,
    bonus: 0,
    locked: 0,
    total_invested: 0,
    total_balance: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const { toast } = useToast();

  const networks = [
    { value: 'TRON', label: 'TRON (TRC20)', fee: '1.70 USDT' },
    { value: 'BSC', label: 'BSC (BEP20)', fee: '0.30 USDT' },
    { value: 'ETH', label: 'Ethereum (ERC20)', fee: '10.00 USDT' },
    { value: 'POLYGON', label: 'Polygon (POS)', fee: '0.01 USDT' }
  ];

  // Загрузка баланса пользователя
  const loadBalance = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsBalanceLoading(true);
      const response = await fetch(`/api/user/balance?user_id=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setBalance(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load balance",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Balance loading error:', error);
      toast({
        title: "Error",
        description: "Failed to load balance",
        variant: "destructive",
      });
    } finally {
      setIsBalanceLoading(false);
    }
  }, [user, toast]);

  // Загрузка истории транзакций
  const loadTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsTransactionsLoading(true);
      const response = await fetch(`/api/user/transactions?user_id=${user.id}&limit=10`);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data.transactions);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load transactions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Transactions loading error:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setIsTransactionsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user?.id) {
      loadBalance();
      loadTransactions();
    }
  }, [user?.id, loadBalance, loadTransactions]);

  const handleDeposit = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is 10 USDT",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDepositLoading(true);

      const response = await fetch('/api/deposits/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: depositAmount,
          network: selectedNetwork,
          user_id: user.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Deposit Created",
          description: "Payment address generated successfully",
        });

        // Показываем адрес для оплаты
        if (result.data.address) {
          toast({
            title: "Payment Address",
            description: `Send ${depositAmount} USDT to: ${result.data.address}`,
            duration: 10000,
          });
        }

        // Открываем URL платежа если есть
        if (result.data.payment_url) {
          window.open(result.data.payment_url, '_blank');
        }

        setIsDepositDialogOpen(false);
        setDepositAmount('');

        // Обновляем транзакции
        loadTransactions();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create deposit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Error",
        description: "Failed to create deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawAmount || !withdrawAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is 10 USDT",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance.available) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough available balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsWithdrawLoading(true);

      const response = await fetch('/api/withdrawals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          address: withdrawAddress,
          network: selectedNetwork,
          user_id: user.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Withdrawal Request Submitted",
          description: "Your withdrawal will be processed by admin within 24 hours",
        });

        setIsWithdrawDialogOpen(false);
        setWithdrawAmount('');
        setWithdrawAddress('');

        // Обновляем баланс и транзакции
        loadBalance();
        loadTransactions();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create withdrawal",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Error",
        description: "Failed to create withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Transaction hash copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-primary" />;
      case 'pending':
        return <Clock size={16} className="text-warning" />;
      case 'failed':
        return <XCircle size={16} className="text-destructive" />;
      default:
        return <AlertCircle size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-primary border-primary/20';
      case 'pending':
        return 'text-warning border-warning/20';
      case 'failed':
        return 'text-destructive border-destructive/20';
      default:
        return 'text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className="balance-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-30 -z-10"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Wallet size={14} className="text-primary" />
            </div>
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center pt-2">
              {isBalanceLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <p className="text-4xl font-bold text-primary quantum-glow tracking-wide">
                    {balance.available.toFixed(2)} USDT
                  </p>
                  <p className="text-sm text-white/60 mt-1">Available Balance</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg glass-card border border-white/5 hover:border-warning/30 hover:bg-warning/5 transition-all duration-300 group">
                <p className="text-lg font-bold text-warning quantum-glow">
                  {isBalanceLoading ? '--' : balance.total_invested.toFixed(2)} USDT
                </p>
                <p className="text-xs text-white/60 mt-1 group-hover:text-warning/80 transition-colors duration-300">Locked in Investments</p>
              </div>
              <div className="text-center p-4 rounded-lg glass-card border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                <p className="text-lg font-bold text-primary quantum-glow">
                  {isBalanceLoading ? '--' : balance.bonus.toFixed(2)} USDT
                </p>
                <p className="text-xs text-white/60 mt-1 group-hover:text-primary/80 transition-colors duration-300">Referral Bonus</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
          <DialogTrigger asChild>
            <Button className="deposit-button h-16 flex-col space-y-1 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
              <ArrowDownRight size={24} />
              <span>Deposit</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-card/98 via-card/95 to-card/98 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 max-w-md mx-auto">
            <DialogHeader className="pb-4 border-b border-primary/10">
              <DialogTitle className="text-2xl font-bold text-white flex items-center bg-gradient-to-r from-white via-primary/90 to-white bg-clip-text text-transparent">
                <div className="mr-4 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full p-3 border border-primary/20 shadow-lg shadow-primary/20">
                  <ArrowDownRight size={24} className="text-primary" />
                </div>
                Deposit USDT
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 relative pt-2">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl -z-10 opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl -z-10 opacity-20"></div>

              <div className="space-y-3">
                <Label htmlFor="deposit-amount" className="text-white/95 font-semibold text-sm tracking-wide">Amount (USDT)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Minimum: 10 USDT"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-primary/60 focus:bg-white/15 transition-all duration-300 h-14 rounded-xl text-white placeholder:text-white/50 shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="deposit-network" className="text-white/95 font-semibold text-sm tracking-wide">Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-primary/60 transition-all duration-300 h-14 rounded-xl text-white shadow-inner">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-gradient-to-b from-card via-card/95 to-card/90 border border-white/20 rounded-xl backdrop-blur-xl shadow-2xl">
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value} className="focus:bg-primary/15 focus:text-primary hover:bg-primary/10 hover:text-primary rounded-lg mx-1 my-0.5 transition-all duration-200">
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-sm">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white/80 font-medium">Network:</span>
                  <span className="text-primary font-bold">{networks.find(n => n.value === selectedNetwork)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80 font-medium">Fee:</span>
                  <span className="text-primary font-bold">{networks.find(n => n.value === selectedNetwork)?.fee}</span>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDepositDialogOpen(false)}
                  className="flex-1 h-14 border-white/20 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeposit}
                  disabled={isDepositLoading}
                  className="flex-1 deposit-button h-14 rounded-xl font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
                >
                  {isDepositLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Generate Address'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
          <DialogTrigger asChild>
            <Button className="withdraw-button h-16 flex-col space-y-1 rounded-xl shadow-lg shadow-destructive/20 hover:shadow-xl hover:shadow-destructive/30 transition-all duration-300">
              <ArrowUpRight size={24} />
              <span>Withdraw</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-card/98 via-card/95 to-card/98 backdrop-blur-xl border border-destructive/20 shadow-2xl shadow-destructive/10 max-w-md mx-auto">
            <DialogHeader className="pb-4 border-b border-destructive/10">
              <DialogTitle className="text-2xl font-bold text-white flex items-center bg-gradient-to-r from-white via-destructive/90 to-white bg-clip-text text-transparent">
                <div className="mr-4 bg-gradient-to-br from-destructive/30 to-destructive/10 rounded-full p-3 border border-destructive/20 shadow-lg shadow-destructive/20">
                  <ArrowUpRight size={24} className="text-destructive" />
                </div>
                Withdraw USDT
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 relative pt-2">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-full blur-3xl -z-10 opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-destructive/10 to-transparent rounded-full blur-2xl -z-10 opacity-20"></div>

              <div className="space-y-3">
                <Label htmlFor="withdraw-amount" className="text-white/95 font-semibold text-sm tracking-wide">Amount (USDT)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Minimum: 10 USDT"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-destructive/60 focus:bg-white/15 transition-all duration-300 h-14 rounded-xl text-white placeholder:text-white/50 shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="withdraw-address" className="text-white/95 font-semibold text-sm tracking-wide">Wallet Address</Label>
                <Input
                  id="withdraw-address"
                  placeholder="Enter your wallet address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-destructive/60 focus:bg-white/15 transition-all duration-300 h-14 rounded-xl text-white placeholder:text-white/50 shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="withdraw-network" className="text-white/95 font-semibold text-sm tracking-wide">Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-destructive/60 transition-all duration-300 h-14 rounded-xl text-white shadow-inner">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-gradient-to-b from-card via-card/95 to-card/90 border border-white/20 rounded-xl backdrop-blur-xl shadow-2xl">
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value} className="focus:bg-destructive/15 focus:text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg mx-1 my-0.5 transition-all duration-200">
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent rounded-2xl p-5 border border-destructive/20 shadow-lg shadow-destructive/5 backdrop-blur-sm">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white/80 font-medium">Amount:</span>
                  <span className="text-white font-bold">{withdrawAmount || '0'} USDT</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white/80 font-medium">Fee:</span>
                  <span className="text-white/90 font-bold">{networks.find(n => n.value === selectedNetwork)?.fee}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-destructive/20 pt-3">
                  <span className="text-white/90 font-semibold">You will receive:</span>
                  <span className="text-destructive font-bold text-lg">{withdrawAmount ? (parseFloat(withdrawAmount) - parseFloat(networks.find(n => n.value === selectedNetwork)?.fee?.split(' ')[0] || '0')).toFixed(2) : '0'} USDT</span>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsWithdrawDialogOpen(false)}
                  className="flex-1 h-14 border-white/20 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={isWithdrawLoading}
                  className="flex-1 withdraw-button h-14 rounded-xl font-semibold shadow-xl shadow-destructive/30 hover:shadow-2xl hover:shadow-destructive/40 transition-all duration-300"
                >
                  {isWithdrawLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Withdrawal'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transaction History */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Clock size={14} className="text-primary" />
            </div>
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-2">
            {isTransactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-white/60">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg glass-card border border-white/5 hover:border-primary/20 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      tx.type === 'deposit'
                        ? 'bg-gradient-to-br from-primary/30 to-primary/10 shadow-primary/10'
                        : 'bg-gradient-to-br from-destructive/30 to-destructive/10 shadow-destructive/10'
                    } group-hover:scale-110 transition-all duration-300`}>
                      {tx.type === 'deposit' ?
                        <ArrowDownRight size={22} className="text-primary" /> :
                        <ArrowUpRight size={22} className="text-destructive" />
                      }
                    </div>
                    <div>
                      <p className="font-bold capitalize text-white/90">{tx.type}</p>
                      <p className="text-sm text-white/60 group-hover:text-primary/70 transition-colors duration-300">
                        {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-white/50">{tx.network}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-lg ${tx.type === 'deposit' ? 'text-primary' : 'text-white/90'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} USDT
                    </p>
                    <div className="flex items-center space-x-2 justify-end mt-1">
                      <Badge variant="outline" className={`${getStatusColor(tx.status)} px-2 py-0.5 group-hover:bg-white/5 transition-all duration-300`}>
                        {getStatusIcon(tx.status)}
                        <span className="ml-1 capitalize">{tx.status}</span>
                      </Badge>
                    </div>
                    {tx.tx_hash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(tx.tx_hash!)}
                        className="text-xs h-6 p-1 mt-1.5 text-primary/80 hover:text-primary hover:bg-primary/5"
                      >
                        <Copy size={12} className="mr-1" />
                        Hash
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

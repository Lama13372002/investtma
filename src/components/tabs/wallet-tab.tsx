'use client';

import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Copy, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export function WalletTab() {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('TRON');
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const { toast } = useToast();

  const networks = [
    { value: 'TRON', label: 'TRON (TRC20)', fee: '1.70 USDT' },
    { value: 'BSC', label: 'BSC (BEP20)', fee: '0.30 USDT' },
    { value: 'ETH', label: 'Ethereum (ERC20)', fee: '10.00 USDT' },
    { value: 'POLYGON', label: 'Polygon (POS)', fee: '0.01 USDT' }
  ];

  // Mock transaction history
  const transactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 500,
      status: 'completed',
      network: 'TRON',
      txHash: '0x123...abc',
      date: '2024-01-15 14:30',
      fee: 0
    },
    {
      id: 2,
      type: 'withdrawal',
      amount: 200,
      status: 'pending',
      network: 'BSC',
      txHash: null,
      date: '2024-01-14 10:15',
      fee: 0.30
    },
    {
      id: 3,
      type: 'deposit',
      amount: 1000,
      status: 'completed',
      network: 'TRON',
      txHash: '0x456...def',
      date: '2024-01-13 16:45',
      fee: 0
    }
  ];

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is 10 USDT",
        variant: "destructive",
      });
      return;
    }

    // В реальном приложении здесь будет создание платежа через Cryptomus API
    toast({
      title: "Deposit Initiated",
      description: "You will receive payment instructions shortly",
    });
    setIsDepositDialogOpen(false);
    setDepositAmount('');
  };

  const handleWithdraw = () => {
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

    // В реальном приложении здесь будет создание выплаты через Cryptomus API
    toast({
      title: "Withdrawal Request Submitted",
      description: "Your withdrawal will be processed within 24 hours",
    });
    setIsWithdrawDialogOpen(false);
    setWithdrawAmount('');
    setWithdrawAddress('');
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
              <p className="text-4xl font-bold text-primary quantum-glow tracking-wide">1,250.50 USDT</p>
              <p className="text-sm text-white/60 mt-1">Available Balance</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg glass-card border border-white/5 hover:border-warning/30 hover:bg-warning/5 transition-all duration-300 group">
                <p className="text-lg font-bold text-warning quantum-glow">500.00 USDT</p>
                <p className="text-xs text-white/60 mt-1 group-hover:text-warning/80 transition-colors duration-300">Locked in Investments</p>
              </div>
              <div className="text-center p-4 rounded-lg glass-card border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                <p className="text-lg font-bold text-primary quantum-glow">75.25 USDT</p>
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
          <DialogContent className="bg-gradient-to-b from-card/95 to-card border border-white/10 shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold text-white flex items-center">
                <div className="mr-3 bg-primary/10 rounded-full p-2">
                  <ArrowDownRight size={20} className="text-primary" />
                </div>
                Deposit USDT
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10 opacity-20"></div>

              <div className="space-y-2">
                <Label htmlFor="deposit-amount" className="text-white/90 font-medium">Amount (USDT)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Minimum: 10 USDT"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="border-white/10 bg-white/5 focus:border-primary/50 transition-all duration-300 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit-network" className="text-white/90 font-medium">Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger className="border-white/10 bg-white/5 focus:border-primary/50 transition-all duration-300 h-12">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-white/10">
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value} className="focus:bg-primary/10">
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Network:</span>
                  <span className="text-primary font-medium">{networks.find(n => n.value === selectedNetwork)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Fee:</span>
                  <span className="text-primary font-medium">{networks.find(n => n.value === selectedNetwork)?.fee}</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDepositDialogOpen(false)}
                  className="flex-1 h-12 border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeposit}
                  className="flex-1 deposit-button h-12 rounded-xl"
                >
                  Generate Address
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
          <DialogContent className="bg-gradient-to-b from-card/95 to-card border border-white/10 shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold text-white flex items-center">
                <div className="mr-3 bg-destructive/10 rounded-full p-2">
                  <ArrowUpRight size={20} className="text-destructive" />
                </div>
                Withdraw USDT
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-destructive/10 rounded-full blur-3xl -z-10 opacity-20"></div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-amount" className="text-white/90 font-medium">Amount (USDT)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Minimum: 10 USDT"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="border-white/10 bg-white/5 focus:border-destructive/50 transition-all duration-300 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-address" className="text-white/90 font-medium">Wallet Address</Label>
                <Input
                  id="withdraw-address"
                  placeholder="Enter your wallet address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="border-white/10 bg-white/5 focus:border-destructive/50 transition-all duration-300 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-network" className="text-white/90 font-medium">Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger className="border-white/10 bg-white/5 focus:border-destructive/50 transition-all duration-300 h-12">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-white/10">
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value} className="focus:bg-destructive/10">
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-r from-destructive/5 to-transparent rounded-xl p-4 border border-destructive/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Amount:</span>
                  <span className="text-white font-medium">{withdrawAmount || '0'} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Fee:</span>
                  <span className="text-white/90">{networks.find(n => n.value === selectedNetwork)?.fee}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-destructive/10 pt-3 mt-3">
                  <span className="text-white/80">You will receive:</span>
                  <span className="text-destructive/90 font-bold">{withdrawAmount ? (parseFloat(withdrawAmount) - parseFloat(networks.find(n => n.value === selectedNetwork)?.fee?.split(' ')[0] || '0')).toFixed(2) : '0'} USDT</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsWithdrawDialogOpen(false)}
                  className="flex-1 h-12 border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdraw}
                  className="flex-1 withdraw-button h-12 rounded-xl"
                >
                  Submit Withdrawal
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
            {transactions.map((tx) => (
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
                    <p className="text-sm text-white/60 group-hover:text-primary/70 transition-colors duration-300">{tx.date}</p>
                    <p className="text-xs text-white/50">{tx.network}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold text-lg ${tx.type === 'deposit' ? 'text-primary' : 'text-white/90'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount} USDT
                  </p>
                  <div className="flex items-center space-x-2 justify-end mt-1">
                    <Badge variant="outline" className={`${getStatusColor(tx.status)} px-2 py-0.5 group-hover:bg-white/5 transition-all duration-300`}>
                      {getStatusIcon(tx.status)}
                      <span className="ml-1 capitalize">{tx.status}</span>
                    </Badge>
                  </div>
                  {tx.txHash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tx.txHash!)}
                      className="text-xs h-6 p-1 mt-1.5 text-primary/80 hover:text-primary hover:bg-primary/5"
                    >
                      <Copy size={12} className="mr-1" />
                      Hash
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

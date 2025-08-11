'use client';

import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Copy, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
      <Card className="balance-card">
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">1,250.50 USDT</p>
              <p className="text-sm text-muted-foreground">Available Balance</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-warning">500.00 USDT</p>
                <p className="text-xs text-muted-foreground">Locked in Investments</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-primary">75.25 USDT</p>
                <p className="text-xs text-muted-foreground">Referral Bonus</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
          <DialogTrigger asChild>
            <Button className="deposit-button h-16 flex-col space-y-1">
              <ArrowDownRight size={24} />
              <span>Deposit</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit USDT</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount (USDT)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Minimum: 10 USDT"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit-network">Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value}>
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/20 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  Network: {networks.find(n => n.value === selectedNetwork)?.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fee: {networks.find(n => n.value === selectedNetwork)?.fee}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleDeposit} className="flex-1 deposit-button">
                  Generate Address
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
          <DialogTrigger asChild>
            <Button className="withdraw-button h-16 flex-col space-y-1">
              <ArrowUpRight size={24} />
              <span>Withdraw</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw USDT</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (USDT)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Minimum: 10 USDT"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-address">Wallet Address</Label>
                <Input
                  id="withdraw-address"
                  placeholder="Enter your wallet address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-network">Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value}>
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/20 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>{withdrawAmount || '0'} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fee:</span>
                  <span>{networks.find(n => n.value === selectedNetwork)?.fee}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
                  <span>You will receive:</span>
                  <span>{withdrawAmount ? (parseFloat(withdrawAmount) - parseFloat(networks.find(n => n.value === selectedNetwork)?.fee?.split(' ')[0] || '0')).toFixed(2) : '0'} USDT</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleWithdraw} className="flex-1 withdraw-button">
                  Submit Withdrawal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-primary/10' : 'bg-destructive/10'
                  }`}>
                    {tx.type === 'deposit' ?
                      <ArrowDownRight size={20} className="text-primary" /> :
                      <ArrowUpRight size={20} className="text-destructive" />
                    }
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                    <p className="text-xs text-muted-foreground">{tx.network}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-medium ${tx.type === 'deposit' ? 'text-primary' : 'text-foreground'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount} USDT
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(tx.status)}>
                      {getStatusIcon(tx.status)}
                      <span className="ml-1 capitalize">{tx.status}</span>
                    </Badge>
                  </div>
                  {tx.txHash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tx.txHash!)}
                      className="text-xs h-6 p-1 mt-1"
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

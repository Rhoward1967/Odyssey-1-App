import { useEffect, useState } from 'react';

export interface WalletState {
  connected: boolean;
  address: string;
  balance: string;
  chainId: string;
  network: string;
}

export function useMetaMaskWallet(): WalletState {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: '',
    balance: '',
    chainId: '',
    network: ''
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      setWallet((prev) => ({ ...prev, address: accounts[0] || '', connected: accounts.length > 0 }));
    };
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        setWallet((prev) => ({ ...prev, address: accounts[0], connected: true }));
      }
    });
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  return wallet;
}

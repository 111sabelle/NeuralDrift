import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';

export const WalletButton = () => {
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      console.log('Wallet connected:', publicKey.toString());
    }
  }, [connected, publicKey]);

  return <WalletMultiButton />;
}; 
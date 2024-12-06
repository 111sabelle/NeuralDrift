import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { providers } from 'ethers';

interface WalletContextType {
    provider: providers.Web3Provider | null;
    signer: providers.JsonRpcSigner | null;
    address: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
    provider: null,
    signer: null,
    address: null,
    connect: async () => {},
    disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [provider, setProvider] = useState<providers.Web3Provider | null>(null);
    const [signer, setSigner] = useState<providers.JsonRpcSigner | null>(null);
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        let isSubscribed = true;

        const handleAccountsChanged = async (accounts: string[]) => {
            if (!isSubscribed) return;
            if (accounts.length > 0) {
                setAddress(accounts[0]);
            } else {
                disconnect();
            }
        };

        const handleChainChanged = () => {
            if (!isSubscribed) return;
            window.location.reload();
        };

        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                isSubscribed = false;
                if (window.ethereum) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                }
            };
        }
    }, [mounted]);

    const connect = async () => {
        if (!mounted) return;
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                
                setProvider(provider);
                setSigner(signer);
                setAddress(address);
            } catch (error) {
                console.error('Failed to connect wallet:', error);
                throw error;
            }
        } else {
            throw new Error('Please install MetaMask!');
        }
    };

    const disconnect = () => {
        setProvider(null);
        setSigner(null);
        setAddress(null);
    };

    if (!mounted) return <>{children}</>;

    return (
        <WalletContext.Provider value={{ provider, signer, address, connect, disconnect }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWalletContext = () => useContext(WalletContext);

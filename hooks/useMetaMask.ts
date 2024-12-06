import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useMetaMask() {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(provider);

            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                setAccount(accounts[0] || null);
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    const connectMetaMask = async () => {
        try {
            if (!provider) throw new Error('No provider found');
            const accounts = await provider.send('eth_requestAccounts', []);
            setAccount(accounts[0]);
            return accounts[0];
        } catch (error) {
            console.error('Failed to connect to MetaMask:', error);
            throw error;
        }
    };

    return { account, provider, connectMetaMask };
} 
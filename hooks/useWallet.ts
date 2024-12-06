import { useState, useEffect } from 'react';
import { providers } from 'ethers';
import { switchToSepolia } from '../utils/network';

export function useWallet() {
    const [provider, setProvider] = useState<providers.Web3Provider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    useEffect(() => {
        if (!mounted) return;
        const init = async () => {
            try {
                if (typeof window.ethereum !== 'undefined') {
                    const provider = new providers.Web3Provider(window.ethereum);
                    setProvider(provider);

                    // 检查网络并切换到 Sepolia
                    await switchToSepolia();

                    // 获取账户
                    const accounts = await provider.send("eth_requestAccounts", []);
                    setAccount(accounts[0]);

                    // 监听账户变化
                    const handleAccountsChanged = (accounts: string[]) => {
                        setAccount(accounts[0]);
                    };

                    // 监听网络变化
                    const handleChainChanged = () => {
                        window.location.reload();
                    };

                    window.ethereum.on('accountsChanged', handleAccountsChanged);
                    window.ethereum.on('chainChanged', handleChainChanged);

                    return () => {
                        if (window.ethereum) {
                            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                            window.ethereum.removeListener('chainChanged', handleChainChanged);
                        }
                    };
                }
            } catch (err) {
                console.error('Failed to initialize wallet:', err);
                setError('Failed to connect wallet');
            }
        };

        init();
    }, []);

    return { provider, account, error };
}
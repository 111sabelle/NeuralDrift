import { useEffect, useState } from 'react';
import { getTokenBalances, TokenBalance } from '../utils/solana';

interface SolanaBalanceState {
    balances: TokenBalance[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

export function useSolanaBalance(address: string): SolanaBalanceState {
    const [balances, setBalances] = useState<TokenBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBalances = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTokenBalances(address);
            setBalances(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch balances'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (address) {
            fetchBalances();
        }
    }, [address]);

    return {
        balances,
        loading,
        error,
        refresh: fetchBalances
    };
} 
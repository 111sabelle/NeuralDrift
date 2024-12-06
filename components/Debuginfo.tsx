import { useAccount, useNetwork } from 'wagmi';
import { useContract } from '../hooks/useContract';

export function DebugInfo() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const { contract } = useContract();

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
            <p>Connected: {isConnected ? '✅' : '❌'}</p>
            <p>Network: {chain?.name || 'Not connected'}</p>
            <p>Contract: {contract ? '✅' : '❌'}</p>
            <p>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</p>
        </div>
    );
}
import { useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function WalletConnectButton() {
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    });

    return (
        <button
            onClick={() => connect()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Connect Wallet
        </button>
    );
} 
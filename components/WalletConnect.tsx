import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletConnect: React.FC = () => {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
            }) => {
                const ready = mounted;
                if (!ready) return null;

                return (
                    <div className="flex items-center gap-2">
                        {(() => {
                            if (!account) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }

                            if (chain?.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                                    >
                                        Wrong Network
                                    </button>
                                );
                            }

                            return (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={openChainModal}
                                        className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        {chain?.name}
                                    </button>
                                    <button
                                        onClick={openAccountModal}
                                        className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        {account.displayName}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};

export default WalletConnect;
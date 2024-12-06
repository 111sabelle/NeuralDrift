import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

export const { chains, publicClient } = configureChains(
    [sepolia],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: 'Neural Drift',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
    chains,
});

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
});

export default wagmiConfig;
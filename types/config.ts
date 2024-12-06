import { VisualConfig } from './index';

export interface Config {
    contract: {
        address: string;
        network: number;
    };
    solana: {
        rpcUrl: string;
        wsUrl: string;
    };
    ipfs: {
        gateway: string;
    };
    refreshIntervals: {
        nftState: number;
        tokenBalances: number;
        prices: number;
    };
    visual: VisualConfig;  // 使用从 index.ts 导入的 VisualConfig
}
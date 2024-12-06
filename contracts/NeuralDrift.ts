import { ethers } from 'ethers';
import type { ContractTransaction, BigNumber, EventFilter, Contract } from 'ethers';
import type { Signer, providers } from 'ethers';
import NeuralDriftJSON from './NeuralDrift.json';  // 修改导入名称

// 定义合约状态枚举
export enum NFTState {
    AUCTION = 0,
    DISPLAY = 1,
    DISPOSED = 2
}

export enum DispositionType {
    BURN = 0,
    RETURN = 1,
    TRANSFER = 2
}

// 定义 NFT 数据结构
export interface NFTData {
    solanaAddress: string;
    state: NFTState;
    auctionEndTime: BigNumber;
    displayPeriod: BigNumber;
    hasModifiedAuctionTime: boolean;
    hasModifiedDisplayPeriod: boolean;
    lastUpdateTime: BigNumber;
    isLocked: boolean;
}

export interface NeuralDriftContract extends Contract {
    // 基本信息
    DEFAULT_DISPLAY_PERIOD(): Promise<BigNumber>;
    MAX_AUCTION_PERIOD(): Promise<BigNumber>;
    owner(): Promise<string>;

    // NFT 操作
    mintNFT(
        to: string, 
        solanaAddress: string
    ): Promise<ContractTransaction>;

    // NFT 数据查询
    nfts(tokenId: string | number): Promise<NFTData>;

    // 时间修改
    modifyAuctionTime(
        tokenId: string | number,
        newEndTime: number
    ): Promise<ContractTransaction>;

    modifyDisplayPeriod(
        tokenId: string | number,
        newPeriodMinutes: number
    ): Promise<ContractTransaction>;

    // 事件过滤器
    filters: {
        AuctionTimeModified(tokenId: string | number): EventFilter;
        DisplayPeriodModified(tokenId: string | number): EventFilter;
        DispositionExecuted(tokenId: string | number): EventFilter;
        TokenBalanceUpdated(
            tokenId: string | number,
            symbol?: string,
            amount?: BigNumber,
            usdValue?: BigNumber,
            sender?: string
        ): EventFilter;
    };
}

export const NeuralDriftAddress = NeuralDriftJSON.address as string;
export const NeuralDriftABI = NeuralDriftJSON.abi;

export function getNeuralDriftContract(
    signerOrProvider: Signer | providers.Provider
): NeuralDriftContract {
    return new ethers.Contract(
        NeuralDriftAddress,
        NeuralDriftABI,
        signerOrProvider
    ) as NeuralDriftContract;
}
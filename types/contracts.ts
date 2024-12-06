import { ethers } from 'ethers';

export enum NFTState {
    AUCTION = 0,
    DISPLAY = 1,
    DISPOSED = 2
}

export enum DispositionType {
    BURN = 0,
    REFUND = 1,
    TRANSFER = 2
}

export interface NFTData {
    solanaAddress: string;
    state: NFTState;
    auctionEndTime: ethers.BigNumber;
    displayPeriod: ethers.BigNumber;
    hasModifiedAuctionTime: boolean;
    hasModifiedDisplayPeriod: boolean;
    lastUpdateTime: ethers.BigNumber;
    isLocked: boolean;
}

export interface TokenBalance {
    symbol: string;
    amount: ethers.BigNumber;
    usdValue: ethers.BigNumber;
    originalSender: string;
}

export interface TokenInfo {
    symbol: string;
    amount: number;
    usdValue: number;
    percentage?: number;
}

export interface NeuralDriftContract extends ethers.Contract {
    // 基本信息
    currentTokenId(): Promise<ethers.BigNumber>;
    DEFAULT_DISPLAY_PERIOD(): Promise<ethers.BigNumber>;
    MIN_DISPLAY_PERIOD(): Promise<ethers.BigNumber>;
    MAX_DISPLAY_PERIOD(): Promise<ethers.BigNumber>;
    
    // NFT 操作
    mintNFT(to: string, solanaAddress: string): Promise<ethers.ContractTransaction>;
    nfts(tokenId: string | number): Promise<NFTData>;
    tokenBalances(symbol: string): Promise<TokenBalance>;
    tokenSymbols(index: number): Promise<string>;
    
    // 状态更新
    updateNFTState(tokenId: string | number): Promise<ethers.ContractTransaction>;
    
    // 时间修改
    modifyAuctionTime(
        tokenId: string | number,
        newEndTime: number
    ): Promise<ethers.ContractTransaction>;
    
    modifyDisplayPeriod(
        tokenId: string | number,
        newPeriodMinutes: number
    ): Promise<ethers.ContractTransaction>;
    
    // 事件过滤器
    filters: {
        NFTStateUpdated(tokenId: string | number): ethers.EventFilter;
        TokenBalanceUpdated(
            tokenId: string | number,
            symbol?: string,
            amount?: ethers.BigNumber,
            usdValue?: ethers.BigNumber,
            sender?: string
        ): ethers.EventFilter;
        AuctionTimeModified(tokenId: string | number): ethers.EventFilter;
        DisplayPeriodModified(tokenId: string | number): ethers.EventFilter;
        DispositionExecuted(tokenId: string | number): ethers.EventFilter;
    };
    
    // 添加这个方法定义
    updateTokenBalance(
        tokenId: string | number,
        symbol: string,
        amount: ethers.BigNumber,
        usdValue: ethers.BigNumber
    ): Promise<ethers.ContractTransaction>;
}

// 合约事件类型
export interface NFTStateUpdatedEvent {
    tokenId: string;
    newState: NFTState;
    timestamp: number;
}

export interface TokenBalanceUpdatedEvent {
    tokenId: string;
    symbol: string;
    amount: number;
    usdValue: number;
}

export interface DispositionSetEvent {
    tokenId: string;
    dispositionType: DispositionType;
    targetAddress: string;
}

export interface DispositionExecutedEvent {
    tokenId: string;
    dispositionType: DispositionType;
}
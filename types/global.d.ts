declare module '*.json' {
    const content: any;
    export default content;
}

// 为合约相关类型添加声明
declare type NFTState = 0 | 1 | 2; // 根据实际合约状态枚举调整

declare interface NFTData {
    solanaAddress: string;
    state: NFTState;
    auctionEndTime: number;
    displayPeriod: number;
}

declare interface TokenInfo {
    symbol: string;
    balance?: number;
    usdValue?: number;
    percentage?: number;
} 
import { ethers } from 'ethers';

export interface TokenInfo {
    symbol: string;
    amount: number;
    usdValue: number;
    proportion: number;
    transactions: number;
    change: number;
    percentage?: number;
}

export interface TokenBalance {
    symbol: string;
    amount: ethers.BigNumber;
    usdValue: ethers.BigNumber;
    originalSender: string;
}

// NFT 状态相关
export type NFTStateType = 'AUCTION' | 'DISPLAY' | 'DISPOSED';

export interface NFTState {
    tokenId: string;
    owner: string;
    solanaAddress: string;
    state: NFTStateType;
    auctionEndTime: number;
    displayPeriod: number;
}

export interface NFTData {
    tokenId: string;
    solanaAddress: string;
    state: NFTStateType;
    auctionEndTime: number;
    displayPeriod: number;
    hasModifiedDisplayPeriod: boolean;
    hasModifiedAuctionTime: boolean;
    lastUpdateTime: number;
    isLocked: boolean;
}

// 处置相关
export enum TokenDisposition {
    BURN = 0,
    RETURN_TO_SENDERS = 1,
    TRANSFER_TO_OWNER = 2,
}

export interface DispositionData {
    disposition: TokenDisposition;
    solanaAddress?: string;
}

// 可视化相关接口
export interface Point {
    x: number;
    y: number;
    width?: number;
    density?: number;
    type?: 'main' | 'ink';
}

export interface Contour {
    points: Point[];
    weight: number;
}

// 可视化配置
export interface VisualConfig {
    width: number;
    height: number;
    fontSize: number;
    fontPath: string;
    particle: {
        size: number;
        density: number;
        maxStrokeWidth: number;
        minStrokeWidth: number;
        gridSize: number;
        noiseScale: number;
        baseOpacity: number;
    };
}

// 组件 Props 接口
export interface NFTDisplayProps {
    solanaAddress: string;
    tokenId: string;
    className?: string;
}

export interface NFTVisualProps {
    tokens: TokenInfo[];  // 更新为接收所有代币
    isDisplayPeriod: boolean;
}

export interface NFTManagementProps {
    tokenId: string;
    isOwner: boolean;
    initialSolanaAddress: string;
    onDispose: (disposition: TokenDisposition, solanaAddress: string) => Promise<void>;
}

// 事件类型
export interface NFTStateUpdatedEvent {
    tokenId: string;
    newState: NFTStateType;
    timestamp: number;
}

export interface DispositionSetEvent {
    tokenId: string;
    disposition: TokenDisposition;
    solanaAddress: string;
}

// 错误处理
export interface ApiError extends Error {
    code?: string;
    statusCode?: number;
    data?: any;
}
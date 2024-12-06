import { PublicKey } from '@solana/web3.js';

export const validateSolanaAddress = (address: string): boolean => {
    try {
        new PublicKey(address);
        return true;
    } catch {
        return false;
    }
};

export const validateAuctionTime = (timestamp: number): boolean => {
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysFromNow = now + (30 * 24 * 60 * 60);
    return timestamp > now && timestamp <= thirtyDaysFromNow;
};

export const validateDisplayPeriod = (minutes: number): boolean => {
    return minutes >= 5 && minutes <= 43200;
};

export const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Ended';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
};

export const formatUSDValue = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

export const formatDisplayPeriod = (seconds: number): string => {
    const minutes = seconds / 60;
    if (minutes < 60) {
        return `${minutes} minutes`;
    } else if (minutes < 1440) {
        return `${(minutes / 60).toFixed(1)} hours`;
    } else {
        return `${(minutes / 1440).toFixed(1)} days`;
    }
}; 
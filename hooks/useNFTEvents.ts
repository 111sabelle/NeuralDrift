import { useEffect, useCallback } from 'react';
import { useContract } from './useContract';
import { useToast } from './useToast';

export function useNFTEvents(tokenId: string) {
    const { contract } = useContract();
    const toast = useToast();

    const handleAuctionEnd = useCallback((tokenId: string) => {
        toast({
            title: 'Auction Ended',
            description: `Auction for NFT #${tokenId} has ended`,
            status: 'info'
        });
    }, [toast]);

    const handleDisplayPeriodEnd = useCallback((tokenId: string) => {
        toast({
            title: 'Display Period Ended',
            description: `Display period for NFT #${tokenId} has ended`,
            status: 'info'
        });
    }, [toast]);

    useEffect(() => {
        if (!contract) return;

        contract.on('AuctionEnded', handleAuctionEnd);
        contract.on('DisplayPeriodEnded', handleDisplayPeriodEnd);

        return () => {
            contract.off('AuctionEnded', handleAuctionEnd);
            contract.off('DisplayPeriodEnded', handleDisplayPeriodEnd);
        };
    }, [contract, handleAuctionEnd, handleDisplayPeriodEnd]);
} 
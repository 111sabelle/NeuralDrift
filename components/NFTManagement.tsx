import React, { useState, useEffect, useCallback } from 'react';
import { useContract } from '../hooks/useContract';
import { useMetaMask } from '../hooks/useMetaMask';
import { useTransactionStatus } from '../hooks/useTransactionStatus';
import { useNFTState } from '../hooks/useNFTState';
import { TokenDisposition, NFTManagementProps } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { validateSolanaAddress } from '../utils/validation';

const NFTManagement: React.FC<NFTManagementProps> = ({
    tokenId,
    isOwner,
    initialSolanaAddress,
    onDispose
}) => {
    const { contract } = useContract();
    const { pending, success, handleTransaction } = useTransactionStatus();  // 移除 error
    const { state: nftState, auctionEndTime, displayPeriod } = useNFTState(tokenId);

    const [solanaAddress, setSolanaAddress] = useState(initialSolanaAddress);
    const [disposition, setDisposition] = useState<TokenDisposition>(TokenDisposition.BURN);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<() => Promise<void>>(() => async () => {});
    const [dialogMessage, setDialogMessage] = useState('');
    const [error, setError] = useState<string | null>(null);  // 保留这个 error state
    const [newAuctionTime, setNewAuctionTime] = useState<string>('');
    const [newDisplayPeriod, setNewDisplayPeriod] = useState<number>(60);

    const handleAuctionTimeChange = useCallback(async (value: string) => {
        try {
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            const timestamp = Math.floor(new Date(value).getTime() / 1000);
            const now = Math.floor(Date.now() / 1000);
            
            if (timestamp <= now) {
                throw new Error('Auction end time must be in the future');
            }

            setNewAuctionTime(value);
            setDialogMessage('Are you sure you want to modify the auction time? This action cannot be undone.');
            setDialogAction(() => async () => {
                await handleTransaction(
                    contract.modifyAuctionTime(tokenId, timestamp),
                    'Auction time modified successfully'
                );
            });
            setShowConfirmDialog(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to modify auction time';
            setError(errorMessage);
        }
    }, [contract, tokenId, handleTransaction]);

    const handleDisplayPeriodChange = useCallback(async (minutes: number) => {
        try {
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            if (minutes < 5 || minutes > 43200) {
                throw new Error('Display period must be between 5 minutes and 30 days');
            }

            setNewDisplayPeriod(minutes);
            setDialogMessage('Are you sure you want to modify the display period? This action cannot be undone.');
            setDialogAction(() => async () => {
                await handleTransaction(
                    contract.modifyDisplayPeriod(tokenId, minutes),
                    'Display period modified successfully'
                );
            });
            setShowConfirmDialog(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to modify display period';
            setError(errorMessage);
        }
    }, [contract, tokenId, handleTransaction]);

    const handleDisposition = useCallback(async () => {
        try {
            if (!contract) {
                throw new Error('Contract not initialized');
            }

            if (disposition === TokenDisposition.TRANSFER_TO_OWNER) {
                if (!validateSolanaAddress(solanaAddress)) {
                    throw new Error('Invalid Solana address');
                }
            }

            let confirmMessage = 'Are you sure you want to ';
            switch (disposition) {
                case TokenDisposition.BURN:
                    confirmMessage += 'burn all tokens?';
                    break;
                case TokenDisposition.RETURN_TO_SENDERS:
                    confirmMessage += 'return tokens to their original senders?';
                    break;
                case TokenDisposition.TRANSFER_TO_OWNER:
                    confirmMessage += `transfer all tokens to ${solanaAddress}?`;
                    break;
            }

            setDialogMessage(confirmMessage);
            setDialogAction(() => async () => {
                await handleTransaction(
                    contract.setTokenDisposition(tokenId, disposition, solanaAddress),
                    'Disposition set successfully'
                );
            });
            setShowConfirmDialog(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to set disposition';
            setError(errorMessage);
        }
    }, [contract, tokenId, disposition, solanaAddress, handleTransaction]);

    if (!isOwner) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Modify Display Period</h3>
                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        value={newDisplayPeriod}
                        onChange={(e) => setNewDisplayPeriod(parseInt(e.target.value))}
                        min={5}
                        max={43200}
                        className="w-full p-2 border border-black rounded"
                    />
                    <span className="text-gray-500">minutes</span>
                </div>
            </div>

            <div className="bg-white border border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Set Token Disposition</h3>
                <select 
                    value={disposition}
                    onChange={(e) => setDisposition(parseInt(e.target.value))}
                    className="w-full p-2 mb-4 border border-black rounded"
                >
                    <option value={TokenDisposition.BURN}>Burn Tokens</option>
                    <option value={TokenDisposition.RETURN_TO_SENDERS}>Return to Senders</option>
                    <option value={TokenDisposition.TRANSFER_TO_OWNER}>Transfer to Owner</option>
                </select>

                {disposition === TokenDisposition.TRANSFER_TO_OWNER && (
                    <input
                        type="text"
                        value={solanaAddress}
                        onChange={(e) => setSolanaAddress(e.target.value)}
                        placeholder="Enter Solana address"
                        className="w-full p-2 mb-4 border border-black rounded"
                    />
                )}

                <button
                    onClick={handleDisposition}
                    disabled={pending}
                    className="w-full p-2 border border-black rounded bg-white hover:bg-gray-50 
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    {pending ? <LoadingSpinner /> : 'Confirm Disposition'}
                </button>
            </div>
        </div>
    );
};

export { NFTManagement };  // 命名导出
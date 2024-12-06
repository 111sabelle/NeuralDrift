import { useState } from 'react';
import { ContractTransaction } from 'ethers';
import { toast } from 'react-toastify';

export function useTransactionStatus() {
    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleTransaction = async (
        transaction: Promise<ContractTransaction>,
        successMessage: string = 'Transaction successful'
    ) => {
        setPending(true);
        setSuccess(false);
        
        try {
            const tx = await transaction;
            await tx.wait();
            setSuccess(true);
            toast.success(successMessage);
            return true;
        } catch (error) {
            console.error('Transaction failed:', error);
            toast.error(error instanceof Error ? error.message : 'Transaction failed');
            throw error;
        } finally {
            setPending(false);
        }
    };

    return {
        pending,
        success,
        handleTransaction
    };
}
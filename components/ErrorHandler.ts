export class SolanaError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SolanaError';
    }
}

export function handleSolanaError(error: any): Error {
    if (error instanceof SolanaError) {
        return error;
    }
    
    if (error.message.includes('Invalid address')) {
        return new SolanaError('Invalid Solana address format');
    }
    
    if (error.message.includes('Network error')) {
        return new SolanaError('Failed to connect to Solana network');
    }
    
    return new Error('An unexpected error occurred');
} 
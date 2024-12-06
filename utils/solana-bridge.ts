import { 
    Connection, 
    PublicKey, 
    Transaction, 
    SystemProgram,
    TransactionInstruction,
    Keypair,
    sendAndConfirmTransaction,
    Signer,
    Commitment 
} from '@solana/web3.js';
import { 
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createTransferInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    Account as TokenAccount
} from '@solana/spl-token';
import { TokenBalance } from '../types';

export interface TransferOptions {
    skipPreflight?: boolean;
    commitment?: Commitment;
    maxRetries?: number;
}

export class SolanaBridge {
    private connection: Connection;
    private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
    private readonly MAX_RETRIES = 3;
    private readonly DEFAULT_COMMITMENT: Commitment = 'confirmed';

    constructor(rpcUrl: string) {
        this.connection = new Connection(rpcUrl, {
            commitment: this.DEFAULT_COMMITMENT,
            wsEndpoint: rpcUrl.replace('https://', 'wss://'),
            disableRetryOnRateLimit: false
        });
    }

    async transferTokens(
        fromAddress: string,
        toAddress: string,
        amount: number,
        tokenMint: string,
        payer: Signer,
        options: TransferOptions = {}
    ): Promise<string> {
        return await this.retryWithTimeout(async () => {
            try {
                const fromPubkey = new PublicKey(fromAddress);
                const toPubkey = new PublicKey(toAddress);
                const mintPubkey = new PublicKey(tokenMint);

                const fromTokenAccount = await this.getOrCreateAssociatedTokenAccount(
                    fromPubkey,
                    mintPubkey,
                    payer
                );
                
                const toTokenAccount = await this.getOrCreateAssociatedTokenAccount(
                    toPubkey,
                    mintPubkey,
                    payer
                );

                const transaction = new Transaction();

                transaction.add(
                    createTransferInstruction(
                        fromTokenAccount,
                        toTokenAccount,
                        fromPubkey,
                        amount,
                        [payer],
                        TOKEN_PROGRAM_ID
                    )
                );

                const { blockhash, lastValidBlockHeight } = 
                    await this.connection.getLatestBlockhash(this.DEFAULT_COMMITMENT);
                
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = payer.publicKey;

                const signature = await sendAndConfirmTransaction(
                    this.connection,
                    transaction,
                    [payer],
                    {
                        skipPreflight: options.skipPreflight || false,
                        commitment: options.commitment || this.DEFAULT_COMMITMENT,
                        maxRetries: options.maxRetries || this.MAX_RETRIES
                    }
                );

                await this.connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                });

                return signature;

            } catch (error) {
                console.error('Failed to transfer tokens:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                throw new Error(`Failed to transfer tokens: ${errorMessage}`);
            }
        });
    }

    async getOrCreateAssociatedTokenAccount(
        owner: PublicKey,
        mint: PublicKey,
        payer: Signer
    ): Promise<PublicKey> {
        return await this.retryWithTimeout(async () => {
            try {
                const associatedToken = await getAssociatedTokenAddress(
                    mint,
                    owner,
                    false,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                try {
                    await getAccount(
                        this.connection,
                        associatedToken,
                        this.DEFAULT_COMMITMENT,
                        TOKEN_PROGRAM_ID
                    );
                    return associatedToken;
                } catch (error) {
                    if (error instanceof Error && error.name === 'TokenAccountNotFoundError') {
                        const transaction = new Transaction().add(
                            createAssociatedTokenAccountInstruction(
                                payer.publicKey,
                                associatedToken,
                                owner,
                                mint,
                                TOKEN_PROGRAM_ID,
                                ASSOCIATED_TOKEN_PROGRAM_ID
                            )
                        );

                        const { blockhash, lastValidBlockHeight } = 
                            await this.connection.getLatestBlockhash(this.DEFAULT_COMMITMENT);
                        
                        transaction.recentBlockhash = blockhash;
                        transaction.feePayer = payer.publicKey;

                        await sendAndConfirmTransaction(
                            this.connection,
                            transaction,
                            [payer],
                            { commitment: this.DEFAULT_COMMITMENT }
                        );

                        return associatedToken;
                    }
                    throw error;
                }
            } catch (error) {
                console.error('Failed to get or create associated token account:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                throw new Error(`Failed to get or create associated token account: ${errorMessage}`);
            }
        });
    }

    async getTokenBalance(
        walletAddress: string,
        tokenMint: string
    ): Promise<number> {
        return await this.retryWithTimeout(async () => {
            try {
                const walletPubkey = new PublicKey(walletAddress);
                const mintPubkey = new PublicKey(tokenMint);
                
                const tokenAccount = await getAssociatedTokenAddress(
                    mintPubkey,
                    walletPubkey,
                    false,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
                return Number(accountInfo.value.uiAmount);
            } catch (error) {
                console.error('Failed to get token balance:', error);
                return 0;
            }
        });
    }

    async isTokenAccountExists(
        walletAddress: PublicKey,
        tokenMint: PublicKey
    ): Promise<boolean> {
        return await this.retryWithTimeout(async () => {
            try {
                const associatedToken = await getAssociatedTokenAddress(
                    tokenMint,
                    walletAddress,
                    false,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const accountInfo = await this.connection.getAccountInfo(associatedToken);
                return accountInfo !== null;
            } catch (error) {
                console.error('Failed to check token account:', error);
                return false;
            }
        });
    }

    private async retryWithTimeout<T>(
        operation: () => Promise<T>
    ): Promise<T> {
        for (let i = 0; i < this.MAX_RETRIES; i++) {
            try {
                const result = await Promise.race([
                    operation(),
                    new Promise<never>((_, reject) => 
                        setTimeout(() => reject(new Error('Operation timed out')), this.DEFAULT_TIMEOUT)
                    )
                ]);
                return result;
            } catch (error) {
                if (i === this.MAX_RETRIES - 1) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    throw new Error(`Operation failed: ${errorMessage}`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
        throw new Error('Operation failed after max retries');
    }
}
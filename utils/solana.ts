import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export interface TokenBalance {
    mint: string;
    amount: number;
    symbol: string;
    decimals: number;
    usdValue?: number;
    logo?: string;
}

interface TokenPrice {
    [key: string]: {
        usd: number;
        usd_24h_change?: number;
    };
}

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Token 地址到 CoinGecko ID 的映射
const TOKEN_ID_MAP: { [key: string]: string } = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usdc', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'usdt', // USDT
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'msol', // mSOL
    // 添加更多代币映射...
};

// 代币 Logo 映射
const TOKEN_LOGO_MAP: { [key: string]: string } = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    // 添加更多 logo 映射...
};

export async function getTokenBalances(solanaAddress: string): Promise<TokenBalance[]> {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    
    try {
        // 验证地址格式
        if (!solanaAddress) {
            throw new Error('Solana address is required');
        }
        
        const pubKey = new PublicKey(solanaAddress);
        
        // 获取所有代币账户
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            pubKey,
            { programId: TOKEN_PROGRAM_ID }
        );

        // 获取所有需要查询价格的代币地址
        const tokenMints = tokenAccounts.value
            .map(account => account.account.data.parsed.info.mint)
            .filter(mint => TOKEN_ID_MAP[mint]);

        // 批量获取代币价格
        const prices = await getTokenPrices(tokenMints);

        // 处理每个代币账户
        const balances = await Promise.all(
            tokenAccounts.value.map(async (account) => {
                const parsedInfo = account.account.data.parsed.info;
                const mintAddress = parsedInfo.mint;
                
                // 计算USD价值
                const usdValue = prices[mintAddress] || 0;
                const amount = parsedInfo.tokenAmount.uiAmount;
                
                return {
                    mint: mintAddress,
                    amount: amount,
                    symbol: parsedInfo.symbol || await getTokenSymbol(connection, mintAddress),
                    decimals: parsedInfo.tokenAmount.decimals,
                    usdValue: usdValue * amount,
                    logo: TOKEN_LOGO_MAP[mintAddress]
                };
            })
        );

        // 过滤掉余额为0的代币，并按USD价值排序
        return balances
            .filter(b => b.amount > 0)
            .sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));

    } catch (error) {
        console.error('Error fetching Solana balances:', error);
        throw new SolanaBalanceError(
            error instanceof Error ? error.message : 'Unknown error occurred'
        );
    }
}

async function getTokenPrices(mintAddresses: string[]): Promise<{ [key: string]: number }> {
    try {
        // 获取需要查询的CoinGecko IDs
        const coinIds = mintAddresses
            .map(mint => TOKEN_ID_MAP[mint])
            .filter(Boolean)
            .join(',');

        if (!coinIds) {
            return {};
        }

        const url = new URL(`${COINGECKO_API}/simple/price`);
        url.searchParams.append('ids', coinIds);
        url.searchParams.append('vs_currencies', 'usd');
        url.searchParams.append('include_24hr_change', 'true');

        const response = await fetch(url.toString());
        const data: TokenPrice = await response.json();

        // 将结果映射回代币地址
        const priceMap: { [key: string]: number } = {};
        mintAddresses.forEach(mint => {
            const coinId = TOKEN_ID_MAP[mint];
            if (coinId && data[coinId]) {
                priceMap[mint] = data[coinId].usd;
            }
        });

        return priceMap;
    } catch (error) {
        console.error('Error fetching token prices:', error);
        return {};
    }
}

async function getTokenSymbol(connection: Connection, mintAddress: string): Promise<string> {
    try {
        const mintInfo = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
        if (!mintInfo.value?.data) {
            return 'Unknown';
        }
        return (mintInfo.value.data as any).parsed?.info?.symbol || 'Unknown';
    } catch (error) {
        console.error('Error fetching token symbol:', error);
        return 'Unknown';
    }
}

// 自定义错误类
export class SolanaBalanceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SolanaBalanceError';
    }
}

// 重试机制
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxAttempts) break;
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    
    throw lastError;
}
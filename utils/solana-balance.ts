import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenListProvider } from "@solana/spl-token-registry";
import { TokenInfo } from "../types";

export class SolanaBalanceReader {
  private connection: Connection;
  private tokenList: Map<string, any>;
  private priceCache: Map<string, number>;
  private lastPriceUpdate: number;
  private readonly PRICE_CACHE_DURATION = 60000; // 1分钟缓存
  private readonly RETRY_DELAY = 1000; // 1秒重试延迟
  private readonly MAX_RETRIES = 1;

  constructor(rpcUrl: string) {
    console.log("初始化 SolanaBalanceReader, RPC URL:", rpcUrl);
    this.connection = new Connection(rpcUrl);
    this.tokenList = new Map();
    this.priceCache = new Map();
    this.lastPriceUpdate = 0;
    this.initializeTokenList();
  }

  private async initializeTokenList() {
    try {
      const tokens = await new TokenListProvider().resolve();
      const tokenList = tokens.filterByClusterSlug("mainnet-beta").getList();
      tokenList.forEach((token) => {
        this.tokenList.set(token.address, token);
      });
    } catch (error) {
      console.error("Failed to initialize token list:", error);
      // 继续执行，使用空的 token list
    }
  }

  getAssetBatch = async (tokens: string[]) => {
    const urls = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "";
    const response = await fetch(urls, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetBatch",
        params: {
          ids: tokens,
        },
      }),
    });
    const { result } = await response.json();
    return result;
  };

  async getTokenBalances(address: string): Promise<TokenInfo[]> {
    console.log("开始获取代币余额，地址:", address);
    try {
      const pubkey = new PublicKey(address);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        pubkey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const ids = tokenAccounts.value.map(
        (account) => account.account.data.parsed.info.mint
      );
      const tokenInfos = await this.getAssetBatch(ids);

      console.log("获取到的代币账户:", tokenInfos);
      const tokens = tokenAccounts.value
        .map((account) => {
          const parsedInfo = account.account.data.parsed.info;
          const tokenInfo = tokenInfos.find(
            (r: any) => r.id === parsedInfo.mint
          );
          const amount = Number(parsedInfo.tokenAmount.uiAmount);

          console.log("tokenInfotokenInfotokenInfo", tokenInfo);

          return {
            mint: parsedInfo.mint,
            symbol: tokenInfo?.metadata.symbol || "Unknown",
            address: parsedInfo.mint,
            amount,
            decimals: parsedInfo.tokenAmount.decimals,
            usdValue: 0,
            logo: tokenInfo?.logoURI,
            percentage: 0,
            proportion: 0,
            transactions: 0,
            change: 0,
          } as TokenInfo;
        })
        .filter((token) => token.amount > 0);

      console.log("原始代币数据:", tokens);

      // 更新 USD 价值
      const tokensWithUSD = await this.updateUSDValues(tokens);
      console.log("添加 USD 价值后的代币数据:", tokensWithUSD);

      // 计算百分比
      const totalValue = tokensWithUSD.reduce(
        (sum, token) => sum + (token.usdValue || 0),
        0
      );
      console.log("代币总价值:", totalValue);

      const processedTokens = tokensWithUSD.map((token) => ({
        ...token,
        percentage:
          totalValue > 0 ? ((token.usdValue || 0) / totalValue) * 100 : 0,
      }));
      console.log("最终处理后的代币数据:", processedTokens);

      return processedTokens;
    } catch (error) {
      console.error("获取代币余额时出错:", error);
      throw error;
    }
  }

  private async updateUSDValues(tokens: TokenInfo[]): Promise<TokenInfo[]> {
    const now = Date.now();
    if (now - this.lastPriceUpdate > this.PRICE_CACHE_DURATION) {
      this.priceCache.clear();
      this.lastPriceUpdate = now;
    }

    const pricePromises = tokens.map(async (token) => {
      let usdPrice = this.priceCache.get(token.symbol) || 0;

      if (!usdPrice) {
        try {
          const data = await this.fetchWithRetry(
            `https://api.coingecko.com/api/v3/simple/price?ids=${token.symbol.toLowerCase()}&vs_currencies=usd`
          );
          const fetchedPrice = data[token.symbol.toLowerCase()]?.usd;
          usdPrice = typeof fetchedPrice === "number" ? fetchedPrice : 0;
          this.priceCache.set(token.symbol, usdPrice);
        } catch (error) {
          console.error(`Failed to fetch price for ${token.symbol}:`, error);
          // 如果获取价格失败，尝试使用备用价格源或默认价格
          usdPrice = this.getBackupPrice(token.symbol);
        }
      }

      return {
        ...token,
        usdValue: token.amount * usdPrice,
      };
    });

    return Promise.all(pricePromises);
  }

  private async fetchWithRetry(
    url: string,
    retries = this.MAX_RETRIES
  ): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, this.RETRY_DELAY * (i + 1))
        );
      }
    }
  }

  private getBackupPrice(symbol: string): number {
    // 备用价格源或默认价格
    const backupPrices: { [key: string]: number } = {
      SOL: 20,
      USDC: 1,
      USDT: 1,
      RAY: 0.5,
      // 添加更多备用价格
    };
    return backupPrices[symbol] || 0;
  }

  // 用于测试的方法
  public async validateConnection(): Promise<boolean> {
    try {
      await this.connection.getVersion();
      return true;
    } catch (error) {
      console.error("Connection validation failed:", error);
      return false;
    }
  }
}

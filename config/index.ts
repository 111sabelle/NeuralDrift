export const config = {
  contract: {
    address: "0x2015980D271b1d2E952a50a03BB6FdD8A7902f97",
    network: 11155111,
  },
  solana: {
    rpcUrl:
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    wsUrl:
      process.env.NEXT_PUBLIC_SOLANA_WS_URL ||
      "wss://api.mainnet-beta.solana.com",
  },
  ipfs: {
    gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/",
  },
  refreshIntervals: {
    nftState: 30000, // 30 seconds
    tokenBalances: 60000, // 1 minute
    prices: 300000, // 5 minutes
  },
  visual: {
    width: 800,
    height: 800,
    fontSize: 150,
    fontPath: "/fonts/SourceCodePro-Light.ttf",
    particle: {
      size: 1.5,
      density: 2,
      maxStrokeWidth: 12,
      minStrokeWidth: 3,
      gridSize: 1.5,
      noiseScale: 0.03,
      baseOpacity: 200,
    },
  },
  tokenPrices: {
    cacheDuration: 60000, // 1 minute cache for token prices
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
};

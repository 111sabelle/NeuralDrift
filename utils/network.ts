import { ethers } from "ethers";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;

export const switchToSepolia = async () => {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID }], // Sepolia chainId in hex
    });
  } catch (error: any) {
    // 如果网络不存在，添加网络
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_ID,
            chainName:
              CHAIN_ID === "0x1" ? "Ethereum Mainnet" : "Sepolia Test Network",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [
              CHAIN_ID === "0x1"
                ? "https://etherscan.io"
                : "https://sepolia.etherscan.io",
            ],
          },
        ],
      });
    } else {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
};

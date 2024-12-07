import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SolanaBalanceReader } from "../utils/solana-balance";
import { useContract } from "../hooks/useContract";
import { useNFTState } from "../hooks/useNFTState";
import { LoadingSpinner } from "./LoadingSpinner";
import { NFTData, TokenInfo } from "../types";
import { NFTState } from "../types/contracts";
import { config } from "../config";
import { OracleService } from "../services/OracleService";
import { ethers } from "ethers";

const NFTVisual = dynamic(() => import("./NFTVisual"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center">
      <LoadingSpinner />
    </div>
  ),
});

interface NFTDisplayProps {
  nft: NFTData;
  tokenId: string;
  className?: string;
}

export const NFTDisplay: React.FC<NFTDisplayProps> = ({
  nft,
  tokenId,
  className = "",
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state: nftState } = useNFTState(tokenId);
  const isDisplayPeriod =
    nftState === NFTState.DISPLAY || nftState === NFTState.AUCTION;
  const { contract } = useContract();

  // useEffect(() => {
  //   const checkWallet = async () => {
  //     if (typeof window.ethereum !== "undefined") {
  //       const provider = new ethers.providers.Web3Provider(window.ethereum);
  //       try {
  //         const accounts = await provider.listAccounts();
  //         if (accounts.length > 0) {
  //           setAccount(accounts[0]);
  //         }
  //       } catch (err) {
  //         console.error("Error checking wallet:", err);
  //       }
  //     }
  //   };

  //   checkWallet();
  // }, []);

  const fetchTokens = useCallback(async () => {
    if (!nft.solanaAddress || !contract) {
      console.warn("Account or contract not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const reader = new SolanaBalanceReader(config.solana.rpcUrl);
      // const balances = await reader.getTokenBalances(
      //   "FWVxLgYPfryxjoof1cib314cMNGunMZaXwY5C12umjxB"
      // );
      const balances = await reader.getTokenBalances(nft.solanaAddress);

      if (balances.length === 0) {
        console.log("No token balances found");
        setTokens([]);
        return;
      }

      const sortedBalances = balances.sort(
        (a, b) => (b.usdValue || 0) - (a.usdValue || 0)
      );
      setTokens(sortedBalances);
      // 更新合约中的代币余额
      // if (tokenId) {
      //   await Promise.all(
      //     sortedBalances.map(async (balance) => {
      //       const tx = await contract.updateTokenBalance(
      //         tokenId,
      //         balance.symbol,
      //         ethers.utils.parseUnits(balance.amount.toString(), 18),
      //         ethers.utils.parseUnits(balance.usdValue.toString(), 18)
      //       );
      //       await tx.wait();
      //     })
      //   );
      // }
    } catch (err) {
      console.error("Error fetching token balances:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch token balances"
      );
    } finally {
      setIsLoading(false);
    }
  }, [nft, contract, tokenId]);

  useEffect(() => {
    fetchTokens().catch((err) => {
      console.error("fetchTokens 函数出错:", err);
      setError(err instanceof Error ? err.message : "发生未知错误");
    });
  }, [fetchTokens]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <NFTVisual tokens={tokens} isDisplayPeriod={isDisplayPeriod} />
    </div>
  );
};

export default NFTDisplay;

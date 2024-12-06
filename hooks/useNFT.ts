import { useState, useEffect } from "react";
import { NFTData, TokenBalance } from "../types";
import { useAccount, useContractRead } from "wagmi";
import { useContract } from "./useContract";
import { OracleService } from "../services/OracleService";
import { ethers } from "ethers";

export function useNFT(tokenId?: string) {
  const [nft, setNft] = useState<NFTData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState(false);
  const { contract } = useContract();

  const fetchNFTData = async () => {
    if (!contract) return;

    console.log("contract", contract);

    const tokenId = await contract.read?.currentTokenId([]);
    console.log("Token ID:", tokenId.toString());

    try {
      setIsLoading(true);
      const owner = await contract.read.ownerOf([tokenId]);

      console.log("owner", owner);

      const nftData = await contract.read.nfts([tokenId]);
      console.log("NFT data:", nftData);

      const data: NFTData = {
        tokenId,
        solanaAddress: nftData[0],
        state: nftData[1],
        auctionEndTime: nftData[2],
        displayPeriod: nftData[3],
        hasModifiedAuctionTime: nftData[4],
        hasModifiedDisplayPeriod: nftData[5],
        lastUpdateTime: nftData[6],
        isLocked: nftData[7],
      };
      setNft(data);
      setIsOwner(owner.toLowerCase() === address?.toLowerCase());
    } catch (err) {
      console.error("Error fetching NFT data:", err);
      setError("Failed to fetch NFT data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTokenBalances = async (tokenBalances: TokenBalance[]) => {
    if (!contract || !tokenId) return;

    const oracle = new OracleService();

    try {
      await Promise.all(
        tokenBalances.map((balance) =>
          oracle.updateTokenBalance(
            tokenId,
            balance.symbol,
            Number(ethers.utils.formatUnits(balance.amount, 18)),
            Number(ethers.utils.formatUnits(balance.usdValue || 0, 18))
          )
        )
      );
    } catch (error) {
      console.error("Failed to update token balances:", error);
      setError("Failed to update token balances");
    }
  };

  useEffect(() => {
    // if (tokenId) {
    fetchNFTData();
    // }
  }, [contract, address]);

  return { nft, isOwner, isLoading, error, fetchNFTData };
}

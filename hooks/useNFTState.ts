import { useState, useEffect, useCallback } from "react";
import { useContract } from "./useContract";
import { NFTState } from "../types/contracts";

export function useNFTState(tokenId: string) {
  const { contract } = useContract();
  const [state, setState] = useState<NFTState>(NFTState.AUCTION);
  const [auctionEndTime, setAuctionEndTime] = useState<number>(0);
  const [displayPeriod, setDisplayPeriod] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNFTState = async () => {
      if (!contract || !tokenId) return;

      try {
        // const [currentState, endTime, period] = await Promise.all([
        //   contract.read.getState(tokenId),
        //   contract.read.getAuctionEndTime(tokenId),
        //   contract.read.getDisplayPeriod(tokenId),
        // ]);
        // if (isMounted) {
        //   setState(currentState);
        //   setAuctionEndTime(endTime.toNumber());
        //   setDisplayPeriod(period.toNumber());
        //   setLoading(false);
        // }
      } catch (err) {
        console.error("Failed to fetch NFT state:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNFTState();

    const intervalId = setInterval(fetchNFTState, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [contract, tokenId]);

  useEffect(() => {
    const updateTimeRemaining = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      if (state === NFTState.AUCTION) {
        setTimeRemaining(Math.max(0, auctionEndTime - currentTime));
      } else if (state === NFTState.DISPLAY) {
        const displayEnd = auctionEndTime + displayPeriod;
        setTimeRemaining(Math.max(0, displayEnd - currentTime));
      } else {
        setTimeRemaining(0);
      }
    };

    updateTimeRemaining();
    const timeInterval = setInterval(updateTimeRemaining, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [state, auctionEndTime, displayPeriod]);

  return {
    state,
    auctionEndTime,
    displayPeriod,
    timeRemaining,
    loading,
  };
}

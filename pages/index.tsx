import { useState, useEffect } from "react";
import { useCopyToClipboard } from "react-use";
import { useAccount } from "wagmi";
import { useNetwork } from "wagmi";
import dynamic from "next/dynamic";
import { useNFT } from "../hooks/useNFT";
import { LoadingSpinner } from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";

const NFTDisplay = dynamic(() => import("../components/NFTDisplay"), {
  ssr: false,
});

export default function Home() {
  const [, copyToClipboard] = useCopyToClipboard();
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { nft, isLoading, error, fetchNFTData } = useNFT();

  useEffect(() => {
    setMounted(true);
    fetchNFTData();
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="mt-40">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  console.log(nft);

  return (
    <div className="min-h-screen pt-20 bg-gray-100">
      <Navbar />
      <main className="pt-16 container mx-auto px-4 py-8">
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : nft ? (
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
            <NFTDisplay
              nft={nft}
              tokenId={nft.tokenId}
              className="w-full max-w-2xl mx-auto"
            />

            <div className="w-full mx-auto max-w-[600px] flex items-center py-2 px-3 rounded-md border bg-white">
              <input
                className="w-full h-full text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                readOnly
                value={nft.solanaAddress}
              />
              <div
                onClick={() => {
                  copyToClipboard(nft.solanaAddress);
                  alert("Copy Success");
                }}
              >
                <svg width="1em" height="1em" viewBox="0 0 13 13">
                  <path
                    d="M10.582 9.663V4.328c0-1.05-.852-1.902-1.902-1.902H1.903A1.901 1.901 0 000 4.328V11.1C0 12.149.851 13 1.903 13H8.68a1.901 1.901 0 001.903-1.9v-.526h.014v-.915c-.005 0-.008.003-.015.004zm-1.57-.29v.721c0 .015-.004.03-.004.045a1.336 1.336 0 01-1.334 1.292H2.908a1.337 1.337 0 01-1.337-1.337V5.332c0-.715.563-1.295 1.27-1.33.023-.002.045-.007.067-.007h4.766c.74 0 1.338.6 1.338 1.337v4.041zm3.973-2.137V1.901C12.985.851 12.133 0 11.083 0H4.306a1.901 1.901 0 00-1.903 1.901v.076h1.95a1.34 1.34 0 01.892-.402c.021-.001.043-.006.065-.006h4.766c.74 0 1.338.599 1.338 1.336v4.763c0 .014-.004.03-.004.045-.015.438-.24.823-.579 1.056v1.804h.252a1.901 1.901 0 001.902-1.9v-.526H13v-.915c-.005 0-.009.003-.015.004z"
                    fill="#000"
                    fillRule="nonzero"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">No NFT available</div>
        )}
      </main>
    </div>
  );
}

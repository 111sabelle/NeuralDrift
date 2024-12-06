import { useState, useEffect } from "react";
import { AppProps } from "next/app";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import wagmiConfig, { chains } from "../config/wagmi";
import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import ErrorBoundary from "../components/ErrorBoundary";

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} locale="en-US">
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </ErrorBoundary>
  );
}

export default MyApp;

import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import NeuralDriftContract from '../contracts/NeuralDrift.json';
import { config } from '../config';

export function useContract() {
    const [contract, setContract] = useState<Contract | null>(null);
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        let isMounted = true;

        async function initContract() {
            if (!publicClient || !config.contract.address) {
                console.log('Missing dependencies:', { 
                    publicClient: !!publicClient, 
                    contractAddress: config.contract.address 
                });
                return;
            }

            try {
                console.log('Creating contract with:', {
                    address: config.contract.address,
                    abiLength: NeuralDriftContract.abi.length
                });

                const contractInstance = getContract({
                    address: config.contract.address as `0x${string}`,
                    abi: NeuralDriftContract.abi,
                    publicClient,
                    walletClient: walletClient || undefined,
                });

                console.log('Contract instance created:', !!contractInstance);
                
                if (isMounted) {
                    setContract(contractInstance as unknown as Contract);
                }
            } catch (error) {
                console.error('Failed to create contract instance:', error);
                if (isMounted) {
                    setContract(null);
                }
            }
        }

        initContract();

        return () => {
            isMounted = false;
        };
    }, [publicClient, walletClient, address, isConnected]);

    return { contract };
}
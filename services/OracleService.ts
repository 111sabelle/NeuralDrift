import { ethers } from 'ethers';
import { getOracleSigner } from '../config/oracle';
import { contractConfig } from '../config/contracts';
import { NeuralDriftContract } from '../types/contracts';
import contractABI from '../contracts/NeuralDrift.json';

export class OracleService {
    private contract: NeuralDriftContract;
    private signer: ethers.Wallet;

    constructor() {
        this.signer = getOracleSigner();
        this.contract = new ethers.Contract(
            contractConfig.address,
            contractABI.abi,
            this.signer
        ) as NeuralDriftContract;
    }

    async updateTokenBalance(
        tokenId: string,
        symbol: string,
        amount: number | string,
        usdValue: number | string
    ) {
        try {
            const amountValue = ethers.utils.parseUnits(
                amount.toString(),
                18
            );
            const usdValue_ = ethers.utils.parseUnits(
                usdValue.toString(),
                18
            );

            const tx = await this.contract.updateTokenBalance(
                tokenId,
                symbol,
                amountValue,
                usdValue_
            );
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Oracle update failed:', error);
            throw error;
        }
    }
} 

import { ethers } from 'ethers';
import { NeuralDriftContract } from '../contracts/NeuralDrift';

export class AuctionMonitor {
    private contract: NeuralDriftContract;
    private provider: ethers.providers.Provider;
    private monitoring: Map<string, boolean> = new Map();
    
    constructor(contract: NeuralDriftContract, provider: ethers.providers.Provider) {
        this.contract = contract;
        this.provider = provider;
    }
    
    async startMonitoring(tokenId: string) {
        if (this.monitoring.get(tokenId)) return;
        this.monitoring.set(tokenId, true);

        const checkState = async () => {
            try {
                const [state, auctionEnd, displayPeriod] = await Promise.all([
                    this.contract.nftStates(tokenId),
                    this.contract.nftAuctionEndTimes(tokenId),
                    this.contract.nftDisplayPeriods(tokenId)
                ]);

                const now = Math.floor(Date.now() / 1000);
                const displayEnd = auctionEnd.toNumber() + displayPeriod.toNumber();

                if (state === 'AUCTION' && now >= auctionEnd.toNumber()) {
                    await this.contract.updateNFTState(tokenId);
                    this.emit('AuctionEnded', { tokenId });
                } else if (state === 'DISPLAY' && now >= displayEnd) {
                    const disposition = await this.contract.tokenDispositions(tokenId);
                    await this.contract.executeTokenDisposition(tokenId);
                    this.emit('DisplayEnded', { tokenId, disposition });
                }
            } catch (error) {
                console.error('State check failed:', error);
                this.emit('Error', { tokenId, error });
            }
        };

        // 每分钟检查一次状态
        const interval = setInterval(checkState, 60000);
        
        // 监听区块事件以实时更新
        this.provider.on('block', async () => {
            await checkState();
        });

        return () => {
            clearInterval(interval);
            this.provider.removeAllListeners('block');
            this.monitoring.delete(tokenId);
        };
    }

    private emit(event: string, data: any) {
        // 这里可以实现事件发射逻辑
    }
} 
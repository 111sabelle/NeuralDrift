import { getTokenBalances } from '../utils/solana';
import { Connection } from '@solana/web3.js';

jest.mock('@solana/web3.js');

describe('Solana Utils', () => {
    const mockAddress = '0x1a681eFdd22Ba67E80Ce23Eb8566A86Cf065CF4A';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch token balances correctly', async () => {
        const mockTokenAccounts = {
            value: [
                {
                    account: {
                        data: {
                            parsed: {
                                info: {
                                    mint: 'mock-mint-1',
                                    tokenAmount: {
                                        uiAmount: 100,
                                        decimals: 9
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        };

        (Connection as jest.Mock).mockImplementation(() => ({
            getParsedTokenAccountsByOwner: jest.fn().mockResolvedValue(mockTokenAccounts),
            getParsedAccountInfo: jest.fn().mockResolvedValue({
                value: {
                    data: {
                        parsed: {
                            info: {
                                symbol: 'TEST'
                            }
                        }
                    }
                }
            })
        }));

        const balances = await getTokenBalances(mockAddress);
        expect(balances).toHaveLength(1);
        expect(balances[0].amount).toBe(100);
    });

    it('should handle errors gracefully', async () => {
        (Connection as jest.Mock).mockImplementation(() => ({
            getParsedTokenAccountsByOwner: jest.fn().mockRejectedValue(new Error('Network error'))
        }));

        await expect(getTokenBalances(mockAddress)).rejects.toThrow('Network error');
    });
}); 
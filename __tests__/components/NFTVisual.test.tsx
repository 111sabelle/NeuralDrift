import { render, screen } from '@testing-library/react';
import { NFTVisual } from '../../components/NFTVisual';
import { TokenInfo } from '../../types';

jest.mock('p5', () => {
  return jest.fn().mockImplementation(() => ({
    remove: jest.fn(),
  }));
});

describe('NFTVisual', () => {
  const mockTokens: TokenInfo[] = [
    {
      symbol: 'SOL',
      address: '0x1',
      balance: 10,
      usdValue: 1000
    },
    {
      symbol: 'DOGE',
      address: '0x2',
      balance: 1000,
      usdValue: 500
    }
  ];

  it('renders canvas element', () => {
    render(
      <NFTVisual
        tokens={mockTokens}
        isDisplayPeriod={false}
        solanaAddress="test-address"
      />
    );
    
    expect(screen.getByTestId('nft-canvas')).toBeInTheDocument();
  });
}); 
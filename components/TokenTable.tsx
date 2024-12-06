// components/TokenTable.tsx
import React from 'react';
import { TokenInfo } from '../types';

interface TokenTableProps {
  tokens: TokenInfo[];
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (USD)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proportion</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Transactions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change(%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tokens.map((token, index) => (
            <tr key={token.symbol}>
              <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap">{token.symbol}</td>
              <td className="px-6 py-4 whitespace-nowrap">{token.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">${token.usdValue?.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap">{token.proportion}%</td>
              <td className="px-6 py-4 whitespace-nowrap">{token.transactions}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={token.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {token.change >= 0 ? '▲' : '▼'} {Math.abs(token.change)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
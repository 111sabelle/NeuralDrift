import { ethers } from 'ethers';

export const oracleConfig = {
    address: '0x270236baD484E3B2649Cd400aED537D83A44b4cB',
    privateKey: '0x392e579d74fdcfc4ebc4c180f9f04b96a62a7aed65caecb1a51aa3f589b4e800'
};

export const getOracleSigner = () => {
    if (!window.ethereum) {
        throw new Error('Ethereum provider is not available');
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    return new ethers.Wallet(oracleConfig.privateKey, provider);
}; 
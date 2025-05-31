import { useState, useCallback } from 'react';
import { verifyNFTOwnership, NFTData } from '../lib/nft';

interface UseNFTVerificationReturn {
  isLoading: boolean;
  nftData: NFTData | null;
  error: string | null;
  verifyNFT: (walletAddress: string, email?: string) => Promise<boolean>;
  reset: () => void;
}

export const useNFTVerification = (): UseNFTVerificationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyNFT = useCallback(async (walletAddress: string, email?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setNftData(null);

    try {
      console.log('Starting NFT verification for:', walletAddress);
      
      const result = await verifyNFTOwnership(walletAddress, email);
      
      if (result.error) {
        setError(result.error);
        return false;
      }
      
      if (result.hasNFT && result.nftData) {
        setNftData(result.nftData);
        console.log('NFT verification successful:', result.nftData);
        return true;
      } else {
        setError('対象NFTの保有が確認できませんでした');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      console.error('NFT verification error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setNftData(null);
    setError(null);
  }, []);

  return {
    isLoading,
    nftData,
    error,
    verifyNFT,
    reset
  };
};
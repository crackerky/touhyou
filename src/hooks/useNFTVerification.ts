import { useState, useCallback } from 'react';
import { verifyNFTOwnership, NFTData } from '../lib/nft';

interface UseNFTVerificationReturn {
  isVerifying: boolean;
  nftData: (NFTData & { verified: boolean }) | null;
  error: string | null;
  verifyNFT: (walletAddress: string, policyId: string) => Promise<boolean>;
  reset: () => void;
}

export const useNFTVerification = (): UseNFTVerificationReturn => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [nftData, setNftData] = useState<(NFTData & { verified: boolean }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyNFT = useCallback(async (walletAddress: string, policyId: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);
    setNftData(null);

    try {
      console.log('Starting NFT verification for:', walletAddress, 'with policy:', policyId);
      
      const result = await verifyNFTOwnership(walletAddress, policyId);
      
      if (result.error) {
        setError(result.error);
        setNftData({ ...result.nftData, verified: false } as NFTData & { verified: boolean });
        return false;
      }
      
      if (result.hasNFT && result.nftData) {
        setNftData({ ...result.nftData, verified: true });
        console.log('NFT verification successful:', result.nftData);
        return true;
      } else {
        setError('対象NFTの保有が確認できませんでした');
        setNftData({ 
          nftCount: 0, 
          verificationMethod: 'unknown', 
          policyId, 
          verified: false 
        } as NFTData & { verified: boolean });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      console.error('NFT verification error:', err);
      setNftData({ 
        nftCount: 0, 
        verificationMethod: 'unknown', 
        policyId, 
        verified: false 
      } as NFTData & { verified: boolean });
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsVerifying(false);
    setNftData(null);
    setError(null);
  }, []);

  return {
    isVerifying,
    nftData,
    error,
    verifyNFT,
    reset
  };
};
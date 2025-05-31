// NFT ownership verification utilities

// NFTデータの型定義
export interface NFTData {
  nftCount: number
  policyId: string
  assets?: NFTAsset[]
  verificationMethod?: 'blockfrost' | 'koios' | 'nmkr'
}

export interface NFTAsset {
  unit: string
  quantity: string
  policyId: string
  assetName?: string
  metadata?: any
}

// 環境変数から設定を取得
const BLOCKFROST_API_KEY = import.meta.env.VITE_BLOCKFROST_API_KEY
const TARGET_POLICY_ID = import.meta.env.VITE_TARGET_POLICY_ID
const NMKR_API_KEY = import.meta.env.VITE_NMKR_API_KEY

/**
 * Blockfrost APIを使用してNFT保有を確認
 */
export async function checkNFTOwnershipBlockfrost(walletAddress: string): Promise<NFTData | null> {
  if (!BLOCKFROST_API_KEY || !TARGET_POLICY_ID) {
    console.warn('Blockfrost API key or target policy ID not configured')
    return null
  }

  try {
    console.log('Checking NFT ownership via Blockfrost for:', walletAddress)
    
    // ウォレットのUTXOsを取得
    const response = await fetch(
      `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${walletAddress}/utxos`,
      {
        headers: {
          'project_id': BLOCKFROST_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('Blockfrost API error:', response.status, response.statusText)
      return null
    }

    const utxos = await response.json()
    
    // 対象のPolicy IDを持つNFTをカウント
    let nftCount = 0
    const matchingAssets: NFTAsset[] = []

    for (const utxo of utxos) {
      if (utxo.amount) {
        for (const amount of utxo.amount) {
          if (amount.unit && amount.unit.startsWith(TARGET_POLICY_ID)) {
            nftCount += parseInt(amount.quantity)
            matchingAssets.push({
              unit: amount.unit,
              quantity: amount.quantity,
              policyId: TARGET_POLICY_ID
            })
          }
        }
      }
    }

    console.log(`Found ${nftCount} NFTs with policy ID ${TARGET_POLICY_ID}`)

    return {
      nftCount,
      policyId: TARGET_POLICY_ID,
      assets: matchingAssets,
      verificationMethod: 'blockfrost'
    }
  } catch (error) {
    console.error('Blockfrost NFT check failed:', error)
    return null
  }
}

/**
 * Koios API（無料）を使用してNFT保有を確認
 */
export async function checkNFTOwnershipKoios(walletAddress: string): Promise<NFTData | null> {
  if (!TARGET_POLICY_ID) {
    console.warn('Target policy ID not configured')
    return null
  }

  try {
    console.log('Checking NFT ownership via Koios for:', walletAddress)
    
    const response = await fetch(
      `https://api.koios.rest/api/v1/address_assets?_address=${walletAddress}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('Koios API error:', response.status, response.statusText)
      return null
    }

    const assets = await response.json()
    
    // 対象のPolicy IDを持つNFTをカウント
    let nftCount = 0
    const matchingAssets: NFTAsset[] = []

    if (Array.isArray(assets)) {
      for (const asset of assets) {
        if (asset.policy_id === TARGET_POLICY_ID) {
          nftCount += parseInt(asset.quantity || '0')
          matchingAssets.push({
            unit: asset.asset_name ? `${asset.policy_id}${asset.asset_name}` : asset.policy_id,
            quantity: asset.quantity || '0',
            policyId: asset.policy_id,
            assetName: asset.asset_name
          })
        }
      }
    }

    console.log(`Found ${nftCount} NFTs with policy ID ${TARGET_POLICY_ID} via Koios`)

    return {
      nftCount,
      policyId: TARGET_POLICY_ID,
      assets: matchingAssets,
      verificationMethod: 'koios'
    }
  } catch (error) {
    console.error('Koios NFT check failed:', error)
    return null
  }
}

/**
 * NMKR APIを使用してNFT購入履歴を確認（メールベース）
 */
export async function checkNMKRPurchases(email: string): Promise<NFTData | null> {
  if (!NMKR_API_KEY || !TARGET_POLICY_ID) {
    console.warn('NMKR API key or target policy ID not configured')
    return null
  }

  try {
    console.log('Checking NMKR purchases for:', email)
    
    const response = await fetch(
      `https://api.nmkr.io/v2/GetCustomerByEmail/${email}`,
      {
        headers: {
          'Authorization': `Bearer ${NMKR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('NMKR API error:', response.status, response.statusText)
      return null
    }

    const customerData = await response.json()
    
    let nftCount = 0
    const matchingAssets: NFTAsset[] = []

    if (customerData.orders) {
      for (const order of customerData.orders) {
        if (order.nfts) {
          for (const nft of order.nfts) {
            if (nft.policyId === TARGET_POLICY_ID) {
              nftCount++
              matchingAssets.push({
                unit: `${nft.policyId}${nft.assetName || ''}`,
                quantity: '1',
                policyId: nft.policyId,
                assetName: nft.assetName
              })
            }
          }
        }
      }
    }

    console.log(`Found ${nftCount} NFTs in NMKR purchases`)

    return {
      nftCount,
      policyId: TARGET_POLICY_ID,
      assets: matchingAssets,
      verificationMethod: 'nmkr'
    }
  } catch (error) {
    console.error('NMKR purchase check failed:', error)
    return null
  }
}

/**
 * 複数のAPIを使用してNFT保有を確認（フォールバック機能付き）
 */
export async function checkNFTOwnership(walletAddress: string, email?: string): Promise<NFTData | null> {
  console.log('Starting comprehensive NFT ownership check...')
  
  // 1. Blockfrost APIを試行
  const blockfrostResult = await checkNFTOwnershipBlockfrost(walletAddress)
  if (blockfrostResult && blockfrostResult.nftCount > 0) {
    console.log('NFT ownership confirmed via Blockfrost')
    return blockfrostResult
  }

  // 2. Koios API（無料）を試行
  const koiosResult = await checkNFTOwnershipKoios(walletAddress)
  if (koiosResult && koiosResult.nftCount > 0) {
    console.log('NFT ownership confirmed via Koios')
    return koiosResult
  }

  // 3. メールが提供されている場合、NMKR APIを試行
  if (email) {
    const nmkrResult = await checkNMKRPurchases(email)
    if (nmkrResult && nmkrResult.nftCount > 0) {
      console.log('NFT ownership confirmed via NMKR')
      return nmkrResult
    }
  }

  console.log('No NFT ownership found via any method')
  return null
}

/**
 * デモ/開発用のNFT保有チェック
 */
export function checkDemoNFTOwnership(walletAddress: string): NFTData | null {
  // デモ用ウォレットアドレス（開発・テスト用）
  const demoWallets = [
    'addr1qyj3z7x7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7j7',
    'addr_test1qzd5x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2x2',
    // アドレスの一部が含まれているかをチェック
  ]

  // デモアドレスの場合はNFT保有とみなす
  for (const demoWallet of demoWallets) {
    if (walletAddress.includes('demo') || 
        walletAddress.includes('test') || 
        walletAddress === demoWallet) {
      return {
        nftCount: 1,
        policyId: TARGET_POLICY_ID || 'demo_policy_id',
        assets: [{
          unit: 'demo_nft_unit',
          quantity: '1',
          policyId: TARGET_POLICY_ID || 'demo_policy_id',
          assetName: 'DemoNFT'
        }],
        verificationMethod: 'koios'
      }
    }
  }

  return null
}

/**
 * メイン NFT 確認関数（開発環境の場合はデモ機能も含む）
 */
export async function verifyNFTOwnership(
  walletAddress: string, 
  email?: string
): Promise<{ hasNFT: boolean; nftData: NFTData | null; error?: string }> {
  try {
    // 開発環境では先にデモチェックを行う
    if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === 'true') {
      const demoResult = checkDemoNFTOwnership(walletAddress)
      if (demoResult) {
        console.log('Demo NFT ownership detected')
        return {
          hasNFT: true,
          nftData: demoResult
        }
      }
    }

    // 本格的なNFT確認を実行
    const nftData = await checkNFTOwnership(walletAddress, email)
    
    return {
      hasNFT: nftData !== null && nftData.nftCount > 0,
      nftData
    }
  } catch (error) {
    console.error('NFT verification failed:', error)
    return {
      hasNFT: false,
      nftData: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
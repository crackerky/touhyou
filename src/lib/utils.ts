import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Hexアドレスかどうかを判定
export function isHexAddress(address: string): boolean {
  return /^[0-9a-fA-F]{58,120}$/.test(address);
}

// Cardanoアドレスの検証（Hex形式とBech32形式の両方に対応）
export function isCardanoAddressFormatValid(address: string): boolean {
  if (!address) return false;
  
  // Hex形式のアドレス（ウォレットから直接取得される形式）
  if (isHexAddress(address)) {
    return true;
  }
  
  // Bech32形式のアドレス（人間が読める形式）
  // Shelleyメインネット、テストネット、Byron時代のアドレスを含む
  return /^addr1[a-zA-Z0-9]{58,98}$/.test(address) || 
         /^addr_test1[a-zA-Z0-9]{58,98}$/.test(address) ||
         /^Ae2[a-zA-Z0-9]{56,58}$/.test(address) ||
         /^DdzFF[a-zA-Z0-9]{90,110}$/.test(address);
}

// HexアドレスをBech32に変換（簡易版）
export async function hexToBech32Address(hexAddress: string): Promise<string> {
  try {
    // Cardano Serialization Libraryを使用してHexをBech32に変換
    const cardanoWasm = await import('@emurgo/cardano-serialization-lib-browser');
    
    // Hexアドレスを解析
    const addressBytes = Buffer.from(hexAddress, 'hex');
    const address = cardanoWasm.Address.from_bytes(addressBytes);
    
    // Bech32形式に変換
    return address.to_bech32();
  } catch (error) {
    console.warn('Hex to Bech32 conversion failed, using hex address:', error);
    // 変換に失敗した場合はHexアドレスをそのまま返す
    return hexAddress;
  }
}

// アドレスを正規化（HexとBech32の両方に対応）
export async function normalizeCardanoAddress(address: string): Promise<string> {
  if (!address) return '';
  
  // 既にBech32形式の場合はそのまま返す
  if (address.startsWith('addr1') || address.startsWith('addr_test1') || 
      address.startsWith('Ae2') || address.startsWith('DdzFF')) {
    return address;
  }
  
  // Hex形式の場合はBech32に変換を試行
  if (isHexAddress(address)) {
    return await hexToBech32Address(address);
  }
  
  // その他の場合はそのまま返す
  return address;
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ウォレットの種類を検出する改善版関数
export function detectWalletType(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Cardanoウォレットを検出
  if (window.cardano) {
    // よく知られているCardanoウォレットの検出
    const knownWallets: Record<string, string> = {
      'ccvault': 'Tokeo',
      'nami': 'Nami',
      'eternl': 'Eternl',
      'flint': 'Flint',
      'typhon': 'Typhon',
      'yoroi': 'Yoroi',
      'gerowallet': 'GeroWallet',
      'nufi': 'NuFi',
      'begin': 'Begin',
      'lace': 'Lace',
      'vespr': 'Vespr',
      'gero': 'Gero'
    };
    
    // 既知のウォレットをチェック
    for (const [key, name] of Object.entries(knownWallets)) {
      if (window.cardano[key]) {
        return name;
      }
    }
    
    // 未知のCardanoウォレットを検索
    const walletKeys = Object.keys(window.cardano).filter(key => 
      typeof window.cardano[key] === 'object' && 
      window.cardano[key] !== null
    );
    
    if (walletKeys.length > 0) {
      // 最初に見つかったCardanoウォレットの名前を推測
      const firstWallet = walletKeys[0];
      // ウォレット名をキャメルケースからタイトルケースに変換
      return firstWallet.charAt(0).toUpperCase() + firstWallet.slice(1);
    }
    
    return 'Unknown Cardano Wallet';
  }
  
  return null;
}
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Cardanoアドレスの検証（bech32形式）
export function isValidCardanoAddress(address: string): boolean {
  // より広範なCardanoアドレスパターンをサポート
  // Shelleyメインネット、テストネット、Byron時代のアドレスを含む
  return /^addr1[a-zA-Z0-9]{58,98}$/.test(address) || 
         /^addr_test1[a-zA-Z0-9]{58,98}$/.test(address) ||
         /^Ae2[a-zA-Z0-9]{56,58}$/.test(address) ||
         /^DdzFF[a-zA-Z0-9]{90,110}$/.test(address);
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
      'tokeo': 'Tokeo',
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
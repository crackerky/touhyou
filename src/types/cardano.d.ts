// Cardano Wallet API型定義

interface CardanoWalletAPI {
  apiVersion: string;
  name: string;
  icon: string;
  enable(): Promise<CardanoAPI>;
  isEnabled(): Promise<boolean>;
}

interface CardanoAPI {
  getNetworkId(): Promise<number>;
  getUtxos(): Promise<string[]>;
  getBalance(): Promise<string>;
  getUsedAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getChangeAddress(): Promise<string>;
  getRewardAddresses(): Promise<string[]>;
  signTx(tx: string, partialSign?: boolean): Promise<string>;
  signData(address: string, payload: string): Promise<{ signature: string; key: string }>;
  submitTx(tx: string): Promise<string>;
}

interface Window {
  cardano?: {
    nami?: CardanoWalletAPI;
    eternl?: CardanoWalletAPI;
    flint?: CardanoWalletAPI;
    typhon?: CardanoWalletAPI;
    gerowallet?: CardanoWalletAPI;
    yoroi?: CardanoWalletAPI;
    ccvault?: CardanoWalletAPI;
  };
}

declare global {
  interface Window {
    cardano?: {
      nami?: CardanoWalletAPI;
      eternl?: CardanoWalletAPI;
      flint?: CardanoWalletAPI;
      typhon?: CardanoWalletAPI;
      gerowallet?: CardanoWalletAPI;
      yoroi?: CardanoWalletAPI;
      ccvault?: CardanoWalletAPI;
    };
  }
}
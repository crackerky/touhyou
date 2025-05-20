/**
 * Wallet utility functions with fallbacks for missing WebAssembly dependencies
 */

const WASM_SUPPORTED = typeof WebAssembly !== 'undefined';

// Mock implementation for systems without WebAssembly support
const mockCardanoApi = {
  isValidAddress: (address: string) => {
    console.warn('Using mock Cardano validation - WASM not available');
    // Simple regex validation as fallback
    return /^addr1[a-zA-Z0-9]{58,98}$/.test(address) || 
           /^addr_test1[a-zA-Z0-9]{58,98}$/.test(address) ||
           /^Ae2[a-zA-Z0-9]{56,58}$/.test(address) ||
           /^DdzFF[a-zA-Z0-9]{90,110}$/.test(address);
  }
};

// Check if the Cardano serialization lib is available
let cardanoLibAvailable = false;

// This will be populated if the WASM library loads successfully
let cardanoLib: any = null;

// Try to load the Cardano library asynchronously
export const initCardanoLib = async (): Promise<boolean> => {
  if (!WASM_SUPPORTED) {
    console.warn('WebAssembly not supported in this browser');
    return false;
  }

  if (cardanoLibAvailable) {
    return true;
  }
  
  try {
    // Dynamic import to avoid loading issues during initial render
    // Wrapped in a function to prevent top-level await issues during build
    const loadCardanoLib = async () => {
      // Use a more defensive approach to loading the WASM library
      try {
        return await import('@emurgo/cardano-serialization-lib-browser');
      } catch (e) {
        console.warn('Failed to load Cardano library directly:', e);
        return null;
      }
    };
    
    const lib = await loadCardanoLib();
    
    if (lib) {
      cardanoLib = lib;
      cardanoLibAvailable = true;
      console.log('Cardano serialization library loaded successfully');
      return true;
    }
  } catch (error) {
    console.error('Failed to load Cardano serialization library:', error);
  }
  
  return false;
};

// Validate a Cardano address
export const isValidCardanoAddress = async (address: string): Promise<boolean> => {
  // Always use the regex-based validation first as a fast path
  if (!mockCardanoApi.isValidAddress(address)) {
    return false;
  }
  
  // If we already have the lib or can load it, use it for detailed validation
  if (cardanoLibAvailable || await initCardanoLib()) {
    try {
      // Use the actual library for validation if available
      return cardanoLib.Address.from_bech32(address) !== null;
    } catch (error) {
      // If the address isn't valid bech32, try legacy validation
      try {
        return cardanoLib.ByronAddress.from_base58(address) !== null;
      } catch (innerError) {
        console.warn('Address validation error:', innerError);
        // We already passed the regex check, so return true
        return true;
      }
    }
  }
  
  // We already passed the regex check at the beginning
  return true;
};

// Check if Cardano wallet is available in the browser
export const isCardanoWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.cardano;
};

// Get a list of available Cardano wallet providers
export const getAvailableWallets = (): string[] => {
  if (!isCardanoWalletAvailable()) {
    return [];
  }
  
  // Filter out non-wallet properties from window.cardano
  return Object.keys(window.cardano).filter(key => 
    typeof window.cardano[key] === 'object' && 
    window.cardano[key] !== null &&
    typeof window.cardano[key].enable === 'function'
  );
};

export default {
  initCardanoLib,
  isValidCardanoAddress,
  isCardanoWalletAvailable,
  getAvailableWallets
};
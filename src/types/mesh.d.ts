// Cardanoウォレットの型定義
declare global {
  interface Window {
    cardano?: {
      [key: string]: any;
      nami?: any;
      eternl?: any;
      flint?: any;
      typhon?: any;
      yoroi?: any;
      gerowallet?: any;
      nufi?: any;
      begin?: any;
      lace?: any;
      vespr?: any;
      gero?: any;
      tokeo?: any;
    };
  }
}

export {};
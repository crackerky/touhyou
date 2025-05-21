// Initialize global object and process
window.global = window.global || window;
window.process = window.process || {
  env: {},
  nextTick: (fn) => setTimeout(fn, 0),
  browser: true,
  version: '',
  platform: 'browser'
};

// Ensure globalThis is available
window.globalThis = window.globalThis || window;

// Debug polyfill initialization
console.log('Initializing polyfills...');
console.log('Buffer available:', typeof window.Buffer !== 'undefined');
console.log('Process available:', typeof window.process !== 'undefined');

// Ensure proper inheritance for EventEmitter (used by streams)
if (typeof window.Object.setPrototypeOf !== 'function') {
  window.Object.setPrototypeOf = function(obj, proto) {
    if (obj.__proto__) {
      obj.__proto__ = proto;
      return obj;
    }
    
    if (Object.create) {
      return Object.create(proto);
    }
    
    throw new Error('Cannot set prototype');
  };
}

// Polyfill for TextEncoder if needed
if (typeof window.TextEncoder === 'undefined') {
  try {
    window.TextEncoder = TextEncoder;
    console.log('TextEncoder polyfill loaded');
  } catch (e) {
    console.warn('TextEncoder polyfill failed:', e);
  }
}

// Check for Cardano API
window.addEventListener('DOMContentLoaded', () => {
  console.log('Checking Cardano API availability:', typeof window.cardano !== 'undefined');
  if (window.cardano) {
    console.log('Available wallets:', Object.keys(window.cardano));
  }
});
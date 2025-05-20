// This file sets up polyfills needed for Node.js compatibility in the browser

// Global object polyfills
window.global = window;
globalThis.global = globalThis;

// Make sure global objects are properly defined
window.globalThis = window.globalThis || window;
window.process = window.process || { env: {} };

// Ensure Buffer is globally available
if (typeof window.Buffer === 'undefined' && typeof global.Buffer !== 'undefined') {
  window.Buffer = global.Buffer;
}

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
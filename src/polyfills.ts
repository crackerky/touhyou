// Set up global object before any other polyfills
window.global = window;
globalThis.global = globalThis;

// This file sets up polyfills needed for Node.js compatibility in the browser
// No need to import Buffer directly as it's provided by vite-plugin-node-polyfills

// Make sure global objects are properly defined
window.globalThis = window.globalThis || window;
window.process = window.process || { env: {} };

// Buffer is made available globally by vite-plugin-node-polyfills
// Just make sure it's accessible if needed
if (!window.Buffer) {
  console.warn('Buffer is not available globally, some features might not work');
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
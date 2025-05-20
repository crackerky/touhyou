// This file sets up polyfills needed for Node.js compatibility in the browser
import { Buffer } from 'buffer';

// Make sure global objects are properly defined
window.global = window;
window.process = window.process || { env: {} };

// Make Buffer available globally
window.Buffer = window.Buffer || Buffer;

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
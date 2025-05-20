// Set up global object before any other polyfills
window.global = window;
window.globalThis = window.globalThis || window;
window.process = window.process || { env: {} };

// After global is defined, import other dependencies
import { Buffer } from 'buffer';

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
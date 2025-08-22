import React from 'react';
import ReactDOM from 'react-dom';
import { EmailAuth } from './EmailAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* 背景 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        style={{ zIndex: 50000 }}
        onClick={onClose}
      />
      
      {/* モーダル本体 */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 50001, pointerEvents: 'none' }}
      >
        <div 
          className="relative max-w-md w-full"
          style={{ pointerEvents: 'auto' }}
        >
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 z-10"
          >
            ✕
          </button>
          <EmailAuth onSuccess={onSuccess} />
        </div>
      </div>
    </>,
    document.body
  );
}
import React, { useState } from 'react';

export function TestInput() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'white',
      zIndex: 99999,
      padding: '50px'
    }}>
      <h1>入力テスト</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>メール:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            console.log('Email changed:', e.target.value);
            setEmail(e.target.value);
          }}
          onFocus={() => console.log('Email focused')}
          onClick={() => console.log('Email clicked')}
          style={{ 
            width: '300px', 
            padding: '10px', 
            border: '1px solid black',
            display: 'block',
            marginTop: '5px'
          }}
        />
        <p>Current email: {email}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>パスワード:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            console.log('Password changed:', e.target.value);
            setPassword(e.target.value);
          }}
          onFocus={() => console.log('Password focused')}
          onClick={() => console.log('Password clicked')}
          style={{ 
            width: '300px', 
            padding: '10px', 
            border: '1px solid black',
            display: 'block',
            marginTop: '5px'
          }}
        />
        <p>Current password: {password}</p>
      </div>

      <button 
        onClick={() => console.log('Submit:', { email, password })}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'blue', 
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Submit
      </button>
    </div>
  );
}
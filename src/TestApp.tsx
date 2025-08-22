import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>テストアプリ</h1>
      <p>これが表示されれば基本的なReactは動いています。</p>
      <button onClick={() => alert('クリックされました！')}>
        テストボタン
      </button>
    </div>
  );
}

export default TestApp;
import React from 'react';

export default function TestScreen() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ff6b9d',
      color: 'white',
      fontSize: '48px',
      fontWeight: 'bold',
      textAlign: 'center',
      flexDirection: 'column'
    }}>
      <h1>✅ REACT ESTÁ FUNCIONANDO!</h1>
      <p style={{ fontSize: '24px', marginTop: '20px' }}>Se você vê isso, o problema não é o React</p>
      <p style={{ fontSize: '18px', marginTop: '20px', color: '#ffe' }}>O problema está em outro lugar</p>
    </div>
  );
}

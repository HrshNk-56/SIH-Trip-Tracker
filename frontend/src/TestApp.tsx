import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'green' }}>✅ React App is Working!</h1>
      <p>If you can see this, React is loading correctly.</p>
      <button onClick={() => console.log('Button clicked!')}>
        Test Console Log
      </button>
    </div>
  );
};

export default TestApp;
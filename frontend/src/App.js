// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';

function App() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      setAccount(storedAccount);
    }
  }, []);

  const handleLoginSuccess = (userAccount) => {
    setAccount(userAccount);
  };

  const handleLogout = () => {
    setAccount(null);
    localStorage.removeItem('token');
    localStorage.removeItem('account');
  };

  if (!account) {
    // User is not logged in, show the Login page
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header>
        <h1>RepuChain - Decentralized Credential System</h1>
        <p>Connected account: {account}</p>
        <button onClick={handleLogout}>Logout</button>
      </header>
      {/* Include other components or routes for your app here */}
    </div>
  );
}

export default App;
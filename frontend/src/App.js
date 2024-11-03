import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import { connectMetaMask, authenticate } from './authen';

function App() {
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      window.ethereum.enable().then(accounts => {
        setAccount(accounts[0]);
      });
    } else {
      alert('MetaMask not detected');
    }
  }, []);

  const handleLogin = async () => {
    try {
      const userAccount = await connectMetaMask();
      setAccount(userAccount);

      const jwtToken = await authenticate(userAccount);
      setToken(jwtToken);

      if (jwtToken) {
        localStorage.setItem('token', jwtToken); // Store token for future use
        alert('Login successful!');
      } else {
        alert('Login failed.');
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert(error.message);
    }
  };


  return (
    <div className="App">
      <header>
        <h1>RepuChain - Decentralized Credential System</h1>
        {account ? (
          <p>Connected account: {account}</p>
        ) : (
          <button onClick={handleLogin}>Connect with MetaMask</button>
        )}
      </header>
    </div>
  );
}

export default App;

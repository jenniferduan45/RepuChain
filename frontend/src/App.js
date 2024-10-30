import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);

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

  return (
    <div className="App">
      <header>
        <h1>RepuChain - Decentralized Credential System</h1>
        {account ? <p>Connected account: {account}</p> : <button>Connect with MetaMask</button>}
      </header>
    </div>
  );
}

export default App;

// authen.js
import Web3 from 'web3';

// function to connect metamask
export async function connectMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  } else {
    throw new Error('MetaMask not detected, add it as your browser extension.');
  }
}

export async function authenticate(address) {
  const message = `Sign in with address ${address}`;
  const web3 = new Web3(window.ethereum);
  const signature = await web3.eth.personal.sign(message, address);

  const response = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, signature })
  });

  const data = await response.json();
  return data.token;
}

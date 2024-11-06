// src/authen.js

export async function connectMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access if needed
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      throw new Error('User denied account access.');
    }
  } else {
    throw new Error('MetaMask not detected. Please install MetaMask and try again.');
  }
}

export async function authenticate(address) {
  const message = `Sign in with address ${address}`;
  try {
    // Request signature from MetaMask
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });

    // Send signature to backend for verification
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature }),
    });

    // Check if response is OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Authentication failed on the server.');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error during authentication:', error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}
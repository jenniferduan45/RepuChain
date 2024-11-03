export async function login() {
    if (typeof window.ethereum !== 'undefined') {
      const [address] = await ethereum.request({ method: 'eth_requestAccounts' });
  
      const message = `Sign in with address ${address}`;
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
  
      // Send to backend
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature })
      });
  
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Login successful!');
      } else {
        alert('Login failed.');
      }
    } else {
      alert('MetaMask is not installed.');
    }
  }

 export async function registerInstitution(institutionAddress) {
    const token = localStorage.getItem('token');
  
    const response = await fetch('/institutions/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ institutionAddress })
    });
  
    const data = await response.json();
    if (data.message) {
      alert(data.message);
    } else {
      alert('Failed to register institution.');
    }
  }
  
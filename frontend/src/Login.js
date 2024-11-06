// src/Login.js
import React from 'react';
import { connectMetaMask, authenticate } from './authen';
import './Login.css'; // Import the CSS file for styling

function Login({ onLoginSuccess }) {
  const handleLogin = async () => {
    try {
      const userAccount = await connectMetaMask();
      const jwtToken = await authenticate(userAccount);

      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('account', userAccount);
        onLoginSuccess(userAccount);
      } else {
        alert('Login failed.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">RepuChain</div>
      </nav>

      {/* Login Card */}
      <div className="login-card">
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Use your Ethereum account</p>
        <button onClick={handleLogin} className="login-button">
          Connect with MetaMask
        </button>
      </div>
    </div>
  );
}

export default Login;
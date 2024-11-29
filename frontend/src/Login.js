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
        <div className="navbar-links">
          <a href="#features">Features</a>
          <a href="#contact">Contact Us</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <h1>Welcome to RepuChain</h1>
        <p>Blockchain-Verified Credentials You Can Trust</p>
        <button onClick={handleLogin} className="hero-login-button">
          Connect with MetaMask
        </button>
      </header>

      {/* Image Section */}
      <section className="image-section">
        <div className="image-wrapper">
          <img src="https://media.licdn.com/dms/image/v2/D5612AQFAEglCaIxCqQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1685615266046?e=1738195200&v=beta&t=bNfXtIFMUtffd1I65uynodEZiMPFe27Tqf6SaEM6QnE" alt="Blockchain Illustration" className="hero-to-features-image" />
          <p className="image-caption">The future of trusted credentials starts with blockchain.</p>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Secure Credentials</h3>
            <p>All credentials are securely stored on the blockchain, ensuring authenticity.</p>
          </div>
          <div className="feature-item">
            <h3>Easy Verification</h3>
            <p>Credentials can be verified instantly by institutions and employers.</p>
          </div>
          <div className="feature-item">
            <h3>Decentralized Platform</h3>
            <p>Built on Ethereum, ensuring transparency and reliability.</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 RepuChain. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Login;

// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Profile from './Profile';
import IssueCredential from './components/IssueCredential';
import CredentialsList from './components/CredentialsList';
import ViewCredential from './components/ViewCredential';
import ViewAllCredentials from './components/ViewAllCredentials'; // Import the new component
import VerifyCredential from './components/VerifyCredential';

function App() {
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      setAccount(storedAccount);
    }
  }, []);

  const handleLoginSuccess = (userAccount) => {
    setAccount(userAccount);
    localStorage.setItem('account', userAccount); // Ensure account is stored
  };

  const handleLogout = () => {
    setAccount(null);
    localStorage.removeItem('token');
    localStorage.removeItem('account');
    window.location.href = '/'; // Redirect to login page
  };

  const navigateToIssueCredential = () => {
    navigate('/issue-credential');
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  const navigateToVerify = () => {
    navigate('/verify');
  };

  const navigateToCredentials = () => {
    navigate('/credentials');
  };

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          RepuChain
          {account && <button onClick={handleLogout} className="logout-button">Logout</button>}
        </div>
      </nav>

      {/* Main Content */}
      <Routes>
        <Route
          path="/"
          element={
            !account ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <div className="home-container">
                <div className="title">
                  <h1>Welcome to RepuChain</h1>
                  <p>Blockchain Verified Credentials You Can Trust</p>
                </div>
                <button onClick={navigateToIssueCredential} className="home-button">
                  Issue Credential
                </button>
                <button onClick={navigateToCredentials} className="home-button">
                  View My Credentials
                </button>
                <button onClick={navigateToProfile} className="home-button">
                  My Profile
                </button>
                <button onClick={navigateToVerify} className="home-button">
                  Verify Credentials
                </button>
              </div>
            )
          }
        />
        <Route
          path="/profile"
          element={
            account ? (
              <Profile handleLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/issue-credential"
          element={
            account ? (
              <IssueCredential account={account} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/credentials"
          element={
            account ? (
              <CredentialsList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/share/credential/:credentialId"
          element={<ViewCredential />}
        />
        <Route
          path="/share/all/:address"
          element={<ViewAllCredentials />}
        />
        <Route
          path="/verify"
          element={<VerifyCredential />}
        />
      </Routes>
    </div>
  );
}

export default App;

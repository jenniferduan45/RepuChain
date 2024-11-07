// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Profile from './Profile';
import IssueCredential from './components/IssueCredential';

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
              <div className="profile-container">
                <div className="title">
                  <h2>Welcome to RepuChain</h2>
                  <h3>Blockchain Verified Credentials You Can Trust</h3>
                </div>
                <div classname="button-group">
                  <button onClick={navigateToIssueCredential} className="edit-button">
                    Issue Credential
                  </button>
                  <button onClick={navigateToProfile} className="edit-button">
                    My Profile
                  </button>
                </div>
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
      </Routes>
    </div>
  );
}

export default App;

// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Profile from './Profile'; // Import the Profile component
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import IssueCredential from './components/IssueCredential';

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
    localStorage.setItem('account', userAccount); // Ensure account is stored
  };

  const handleLogout = () => {
    setAccount(null);
    localStorage.removeItem('token');
    localStorage.removeItem('account');
    window.location.href = '/'; // Redirect to login page
  };

  return (
    <Router>
      <div className="App">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-brand">
            RepuChain - Decentralized Credential System
          </div>
          {/* Removed the connected account display */}
        </nav>

        {/* Main Content */}
        <Switch>
          <Route exact path="/">
            {!account ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Redirect to="/profile" />
            )}
          </Route>
          <Route path="/profile">
            {!account ? (
              <Redirect to="/" />
            ) : (
              <Profile handleLogout={handleLogout} /> 
            )}
          </Route>
          {/* Add other routes here */}
          <Route path="/issue-credential">
            <IssueCredential account={account} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;

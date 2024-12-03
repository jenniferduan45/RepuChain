import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
const VerifyCredential = () => {
  const [credentialId, setCredentialId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [issuer, setIssuer] = useState("");
  const [log, setLog] = useState("");
  const navigate = useNavigate();
  const handleBackToHome = () => {
    navigate('/');
  };
  const handleVerify = async () => {
    // Clear the log
    setLog("");

    // Validate inputs
    if (!credentialId || !userAddress) {
      setLog("Error: Please provide both Credential ID and User Address.");
      return;
    }

    try {
      // Display loading message
      setLog("Verifying...");

      // Send the request to the backend
      const response = await fetch("http://localhost:3001/verify-credential", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credentialId, userAddress, issuer }),
      });

      const data = await response.json();

      // Display the result
      if (response.ok) {
        setLog(`Success: ${data.message}`);
      } else {
        setLog(`Error: ${data.message}`);
      }
    } catch (error) {
      setLog(`Error: ${error.message}`);
    }
  };

  return (
    <div className="profile-container">
      <h2>Verify Credential</h2>
      <form onSubmit={(e) => e.preventDefault()} className="profile-edit-form">
        <div className="form-group">
          <label>Credential ID:</label>
          <input
            type="text"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>User Wallet Address:</label>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Issuer Address:</label>
          <input
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
          />
        </div>
        <div className="button-group">
          
          <button onClick={handleVerify} className="save-button">
            Verify Credential
          </button>
          <button onClick={handleBackToHome} className="cancel-button">Back To Home</button>
        </div>
      </form>
      <div
        id="log"
        className="log-container"
      >
        {log}
      </div>
    </div>
  );
};

export default VerifyCredential;

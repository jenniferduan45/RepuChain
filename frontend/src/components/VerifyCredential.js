import React, { useState } from "react";

const VerifyCredential = () => {
  const [credentialId, setCredentialId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [issuer, setIssuer] = useState("");
  const [log, setLog] = useState("");

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
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Verify Credential</h1>
      <input
        type="text"
        placeholder="Enter Credential ID"
        value={credentialId}
        onChange={(e) => setCredentialId(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px", width: "300px", display: "block" }}
      />
      <input
        type="text"
        placeholder="Enter User Address"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px", width: "300px", display: "block" }}
      />
      <input
        type="text"
        placeholder="Enter Issuer Address"
        value={userAddress}
        onChange={(e) => setIssuer(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px", width: "300px", display: "block" }}
      />
      <button
        onClick={handleVerify}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Verify
      </button>
      <div
        id="log"
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          height: "150px",
          overflowY: "scroll",
          fontSize: "14px",
        }}
      >
        {log}
      </div>
    </div>
  );
};

export default VerifyCredential;

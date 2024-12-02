import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ViewCredential() {
  const { credentialId } = useParams();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Fetch credential details
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/share/credential/${credentialId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Credential not found');
        }
        return response.json();
      })
      .then((data) => {
        setCredential(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching credential:', error);
        setLoading(false);
      });
  }, [credentialId]);

  // Verify transaction function
  async function verifyTransaction(txHash) {
    setVerifying(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txHash }),
      });

      const data = await response.json();
      setVerificationResult(data.success ? "Valid Transaction" : "Invalid Transaction");
    } catch (error) {
      console.error("Error verifying transaction:", error);
      setVerificationResult("Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!credential) {
    return <div>Credential not found.</div>;
  }

  return (
    <div className="profile-container">
      <h2>Credential Details</h2>
      <div className="credentials-list">
        <div className="credential">
          <p><strong>Owner:</strong> {credential.owner}</p>
          <p><strong>Issuer:</strong> {credential.issuer}</p>
          <p><strong>Type:</strong> {credential.credentialType}</p>
          <p><strong>Description:</strong> {credential.description}</p>
          <p><strong>Date Issued:</strong> {credential.issueDate}</p>
        </div>
      </div>
    </div>
  );
}

export default ViewCredential;

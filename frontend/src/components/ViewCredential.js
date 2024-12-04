import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ViewCredential() {
  const { credentialId } = useParams();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);


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
          <p><strong>Type:</strong> {credential.credentialType}</p>
          <p><strong>Description:</strong> {credential.description}</p>
          <p><strong>Credential ID:</strong> {credentialId}</p>
          <p><strong>Owner:</strong> {credential.owner}</p>
          <p><strong>Issuer:</strong> {credential.issuer}</p>
          <p><strong>Date Issued:</strong> {credential.issueDate}</p>
        </div>
      </div>
    </div>
  );
}

export default ViewCredential;

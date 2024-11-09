import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ViewCredential() {
  const { credentialId } = useParams();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the credential details using the shared link
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
    <div className="credential-view">
      <h2>Credential Details</h2>
      <p><strong>Owner:</strong> {credential.owner}</p>
      <p><strong>Issuer:</strong> {credential.issuer}</p>
      <p><strong>Type:</strong> {credential.credentialType}</p>
      <p><strong>Description:</strong> {credential.description}</p>
      <p><strong>Date Issued:</strong> {credential.issueDate}</p>
    </div>
  );
}

export default ViewCredential;

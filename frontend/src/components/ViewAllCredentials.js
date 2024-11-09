// src/components/ViewAllCredentials.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ViewAllCredentials() {
  const { address } = useParams();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all the credentials using the shared link
    fetch(`${process.env.REACT_APP_API_URL}/share/all/${address}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Credentials not found');
        }
        return response.json();
      })
      .then((data) => {
        setCredentials(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching credentials:', error);
        setLoading(false);
      });
  }, [address]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (credentials.length === 0) {
    return <div>No credentials found.</div>;
  }

  return (
    <div className="credentials-view">
      <h2>Shared Credentials</h2>
      {credentials.map((credential, index) => (
        <div key={index} className="credential">
          <p><strong>Owner:</strong> {credential.owner}</p>
          <p><strong>Issuer:</strong> {credential.issuer}</p>
          <p><strong>Type:</strong> {credential.credentialType}</p>
          <p><strong>Description:</strong> {credential.description}</p>
          <p><strong>Date Issued:</strong> {credential.issueDate}</p>
        </div>
      ))}
    </div>
  );
}

export default ViewAllCredentials;

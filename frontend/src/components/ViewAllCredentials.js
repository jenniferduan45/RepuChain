import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ViewAllCredentials() {
  const { address } = useParams();
  const [credentials, setCredentials] = useState({ received: [], issued: [] });
  const [filteredCredentials, setFilteredCredentials] = useState([]);
  const [filter, setFilter] = useState('all'); // default to viewing all
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the credential details for the provided address
    fetch(`${process.env.REACT_APP_API_URL}/share/all/${address}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Credentials not found');
        }
        return response.json();
      })
      .then((data) => {
        setCredentials(data);
        setFilteredCredentials([...data.received, ...data.issued]); // Initially set to all credentials
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching credentials:', error);
        setLoading(false);
      });
  }, [address]);

  useEffect(() => {
    // Filter credentials based on the selected filter type
    switch (filter) {
      case 'all':
        setFilteredCredentials([...credentials.received, ...credentials.issued]);
        break;
      case 'received':
        setFilteredCredentials(credentials.received);
        break;
      case 'issued':
        setFilteredCredentials(credentials.issued);
        break;
      default:
        setFilteredCredentials([...credentials.received, ...credentials.issued]);
    }
  }, [filter, credentials]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!credentials.received.length && !credentials.issued.length) {
    return <div>No credentials found.</div>;
  }

  return (
    <div className="credentials-view-all">
      <h2>All Credentials</h2>

      {/* Filter Options */}
      <div className="filter-options">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
          View All
        </button>
        <button onClick={() => setFilter('received')} className={filter === 'received' ? 'active' : ''}>
          View Received
        </button>
        <button onClick={() => setFilter('issued')} className={filter === 'issued' ? 'active' : ''}>
          View Issued
        </button>
      </div>

      {/* Display Credentials */}
      <div className="credentials-list">
        {filteredCredentials.map((credential, index) => (
          <div key={index} className="credential">
            <p><strong>Type:</strong> {credential.credentialType}</p>
            <p><strong>Description:</strong> {credential.description}</p>
            <p><strong>Owner:</strong> {credential.owner}</p>
            <p><strong>Issuer:</strong> {credential.issuer}</p>
            <p><strong>Date Issued:</strong> {credential.issueDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewAllCredentials;

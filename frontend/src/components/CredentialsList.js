import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

function CredentialsList() {
  const [credentials, setCredentials] = useState([]);
  const [qrCodeData, setQrCodeData] = useState({});
  const [shareLinks, setShareLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // State for filtering credentials (all, received, issued)
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch credentials for the logged-in user
    fetch(`${process.env.REACT_APP_API_URL}/credentials`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCredentials(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching credentials:', error);
        setLoading(false);
      });
  }, [token]);

  const handleBackToHome = () => {
    navigate('/');
  };

  // Generate QR Code for an individual credential
  const handleGenerateQrCode = async (credentialId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/credentials/${credentialId}/share`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!data.shareLink) {
        throw new Error('Share link not received from server');
      }

      // Save the share link in state
      setShareLinks((prev) => ({ ...prev, [credentialId]: data.shareLink }));
      setQrCodeData((prev) => ({ ...prev, [credentialId]: data.shareLink })); // Use shareLink for QR code
    } catch (error) {
      console.error('Error generating share link:', error);
    }
  };

  // Generate QR Code for all credentials
  const handleGenerateAllQrCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/credentials/shareAll`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!data.shareLink) {
        throw new Error('Share link not received from server');
      }

      // Save the share link in state
      setShareLinks((prev) => ({ ...prev, all: data.shareLink }));
      setQrCodeData((prev) => ({ ...prev, all: data.shareLink })); // Use shareLink for QR code
    } catch (error) {
      console.error('Error generating share link for all credentials:', error);
    }
  };

  // Filter credentials based on the selected filter
  const filteredCredentials = () => {
    if (filter === 'received') {
      return credentials.received || [];
    }
    if (filter === 'issued') {
      return credentials.issued || [];
    }
    return [...(credentials.received || []), ...(credentials.issued || [])];
  };

  return (
    <div className="profile-container">
      <h2>Your Credentials</h2>
      {loading ? (
        <p>Loading credentials...</p>
      ) : (
        <>
          <button onClick={handleGenerateAllQrCode} className="save-button">
            Generate QR Code for All Credentials
          </button>
          <button onClick={handleBackToHome} className="cancel-button">
            Back To Home
          </button>

          {qrCodeData.all && (
            <div className="qr-code">
              <QRCodeCanvas value={qrCodeData.all} size={256} level="H" includeMargin={true} />
              <p>
                Share link:{' '}
                <a href={shareLinks.all} target="_blank" rel="noopener noreferrer">
                  {shareLinks.all}
                </a>
              </p>
            </div>
          )}

          {/* Filter Options */}
          <div className="filter-options">
            <button
              onClick={() => setFilter('all')}
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`filter-button ${filter === 'received' ? 'active' : ''}`}
            >
              Received
            </button>
            <button
              onClick={() => setFilter('issued')}
              className={`filter-button ${filter === 'issued' ? 'active' : ''}`}
            >
              Issued
            </button>
          </div>

          <div className="credentials-list">
            {filteredCredentials().map((credential) => (
              <div key={credential.credentialId} className="credential">
                <p>
                  <strong>Type:</strong> {credential.credentialType}
                </p>
                <p>
                  <strong>Description:</strong> {credential.description}
                </p>
                <p>
                  <strong>Date Issued:</strong> {credential.issueDate}
                </p>
                <button
                  onClick={() => handleGenerateQrCode(credential.credentialId)}
                  className="edit-button"
                >
                  Generate QR Code
                </button>
                {qrCodeData[credential.credentialId] && (
                  <div className="qr-code">
                    <QRCodeCanvas
                      value={qrCodeData[credential.credentialId]}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                    <p>
                      Share link:{' '}
                      <a
                        href={shareLinks[credential.credentialId]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {shareLinks[credential.credentialId]}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CredentialsList;

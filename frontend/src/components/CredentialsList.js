import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function CredentialsList() {
  const [credentials, setCredentials] = useState([]);
  const [qrCodeData, setQrCodeData] = useState({});
  const [shareLinks, setShareLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

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
      // Save the share link and QR code data in state instead of using an alert
      setShareLinks((prev) => ({ ...prev, [credentialId]: data.shareLink }));
      setQrCodeData((prev) => ({ ...prev, [credentialId]: data.qrCodeUrl }));
    } catch (error) {
      console.error('Error generating QR code:', error);
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
      // Save the share link and QR code data in state instead of using an alert
      setShareLinks((prev) => ({ ...prev, all: data.shareLink }));
      setQrCodeData((prev) => ({ ...prev, all: data.qrCodeUrl }));
    } catch (error) {
      console.error('Error generating QR code for all credentials:', error);
    }
  };

  return (
    <div className="credentials-container">
      <h2>Your Credentials</h2>
      {loading ? (
        <p>Loading credentials...</p>
      ) : (
        <>
          <button onClick={handleGenerateAllQrCode}>Generate QR Code for All Credentials</button>
          {qrCodeData.all && (
            <div className="qr-code">
              <QRCodeCanvas value={qrCodeData.all} />
              <p>Share link: <a href={shareLinks.all} target="_blank" rel="noopener noreferrer">{shareLinks.all}</a></p>
            </div>
          )}
          <div className="credentials-list">
            {credentials.map((credential) => (
              <div key={credential.credentialId} className="credential">
                <p><strong>Type:</strong> {credential.credentialType}</p>
                <p><strong>Description:</strong> {credential.description}</p>
                <p><strong>Date Issued:</strong> {credential.issueDate}</p>
                <button onClick={() => handleGenerateQrCode(credential.credentialId)}>
                  Generate QR Code
                </button>
                {qrCodeData[credential.credentialId] && (
                  <div className="qr-code">
                    <QRCodeCanvas value={qrCodeData[credential.credentialId]} />
                    <p>Share link: <a href={shareLinks[credential.credentialId]} target="_blank" rel="noopener noreferrer">{shareLinks[credential.credentialId]}</a></p>
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

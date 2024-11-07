import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import RepuChainJSON from '../contracts/RepuChain.json';

const contractABI = RepuChainJSON.abi;
const contractAddress = '0x8C359860bF1ACbac5043c53F2AC1dB5821d3A090'; // Deployed contract address

function IssueCredential({ account }) {
  const [owner, setOwner] = useState('');
  const [credentialType, setCredentialType] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install MetaMask and try again.');
      return;
    }

    try {
      // Initialize ethers and get the signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Connect to the contract
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Call the contract's issueCredential function
      const tx = await contract.issueCredential(owner, credentialType, description);
      console.log('Transaction submitted:', tx.hash);

      // Wait for the transaction to be confirmed
      await tx.wait();

      // Clear the input fields
      setOwner('');
      setCredentialType('');
      setDescription('');
      alert('Credential issued successfully!');
    } catch (error) {
      console.error('Error issuing credential:', error);
      alert('Failed to issue credential.');
    }
  };

  return (
    <div className="profile-container">
      <h2>Issue Credential</h2>
      <form onSubmit={handleSubmit} className="profile-edit-form">
        <div className="form-group">
          <label>Owner Wallet Address:</label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Credential Type:</label>
          <input
            type="text"
            value={credentialType}
            onChange={(e) => setCredentialType(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
          <button onClick={handleSubmit} className="save-button">Issue Credential</button>
          <button onClick={handleBackToHome} className="cancel-button">Back To Home</button>
        </div>
      </form>
    </div>
  );
}

export default IssueCredential;
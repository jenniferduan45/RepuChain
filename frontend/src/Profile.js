// src/Profile.js
import React, { useState, useEffect } from 'react';

function Profile({ handleLogout }) {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    wallet_address: '',
    role: '',
    created_time: '',
    update_time: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    role: '',
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/user/profile`;
    console.log('Fetching profile from:', apiUrl);
    console.log('Token:', token);

    // Fetch user profile from backend
    fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          return response.text().then((text) => {
            console.error('Error response text:', text);
            throw new Error(`Failed to fetch profile: ${response.status}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        setUserInfo({
          username: data.username || '',
          email: data.email || '',
          wallet_address: data.wallet_address || '',
          role: data.role || '',
          created_time: data.created_time || '',
          update_time: data.update_time || '',
        });
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
          alert('Session expired or unauthorized. Please log in again.');
          handleLogout(); // Redirect to login
        } else {
          alert('An error occurred while fetching your profile. Please try again later.');
        }
      });
  }, [token, handleLogout]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditData({
      username: userInfo.username,
      email: userInfo.email,
      role: userInfo.role,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate role
    if (!['Personal', 'Certified Party'].includes(editData.role)) {
      alert('Role must be either Personal or Certified Party.');
      return;
    }

    // Update user profile in backend
    fetch(`${process.env.REACT_APP_API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(editData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.error('Error response text:', text);
            throw new Error('Failed to update profile');
          });
        }
        return response.json();
      })
      .then((data) => {
        alert(data.message);
        setIsEditing(false);
        // Refresh user info
        return fetch(`${process.env.REACT_APP_API_URL}/user/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.error('Error response text:', text);
            throw new Error(`Failed to fetch profile: ${response.status}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        setUserInfo({
          username: data.username || '',
          email: data.email || '',
          wallet_address: data.wallet_address || '',
          role: data.role || '',
          created_time: data.created_time || '',
          update_time: data.update_time || '',
        });
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again later.');
      });
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      {!isEditing ? (
        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">Username:</span>
            <span className="detail-value">{userInfo.username || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{userInfo.email || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Wallet Address:</span>
            <span className="detail-value">{userInfo.wallet_address}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Role:</span>
            <span className="detail-value">{userInfo.role || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Created Time:</span>
            <span className="detail-value">
              {userInfo.created_time
                ? new Date(userInfo.created_time).toLocaleString()
                : 'Invalid Date'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Updated Time:</span>
            <span className="detail-value">
              {userInfo.update_time
                ? new Date(userInfo.update_time).toLocaleString()
                : 'Invalid Date'}
            </span>
          </div>
          <div className="button-group">
            <button onClick={handleEditToggle} className="edit-button">Edit Profile</button>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={editData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={editData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="Personal">Personal</option>
              <option value="Certified Party">Certified Party</option>
            </select>
          </div>

          <div className="button-group">
            <button type="submit" className="save-button">Save Changes</button>
            <button type="button" onClick={handleEditToggle} className="cancel-button">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;
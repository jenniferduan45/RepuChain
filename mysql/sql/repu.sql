CREATE DATABASE IF NOT EXISTS repuchain;
USE repuchain;

-- Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(64),
    email VARCHAR(32),
    wallet_address VARCHAR(42) UNIQUE,
    role VARCHAR(20),
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Credentials Table
CREATE TABLE Credentials (
    credential_id INT PRIMARY KEY,
    owner_id INT,
    issuer_id INT,
    credential_type VARCHAR(100) NOT NULL,
    description VARCHAR(256),
    issue_date DATETIME,
    blockchain_tx_hash VARCHAR(66),
    ipfs_hash VARCHAR(66),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id),
    FOREIGN KEY (issuer_id) REFERENCES Users(user_id)
);

-- Transactions Table
CREATE TABLE Transactions (
    txn_id INT PRIMARY KEY,
    user_id INT,
    credential_id INT,
    txn_hash VARCHAR(255),
    status VARCHAR(255),
    txn_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (credential_id) REFERENCES Credentials(credential_id)
);

-- SharableLinks Table
CREATE TABLE SharableLinks (
    link_id INT PRIMARY KEY,
    user_id INT,
    credential_id INT,
    identification VARCHAR(16) UNIQUE NOT NULL,
    sharable_link VARCHAR(255),
    qr_code_data TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (credential_id) REFERENCES Credentials(credential_id)
);
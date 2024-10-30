# RepuChain
RepuChain is a blockchain-based platform where institutions can issue verifiable credentials. Addressing the challenges of current credential systems, it provides a secure and efficient way for credential issuance, management, and verification, giving users control over their own records.

## Project Structure
```
RepuChain/
├── frontend/                    # React.js frontend
│   ├── public/                     # Static files (e.g. index.html)
│   ├── src/                        # Frontend source code
│   │   ├── components/                 # Reusable React components
│   │   ├── utils/                      # Utility files (e.g. web3.js)
│   │   ├── App.js                      # Main App component
│   │   ├── index.js                    # Main entry point for React
│   │   └── App.css                     # Basic CSS styles
├── backend/                     # Node.js (Express) backend
│   ├── server.js                   # Backend server (Express)
│   ├── package.json                # Backend dependencies
├── contracts/                   # Solidity contracts
│   └── RepuChain.sol            
├── migrations/                  # Migration scripts for Truffle
├── truffle-config.js            # Truffle configuration for smart contracts                   
└── README.md
```

## Install Dependencies
### Install Truffle Dependencies
```
npm install -g truffle
```
### Install Backend Dependencies
```
cd backend
npm install
```
### Install Frontend Dependencies
```
cd frontend
npm install
```

## Run the Project Locally
### Start Backend
```
cd backend
npm start
```
The backend will run on `http://localhost:3001`.
### Start Frontend
```
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`.

## Deployment
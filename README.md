# RepuChain
RepuChain is a blockchain-based platform where institutions can issue verifiable credentials. Addressing the challenges of current credential systems, it provides a secure and efficient way for credential issuance, management, and verification, giving users control over their own records.

## Project Structure
```
RepuChain/
├── frontend/                    # React.js frontend
│   ├── public/                     # Static files (e.g. index.html)
│   ├── src/                        # Frontend source code
│   │   ├── components/                 # React components
│   │   ├── utils/                      # Utility files
│   │   ├── contracts/                  # Compiled contract ABI
│   │   ├── App.js                      # Main App component
│   │   ├── index.js                    # Main entry point for React
│   │   └── App.css                     # Basic CSS styles
│   ├── package.json                # Frontend dependencies
├── backend/                     # Node.js (Express) backend
│   ├── server.js                   # Backend server (Express)
│   ├── package.json                # Backend dependencies
├── contracts/                   # Solidity contracts
│   └── RepuChain.sol            
├── migrations/                  # Migration scripts for Truffle
├── node_modules/                # Node.js modules
├── mysql/                       # MySQL configurations or data
├── docker-compose.yml           # Docker Compose configuration
├── truffle-config.js            # Truffle configuration for smart contracts
├── package.json                 # Project dependencies
├── package-lock.json            # Locked versions of project dependencies
├── README.md                    # Project documentation
├── Dockerfile-frontend          # Dockerfile for frontend
└── Dockerfile-backend           # Dockerfile for backend
```

## Install Dependencies
### Install Truffle
```
npm install -g truffle
```
### Install Ganache
Download Ganache Desktop at https://archive.trufflesuite.com/ganache/
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

## Run the project in docker
If this is your irst time run it
```
sudo docker-compose up --build
```
If you have already built it
```
sudo docker-compose up
```

## Deployment

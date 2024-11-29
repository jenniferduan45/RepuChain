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
│   ├── contracts/                  # Compiled contract ABI
├── contracts/                   # Solidity contracts
│   └── RepuChain.sol            
├── migrations/                  # Migration scripts for Truffle
├── build/                       # Compiled contract ABI
├── mysql/                       # MySQL configurations of data
├── docker-compose.yml           # Docker Compose configuration
├── truffle-config.js            # Truffle configuration for smart contracts
├── README.md                    # Project documentation
├── Dockerfile-frontend          # Dockerfile for frontend
└── Dockerfile-backend           # Dockerfile for backend
```

## Prerequisites
1. Use `Node.js` v18.x or v16.x.
2. Install Truffle: `npm install -g truffle`.
3. Download Ganache Desktop at https://archive.trufflesuite.com/ganache/.
4. Follow instructions at https://metamask.io to set up Metamask using supported browser.

## Run the project in docker (Recommended)
If this is your first time run it
```
sudo docker-compose up --build
```
If you have already built it
```
sudo docker-compose up
```

## Run the project locally
### Start Backend
```
cd backend
npm install
npm start
```
The backend will run on `http://localhost:3001`.
### Start Frontend
```
cd frontend
npm install
npm start
```
The frontend will run on `http://localhost:3000`.

## Blockchain Development
1. Implement transaction logic in `contracts/RepuChain.sol`.
2. Prepare migration script in `migrations/`.
3. Run `truffle compile` to compile the contract and generate ABI in `build/contracts/RepuChain.json`. 
4. Open Ganache Desktop and create a workspace using `truffle-config.js`.
5. Run `truffle migrate --network development` to deploy the contract to local blockchain. Once deployed, copy the generated file `RepuChain.json` to `frontend/src/contracts` and `backend/contracts` and update the deployed contract address in `docker-compose.yml`, `frontend/src/components/IssueCredential.js`, and `backend/server.js`.
6. All the blocks, transactions, contracts, events, and logs under local development can be persisted and viewed in a workspace in Ganache Desktop.

## How to test locally
1. Open Ganache Desktop workspace and choose a test wallet with enough ETH under `Accounts` tab.
2. Import the wallet into Metamask by entering its private key.
3. In Metamask, go to `Settings > Security & privacy > Add a custom network`, add Ganache test network by entering below values, and select it as network.
    ```
    Default RPC URL = 127.0.0.1:7545
    Chain ID = 1337
    Currency symbol = ETH
    ```
4. In Metamask, go to `All Permissions > localhost:3000 > Edit accounts` and select only the test wallet with enough ETH.
5. In Metamask, go to `All Permissions > localhost:3000 > Edit networks` and select only the Ganache test network.
6. Now the wallet in Metamask is ready to use for testing.


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RepuChain {
    struct Credential {
        address owner;
        address issuer;
        string credentialType;
        string description;
        uint256 issueDate;
    }

    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) private userCredentials; // Mapping to store list of credentials for each user
    uint256 public credentialCount;

    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed owner,
        address indexed issuer,
        string credentialType,
        string description,
        uint256 issueDate
    );

    function issueCredential(
        address _owner,
        string memory _credentialType,
        string memory _description
    ) public returns (bytes32) {
        bytes32 credentialId = keccak256(abi.encodePacked(_owner, msg.sender, _credentialType, _description, block.timestamp));
        require(credentials[credentialId].issueDate == 0, "Credential ID already exists");

        credentials[credentialId] = Credential({
            owner: _owner,
            issuer: msg.sender,
            credentialType: _credentialType,
            description: _description,
            issueDate: block.timestamp
        });

        userCredentials[_owner].push(credentialId); // Add credential ID to the user's list
        credentialCount++;

        emit CredentialIssued(
            credentialId,
            _owner,
            msg.sender,
            _credentialType,
            _description,
            block.timestamp
        );

        return credentialId;
    }

    // Function to get all credentials for a user
    function getUserCredentials(address _user) public view returns (bytes32[] memory) {
        return userCredentials[_user];
    }
}

import Web3 from 'web3';

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  console.error('MetaMask not detected');
}

export default web3;

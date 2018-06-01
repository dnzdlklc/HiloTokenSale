require('babel-register');
require('babel-polyfill');

const web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');

const ONE_GWEI = Math.pow(10, 9);
const EIGHT_GWEI = 8 * ONE_GWEI;

module.exports = {
  networks: {
    mainnet: {
      provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://mainnet.infura.io/3aPdTSUEXEXeffefJPDb');
      },
      network_id: 1,
      gasPrice: ONE_GWEI * 50,
      gas: 6700000
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC_ROPSTEN, 'https://ropsten.infura.io/3aPdTSUEXEXeffefJPDb');
      },
      network_id: 2,
      gasPrice: EIGHT_GWEI
    },
    kovan: {
      provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC_KOVAN, 'https://kovan.infura.io/3aPdTSUEXEXeffefJPDb');
      },
      network_id: 42,
      gasPrice: EIGHT_GWEI * 2
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC_RINKEBY, 'https://rinkeby.infura.io/3aPdTSUEXEXeffefJPDb');
      },
      network_id: 4,
      gasPrice: EIGHT_GWEI * 3,
      gas: 6700000
    },
    ganache: {
      provider: function () {
        return new web3.providers.HttpProvider('http://127.0.0.1:7545');
      },
      network_id: 5777,
      gasPrice: EIGHT_GWEI
    },
    solc: {
      optimizer: {
        enabled: false,
        runs: 200
      }
    }
  }
};
const HiloToken = artifacts.require('HiloToken');
const HiloReserveHolder = artifacts.require('HiloReserveHolder');
const { HILO_WALLET } = require('./util/constants');

module.exports = function (deployer) {
  deployer.deploy(HiloReserveHolder, HiloToken.address, HILO_WALLET);
};

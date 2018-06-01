const HiloToken = artifacts.require('HiloToken');
const HiloPresaleDistributor = artifacts.require('HiloPresaleDistributor');
const Math = artifacts.require('zeppelin-solidity/contracts/math/Math.sol');
const SafeMath = artifacts.require('zeppelin-solidity/contracts/math/SafeMath.sol');
const { PRESALE_CONTRACT_ADDRESS } = require('./util/constants');

module.exports = function (deployer) {
  deployer.deploy(Math);
  deployer.deploy(SafeMath);
  deployer.link(Math, HiloPresaleDistributor);
  deployer.link(SafeMath, HiloPresaleDistributor);
  deployer.deploy(HiloPresaleDistributor, HiloToken.address, PRESALE_CONTRACT_ADDRESS);
};
const { FIXED_CROWDSALE_USD_ETHER_PRICE } = require('./util/constants');
const HiloToken = artifacts.require('HiloToken');
const HiloCrowdsale = artifacts.require('HiloCrowdsale');
const Math = artifacts.require('zeppelin-solidity/contracts/math/Math.sol');
const SafeMath = artifacts.require('zeppelin-solidity/contracts/math/SafeMath.sol');

module.exports = function (deployer) {
  deployer.link(Math, HiloCrowdsale);
  deployer.link(SafeMath, HiloCrowdsale);
  deployer.deploy(
    HiloCrowdsale,
    HiloToken.address,
    FIXED_CROWDSALE_USD_ETHER_PRICE
  );
};
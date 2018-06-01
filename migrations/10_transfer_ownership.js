const { OWNER_WALLET } = require('./util/constants');

const HiloCrowdsale = artifacts.require('HiloCrowdsale');
const CrowdsaleTokenController = artifacts.require('CrowdsaleTokenController');

module.exports = function (deployer) {
  deployer.then(
    async () => {
      // transfer crowdsale ownership to hilo wallet
      const hiloCrowdsale = await HiloCrowdsale.deployed();
      await hiloCrowdsale.transferOwnership(OWNER_WALLET);

      // transfer crowdsale token controller ownership to hilo0x wallet
      const crowdsaleTokenController = await CrowdsaleTokenController.deployed();
      await crowdsaleTokenController.transferOwnership(OWNER_WALLET);
    }
  );
};

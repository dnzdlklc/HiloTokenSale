const HiloToken = artifacts.require('HiloToken');
const HiloCrowdsale = artifacts.require('HiloCrowdsale');
const HiloPresaleDistributor = artifacts.require('HiloPresaleDistributor');
const CrowdsaleTokenController = artifacts.require('CrowdsaleTokenController');

module.exports = function (deployer) {
  deployer.then(
    async () => {
      const hiloToken = await HiloToken.deployed();

      // deploy the token controller
      await deployer.deploy(CrowdsaleTokenController, hiloToken.address);
      const crowdsaleTokenController = await CrowdsaleTokenController.deployed();

      // transfer the hilo token ownership to the crowdsale contract
      const setControllerTx = await hiloToken.changeController(crowdsaleTokenController.address);

      // whitelist the distributors to be able to sent hilo
      const whitelistDistributorContractsTx = await crowdsaleTokenController.addToWhitelist([
        HiloCrowdsale.address,
        HiloPresaleDistributor.address
      ]);

      // turn on token transfers
      const enableTransfersTx = await crowdsaleTokenController.enableTransfers(true);
    }
  );
};


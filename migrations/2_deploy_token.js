const HiloToken = artifacts.require('HiloToken');
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');

module.exports = function (deployer) {
  deployer.then(async () => {
    // create a new minime factory for the Hilo token, which it uses to clone itself
    await deployer.deploy(MiniMeTokenFactory);

    // deploy the Hilo token
    await deployer.deploy(HiloToken, MiniMeTokenFactory.address);
  });
};

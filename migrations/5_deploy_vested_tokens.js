const { VESTED_TOKEN_CONTRACTS } = require('./util/constants');
const HiloTokenVesting = artifacts.require('HiloTokenVesting');
const HiloPresaleDistributor = artifacts.require('HiloPresaleDistributor');
const fs = require('fs');
const path = require('path');

module.exports = function (deployer, network) {
  const vestedTokensPath = path.resolve(__dirname, '../build/vested-tokens.json');

  function readFile () {
    const exists = fs.existsSync(vestedTokensPath);
    const file = exists ? JSON.parse(fs.readFileSync(vestedTokensPath)) : { [network]: {} };
    file[network] = file[network] || {};
    return file;
  }

  function writeFile (vestingContracts) {
    // export out the addresses to a file
    if (!fs.existsSync(path.resolve(__dirname, '../build'))) {
      fs.mkdirSync(path.resolve(__dirname, '../build'));
    }

    fs.writeFileSync(vestedTokensPath, JSON.stringify(vestingContracts));
  }

  // deploy the token vesting contracts and save the results to a file (workaround so we can share the information between contracts)
  deployer.then(async () => {
    const vestingContracts = readFile();

    async function deployVestedToken (wallet, stakeDuration, id) {
      console.log(`Deploying token vesting contract for ${id}...`);
      const tokenVesting = await HiloTokenVesting.new(wallet, stakeDuration);
      console.log(`Deployed token vesting contract for ${id}: ${tokenVesting.address}`);

      vestingContracts[network][id] = tokenVesting.address;

      writeFile(vestingContracts);
    }

    for (let id in VESTED_TOKEN_CONTRACTS) {
      if (VESTED_TOKEN_CONTRACTS.hasOwnProperty(id) && !vestingContracts[network][id]) {
        const { wallet, stakeDuration } = VESTED_TOKEN_CONTRACTS[id];

        await deployVestedToken(wallet, stakeDuration, id);
      }
    }
  });
};

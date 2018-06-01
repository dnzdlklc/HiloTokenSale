const HiloTokenVesting = artifacts.require('HiloTokenVesting');
const HiloToken = artifacts.require('HiloToken');

const fs = require('fs');
const path = require('path');

const vestedTokensPath = path.resolve(__dirname, '../build/vested-tokens.json');

module.exports = function (deployer, network) {
  if (network !== 'mainnet') {
    return;
  }

  function readFile() {
    const exists = fs.existsSync(vestedTokensPath);
    const file = exists ? JSON.parse(fs.readFileSync(vestedTokensPath)) : {};
    file[ network ] = file[ network ] || {};
    return file;
  }

  deployer.then(
    async () => {
      const VESTING = readFile();

      const vestingForNetwork = VESTING[network];

      for (let user in vestingForNetwork) {
        if (vestingForNetwork.hasOwnProperty(user)) {
          const hxtv = await hiloTokenVesting.at(vestingForNetwork[user]);
          const releasableAmount = await hxtv.releasableAmount(HiloToken.address);

          if (releasableAmount.valueOf() !== '0') {
            await hxtv.release(HiloToken.address);
          }
        }
      }
    }
  );
};

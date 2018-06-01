const { HILO_RESERVE, PRESALE_POOL, MAINSALE_POOL } = require('./util/constants');
const { VESTED_TOKEN_CONTRACTS } = require('./util/constants');

const fs = require('fs');
const path = require('path');
const HiloToken = artifacts.require('HiloToken');
const HiloCrowdsale = artifacts.require('HiloCrowdsale');
const HiloPresaleDistributor = artifacts.require('HiloPresaleDistributor');
const HiloReserveHolder = artifacts.require('HiloReserveHolder');
const CrowdsaleTokenController = artifacts.require('CrowdsaleTokenController');
const HiloTokenVesting = artifacts.require('HiloTokenVesting');

module.exports = function (deployer, network) {
  deployer.then(
    async () => {
      const vestedTokens = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/vested-tokens.json')));

      const hiloToken = await HiloToken.deployed();

      const BALANCES = [
        [HiloCrowdsale.address, MAINSALE_POOL],
        [HiloPresaleDistributor.address, PRESALE_POOL],
        [HiloReserveHolder.address, HILO_RESERVE],
      ];

      for (let id in VESTED_TOKEN_CONTRACTS) {
        if (VESTED_TOKEN_CONTRACTS.hasOwnProperty(id)) {
          const { stake } = VESTED_TOKEN_CONTRACTS[id];
          const address = vestedTokens[network][id];

          BALANCES.push([address, stake]);
        }
      }

      // fund the crowdsale
      await hiloToken.generateTokensAll(
        BALANCES.map(([address, amount]) => address),
        BALANCES.map(([address, amount]) => amount * Math.pow(10, 18))
      );
    }
  );
};

import expectThrow from './helpers/expectThrow';
import { ZERO_ADDRESS } from './helpers/util';

const HiloToken = artifacts.require('HiloToken');
const CrowdsaleTokenController = artifacts.require('CrowdsaleTokenController');
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');

contract('HiloToken', (accounts) => {
  let token;
  let crowdsaleTokenController;
  let factory;

  before('get the deployed hilo token', async () => {
    token = await HiloToken.deployed();
    crowdsaleTokenController = await CrowdsaleTokenController.deployed();
    factory = await MiniMeTokenFactory.deployed();
  });

  it('should be deployed', async () => {
    assert.strictEqual(typeof token.address, 'string');
  });

  it('controller should be CrowdsaleTokenController', async () => {
    const controller = await token.controller();
    assert.strictEqual(controller, crowdsaleTokenController.address);
  });

  it('should have a token factory', async () => {
    const minime = await token.tokenFactory();
    assert.strictEqual(minime, factory.address);
  });

  it('should have a total supply of 500M +/- 1 HILO', async () => {
    const tokenSupply = await token.totalSupply();
    // not off by more than 1 HILO === 0.0165 USD at crowdsale
    assert.strictEqual(tokenSupply.sub('5e+26').abs() < Math.pow(10, 18), true);
  });

  it('should have the constant attributes', async () => {
    //  0x0,                        // no parent token
    //  0,                          // no snapshot block number from parent
    //  "Hilo Token",               // Token name
    //  18   ,                      // Decimals
    //  "HILO",                     // Symbol
    //  true                        // Enable transfers

    const parentSnapShotBlock = await token.parentSnapShotBlock();
    const parentToken = await token.parentToken();
    const name = await token.name();
    const decimals = await token.decimals();
    const symbol = await token.symbol();
    const transfersEnabled = await token.transfersEnabled();

    assert.strictEqual(parentSnapShotBlock.valueOf(), '0');
    assert.strictEqual(parentToken, ZERO_ADDRESS);
    assert.strictEqual(name, 'Hilo Token');
    assert.strictEqual(decimals.valueOf(), '18');
    assert.strictEqual(symbol, 'HILO');
    assert.strictEqual(transfersEnabled, true);
  });

  describe('#generateTokensAll', () => {
    let hiloToken;
    const [controller, ...others] = accounts;

    before(async () => {
      hiloToken = await HiloToken.new(ZERO_ADDRESS, { from: controller });
    });

    it('only allows controller to control it', async () => {
      for (let other of others) {
        await expectThrow(hiloToken.generateTokensAll([], [], { from: other }));
      }

      await hiloToken.generateTokensAll([], [], { from: controller });
    });

    it('generates amounts of tokens for all addresses', async () => {
      const balances = [];

      for (let i = 0; i < others.length; i++) {
        balances.push(i * 10);
      }

      await hiloToken.generateTokensAll(others, balances, { from: controller });

      for (let i = 0; i < others.length; i++) {
        const balance = await hiloToken.balanceOf(others[i]);
        assert.strictEqual(balance.valueOf(), '' + (i * 10));
      }
    });
  });
});

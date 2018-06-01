import { withinPercentage, ZERO_ADDRESS } from './helpers/util';
import { MAINSALE_POOL } from '../migrations/util/constants';
import expectThrow from './helpers/expectThrow';

const HiloToken = artifacts.require('HiloToken');
const HiloCrowdsale = artifacts.require('HiloCrowdsale');
const MockHiloCrowdsale = artifacts.require('MockHiloCrowdsale');

contract('HiloCrowdsale', function ([ deployer, whitelistContributor1, whitelistContributor2, contributor1, contributor2 ]) {
  let deployedCrowdsale, deployedToken;

  const ALL_CONTRIBUTORS = [ whitelistContributor1, whitelistContributor2, contributor1, contributor2 ];

  before('get deployed Hilo crowdsale contract', async () => {
    deployedCrowdsale = await HiloCrowdsale.deployed();
    deployedToken = await HiloToken.deployed();
  });

  it('should be deployed', () => {
    assert.strictEqual(typeof deployedCrowdsale.address, 'string');
  });

  it('should have crowdsale balance', async () => {
    const knowsToken = await deployedCrowdsale.hiloToken();
    assert.strictEqual(knowsToken, deployedToken.address);

    const balance = await deployedToken.balanceOf(deployedCrowdsale.address);
    assert.strictEqual(balance.valueOf(), '9.091e+25');
  });

  describe('MockHiloCrowdsale', () => {
    let token, crowdsale, saleStartDate, saleEndDate, whitelistEndDate, limitsEndDate, maxGasPrice, maxGas,
      hardCapWei, maxContributionWeiWhitelist, maxContributionWeiLimitedPeriod;

    // if 1 ether === 15 million USD, we can saturate the crowdsale with .1 ETH
    const USD_ETHER_PRICE = 15 * Math.pow(10, 6);
    const FIFTEEN_HUNDRED_IN_WEI = Math.floor(1500 / USD_ETHER_PRICE * Math.pow(10, 18));
    const TEN_THOUSAND_IN_WEI = Math.floor(10000 / USD_ETHER_PRICE * Math.pow(10, 18));

    const ONE_GWEI = Math.pow(10, 9);

    beforeEach('deploy a fresh crowdsale', async () => {
      token = await HiloToken.new(ZERO_ADDRESS, { from: deployer });
      await token.enableTransfers(true);

      crowdsale = await MockHiloCrowdsale.new(token.address, USD_ETHER_PRICE, { from: deployer });

      await crowdsale.addToWhitelist([ whitelistContributor1, whitelistContributor2 ], { from: deployer });

      await token.generateTokens(crowdsale.address, MAINSALE_POOL * Math.pow(10, 18), { from: deployer });

      saleStartDate = await crowdsale.SALE_START_DATE();
      saleEndDate = await crowdsale.SALE_END_DATE();
      whitelistEndDate = await crowdsale.WHITELIST_END_DATE();
      limitsEndDate = await crowdsale.LIMITS_END_DATE();
      maxGasPrice = await crowdsale.MAX_GAS_PRICE();
      maxGas = await crowdsale.MAX_GAS();

      const hardCapUsd = await crowdsale.HARD_CAP_USD();
      const maxContributionUsdWhitelist = await crowdsale.MAXIMUM_CONTRIBUTION_WHITELIST_PERIOD_USD();
      const maxContributionUsdLimitedPeriod = await crowdsale.MAXIMUM_CONTRIBUTION_LIMITED_PERIOD_USD();

      hardCapWei = await crowdsale.usdToWei(hardCapUsd);
      maxContributionWeiWhitelist = await crowdsale.usdToWei(maxContributionUsdWhitelist);
      maxContributionWeiLimitedPeriod = await crowdsale.usdToWei(maxContributionUsdLimitedPeriod);
    });

    async function contribute(from, amount, gas = maxGas, gasPrice = maxGasPrice) {
      // crowdsale time
      const time = await crowdsale.currentTime();

      // this limits our contributions to these values
      const tx = await crowdsale.sendTransaction({ from, value: amount, gasPrice, gas });

      const { receipt: { gasUsed }, logs } = tx;

      assert.strictEqual(logs.length, 1);
      assert.strictEqual(gasUsed < maxGas, true);

      {
        const { event, args: { contributor, duringWhitelistPeriod, contributedWei, refundedWei, hiloAwarded } } = logs[ 0 ];
        assert.strictEqual(event, 'OnContribution');
        assert.strictEqual(contributor, from);
        assert.strictEqual(duringWhitelistPeriod, time < whitelistEndDate);
        // the difference between the contributed amount and sent amount should be the refunded amount
        assert.strictEqual(contributedWei.sub(amount).abs().valueOf(), refundedWei.valueOf());

        // the Hilo awarded should the contributed amount
        withinPercentage(hiloAwarded, (contributedWei.mul(USD_ETHER_PRICE)).div(0.0165).valueOf());
      }

      return tx;
    }

    it('allows the owner to withdraw ether at any time', async () => {
      // first make a contribution
      await crowdsale.setTime(limitsEndDate);

      // contribute 1 gwei
      await contribute(contributor1, ONE_GWEI);

      // no one can withdraw
      for (let acct of ALL_CONTRIBUTORS) {
        await expectThrow(crowdsale.withdraw(1, { from: acct }));
      }

      const { logs: [ { args: { to, amount } } ] } = await crowdsale.withdraw(1, { from: deployer });
      assert.strictEqual(to, deployer);
      assert.strictEqual(amount.valueOf(), '1');
    });

    it('does not accept contributions while paused', async () => {
      await crowdsale.setTime(whitelistEndDate - 1);
      await contribute(whitelistContributor1, ONE_GWEI);

      await crowdsale.pause({ from: deployer });
      await expectThrow(contribute(whitelistContributor1, ONE_GWEI));

      await crowdsale.unpause({ from: deployer });
      await contribute(whitelistContributor1, ONE_GWEI);
    });

    it('does not accept 0 value contributions', async () => {
      await crowdsale.setTime(limitsEndDate + 1);
      await expectThrow(contribute(whitelistContributor1, 0));
    });

    it('should not accept contributions until SALE_START_DATE', async () => {
      await crowdsale.setTime(saleStartDate - 1);
      await expectThrow(contribute(whitelistContributor1, ONE_GWEI));

      await crowdsale.setTime(saleStartDate);
      await contribute(whitelistContributor1, ONE_GWEI);
    });

    it('should not accept contributions after SALE_END_DATE', async () => {
      await crowdsale.setTime(saleEndDate - 1);
      await contribute(contributor1, ONE_GWEI);

      await crowdsale.setTime(saleEndDate);
      await expectThrow(contribute(contributor1, ONE_GWEI));
    });

    it('should not accept contributions beyond hard cap', async () => {
      await crowdsale.setTime(limitsEndDate);

      // contribute the hard cap in wei to put the crowdsale at the hard cap
      await contribute(contributor1, hardCapWei);

      await expectThrow(contribute(contributor2, ONE_GWEI));
    });

    it('only accepts contributions from whitelisted addresses in first 24 hours', async () => {
      await crowdsale.setTime(whitelistEndDate - 1);

      await expectThrow(contribute(contributor1, maxContributionWeiWhitelist));

      await contribute(whitelistContributor1, maxContributionWeiWhitelist);

      await crowdsale.setTime(whitelistEndDate);

      await contribute(contributor1, maxContributionWeiWhitelist);
    });


    it('only accepts $1.5k USD per address during whitelist period', async () => {
      await crowdsale.setTime(whitelistEndDate - 1);

      {
        const { logs: [ { args: { contributedWei, refundedWei } } ] } = await contribute(whitelistContributor1, maxContributionWeiWhitelist.mul(3));

        assert.strictEqual(contributedWei.valueOf(), maxContributionWeiWhitelist.valueOf());
        assert.strictEqual(refundedWei.valueOf(), maxContributionWeiWhitelist.mul(2).valueOf());

        // may not contribute any more
        await expectThrow(contribute(whitelistContributor1, ONE_GWEI));
      }

      {
        // the 2nd whitelisted contributor contributes the max
        const { logs: [ { args: { contributedWei, refundedWei } } ] } = await contribute(whitelistContributor2, FIFTEEN_HUNDRED_IN_WEI);

        assert.strictEqual(contributedWei.sub(FIFTEEN_HUNDRED_IN_WEI).valueOf(), '0');
        assert.strictEqual(refundedWei.valueOf(), '0');

        // may not contribute any more
        await expectThrow(contribute(whitelistContributor2, ONE_GWEI));
      }
    });

    it('accepts contributions from any address after the whitelist period for 24 hours', async () => {
      await crowdsale.setTime(whitelistEndDate);

      for (let acct of ALL_CONTRIBUTORS) {
        await contribute(acct, ONE_GWEI);
      }
    });

    it('limits gas and gas price sent until limits end date', async () => {
      await crowdsale.setTime(saleStartDate);

      // can contribute at or below max gas price
      await contribute(whitelistContributor1, ONE_GWEI, maxGas - 1, maxGasPrice - 1);
      await contribute(whitelistContributor1, ONE_GWEI, maxGas, maxGasPrice);

      // cannot contribute at more than gas price
      await expectThrow(contribute(whitelistContributor1, ONE_GWEI, maxGas + 1, maxGasPrice));
      await expectThrow(contribute(whitelistContributor1, ONE_GWEI, maxGas, maxGasPrice + 1));
      await expectThrow(contribute(whitelistContributor1, ONE_GWEI, maxGas + 1, maxGasPrice + 1));

      // can still contribute
      await contribute(whitelistContributor1, ONE_GWEI);

      // check after whitelist period
      await crowdsale.setTime(whitelistEndDate);

      // can contribute at or below max gas price
      await contribute(contributor1, ONE_GWEI, maxGas - 1, maxGasPrice - 1);
      await contribute(contributor1, ONE_GWEI, maxGas, maxGasPrice);

      // cannot contribute at more than gas price
      await expectThrow(contribute(contributor1, ONE_GWEI, maxGas + 1, maxGasPrice));
      await expectThrow(contribute(contributor1, ONE_GWEI, maxGas, maxGasPrice + 1));
      await expectThrow(contribute(contributor1, ONE_GWEI, maxGas + 1, maxGasPrice + 1));

      // can still contribute
      await contribute(contributor1, ONE_GWEI);

      await crowdsale.setTime(limitsEndDate);

      // maximums removed
      await contribute(contributor1, ONE_GWEI, maxGas + 1, maxGasPrice + 1);
    });

    it('limits total contributions to $10k USD for 24 hours after whitelist period', async () => {
      await crowdsale.setTime(whitelistEndDate);

      {
        const { logs: [ { args: { contributedWei, refundedWei } } ] } = await contribute(whitelistContributor1, maxContributionWeiWhitelist);

        assert.strictEqual(contributedWei.valueOf(), maxContributionWeiWhitelist.valueOf());
        assert.strictEqual(refundedWei.valueOf(), '0');

        {
          // contributes max during limited period, should get the whitelist amount back
          const { logs: [ { args: { contributedWei, refundedWei } } ] } = await contribute(whitelistContributor1, maxContributionWeiLimitedPeriod);

          assert.strictEqual(contributedWei.valueOf(), maxContributionWeiLimitedPeriod.sub(maxContributionWeiWhitelist)
            .valueOf());
          assert.strictEqual(refundedWei.valueOf(), maxContributionWeiWhitelist.valueOf());
        }

        // now at the max
        await expectThrow(contribute(whitelistContributor1, ONE_GWEI));
      }
    });

    it('adds to total contributions for each wei sent', async () => {
      await crowdsale.setTime(saleStartDate);

      await contribute(whitelistContributor1, ONE_GWEI);
      let total = await crowdsale.totalContributions();
      assert.strictEqual(total.sub(ONE_GWEI).valueOf(), '0');

      await contribute(whitelistContributor1, ONE_GWEI * 2);
      total = await crowdsale.totalContributions();
      assert.strictEqual(total.sub(ONE_GWEI * 3).valueOf(), '0');
    });

    it('records contributions by address correctly', async () => {
      await crowdsale.setTime(saleStartDate);

      await contribute(whitelistContributor1, ONE_GWEI);
      let wl1Contributions = await crowdsale.contributionAmounts(whitelistContributor1);
      assert.strictEqual(wl1Contributions.sub(ONE_GWEI).valueOf(), '0');

      await contribute(whitelistContributor1, ONE_GWEI * 5);
      wl1Contributions = await crowdsale.contributionAmounts(whitelistContributor1);
      assert.strictEqual(wl1Contributions.sub(ONE_GWEI * 6).valueOf(), '0');

      // another contributor
      await contribute(whitelistContributor2, ONE_GWEI * 2);
      const wl2Contributions = await crowdsale.contributionAmounts(whitelistContributor2);
      assert.strictEqual(wl2Contributions.sub(ONE_GWEI * 2).valueOf(), '0');
    });
  });
});

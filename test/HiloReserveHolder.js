import { ONE_DAY_SECONDS, ONE_HOUR_SECONDS, ZERO_ADDRESS } from './helpers/util';
import expectThrow from './helpers/expectThrow';

const HiloToken = artifacts.require('HiloToken');
const HiloReserveHolder = artifacts.require('HiloReserveHolder');
const MockHiloReserveHolder = artifacts.require('MockHiloReserveHolder');
const KnowsConstants = artifacts.require('KnowsConstants');

contract('HiloReserveHolder', ([ deployer, benefactor ]) => {
  let token;
  let hiloReserveHolder;

  before('get the deployed hilo token', async () => {
    token = await HiloToken.deployed();
    hiloReserveHolder = await HiloReserveHolder.deployed();
  });

  it('should be deployed', async () => {
    assert.strictEqual(typeof hiloReserveHolder.address, 'string');
  });

  it('should have a balance of 225.14M', async () => {
    const balance = await token.balanceOf(hiloReserveHolder.address);
    assert.strictEqual(balance.valueOf(), '2.2514e+26');
  });

  describe('#release', () => {
    let token;
    let mockReserveHolder;
    let saleStartDate;
    let saleEndDate;
    let unfreezeDate;

    before('set up constants', async () => {
      const constants = await KnowsConstants.new();

      saleStartDate = await constants.SALE_START_DATE();
      saleEndDate = await constants.SALE_END_DATE();
      unfreezeDate = await constants.UNFREEZE_DATE();
    });

    beforeEach('set up the token and mock', async () => {
      token = await HiloToken.new(ZERO_ADDRESS, { from: deployer });
      await token.enableTransfers(true);

      mockReserveHolder = await MockHiloReserveHolder.new(token.address, benefactor, { from: deployer });

      // give it 1 million tokens
      await token.generateTokens(mockReserveHolder.address, Math.pow(10, 24), { from: deployer });
    });

    async function assertNotWithdrawn() {
      const reserveBalance = await token.balanceOf(mockReserveHolder.address);
      assert.strictEqual(reserveBalance.valueOf(), '' + Math.pow(10, 24));

      const benefactorBalance = await token.balanceOf(benefactor);
      assert.strictEqual(benefactorBalance.valueOf(), '0');
    }

    async function assertWithdrawn() {
      const reserveBalance = await token.balanceOf(mockReserveHolder.address);
      assert.strictEqual(reserveBalance.valueOf(), '0');

      const benefactorBalance = await token.balanceOf(benefactor);
      assert.strictEqual(benefactorBalance.valueOf(), '' + Math.pow(10, 24));
    }

    it('should not release at or around start and end dates', async () => {
      // this creates a bunch of permutations of times around the start and end date
      const timeArrays = [ saleStartDate, saleEndDate ]
        .map(
          time => [ ONE_DAY_SECONDS * -1, ONE_HOUR_SECONDS * -1, 0, ONE_HOUR_SECONDS, ONE_DAY_SECONDS ]
            .map(offset => time.plus(offset))
        );

      // make sure they all fail to release
      for (let time of Array.prototype.concat.apply([], timeArrays)) {
        await mockReserveHolder.setTime(time);
        await expectThrow(mockReserveHolder.release());

        await assertNotWithdrawn();
      }
    });

    it('cannot be withdrawn just before the unfreeze date', async () => {
      await mockReserveHolder.setTime(unfreezeDate.sub(ONE_DAY_SECONDS));
      await expectThrow(mockReserveHolder.release());
      await assertNotWithdrawn();

      await mockReserveHolder.setTime(unfreezeDate.sub(ONE_HOUR_SECONDS));
      await expectThrow(mockReserveHolder.release());
      await assertNotWithdrawn();

      await mockReserveHolder.setTime(unfreezeDate.sub(1));
      await expectThrow(mockReserveHolder.release());
      await assertNotWithdrawn();
    });

    it('can be withdrawn on the release date', async () => {
      await mockReserveHolder.setTime(unfreezeDate);
      const withdrawTx = await mockReserveHolder.release();
      await assertWithdrawn();

      await expectThrow(mockReserveHolder.release());
    });

    it('can be withdrawn after the release date', async () => {
      await mockReserveHolder.setTime(unfreezeDate.plus(ONE_DAY_SECONDS));
      const withdrawTx = await mockReserveHolder.release();
      await assertWithdrawn();

      await expectThrow(mockReserveHolder.release());
    });
  });
});

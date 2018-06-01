const HiloTokenVesting = artifacts.require('HiloTokenVesting');

contract('HiloTokenVesting', ([ account0, account1, account2 ]) => {
  let WHITELIST_END_DATE;
  it('calls TokenVesting constructor properly', async () => {
    const tv = await HiloTokenVesting.new(account1, 12);
    const WHITELIST_END_DATE = await tv.WHITELIST_END_DATE();

    const beneficiary = await tv.beneficiary();
    const cliff = await tv.cliff();
    const start = await tv.start();
    const duration = await tv.duration();
    const revocable = await tv.revocable();

    assert.strictEqual(beneficiary, account1);
    assert.strictEqual(cliff.valueOf(), WHITELIST_END_DATE.valueOf());
    assert.strictEqual(start.valueOf(), WHITELIST_END_DATE.valueOf());
    assert.strictEqual(duration.valueOf(), '' + (12 * 7 * 86400));
    assert.strictEqual(revocable, false);
  });
});
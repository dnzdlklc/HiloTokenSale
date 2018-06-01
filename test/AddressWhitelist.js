import expectThrow from './helpers/expectThrow';

const AddressWhitelist = artifacts.require('AddressWhitelist');

contract('AddressWhitelist', ([ owner, acct1, acct2, acct3, acct4, acct5 ]) => {
  let whitelist;

  beforeEach('create whitelist', async () => {
    whitelist = await AddressWhitelist.new({ from: owner });
  });

  //    addToWhitelist(address[] addresses);
  //    event LogWhitelistAdd(address indexed addr);
  describe('#addToWhitelist', async () => {
    it('can only be called by owner', async () => {
      await expectThrow(whitelist.addToWhitelist([], { from: acct1 }));
      await expectThrow(whitelist.addToWhitelist([], { from: acct2 }));

      const { logs } = await whitelist.addToWhitelist([], { from: owner });
      assert.strictEqual(logs.length, 0);
    });

    it('adds it to the state', async () => {
      const whitelistedBefore = await  whitelist.isWhitelisted(acct1);
      assert.strictEqual(whitelistedBefore, false);

      await whitelist.addToWhitelist([ acct1 ], { from: owner });
      const whitelistedAfter = await whitelist.isWhitelisted(acct1);
      assert.strictEqual(whitelistedAfter, true);
    });

    it('is idempotent', async () => {
      const { logs: firstAddLogs } = await whitelist.addToWhitelist([ acct1 ], { from: owner });
      assert.strictEqual(firstAddLogs.length, 1);
      assert.strictEqual(firstAddLogs[ 0 ].event, 'LogWhitelistAdd');
      assert.strictEqual(firstAddLogs[ 0 ].args.addr, acct1);

      const { logs: secondAddLogs } = await whitelist.addToWhitelist([ acct1, acct2 ], { from: owner });
      assert.strictEqual(secondAddLogs.length, 1);
      assert.strictEqual(secondAddLogs[ 0 ].event, 'LogWhitelistAdd');
      assert.strictEqual(secondAddLogs[ 0 ].args.addr, acct2);
    });

    it('can take an array of addresses', async () => {
      await whitelist.addToWhitelist([], { from: owner });

      const { logs: firstAddLogs } = await whitelist.addToWhitelist([ acct1 ], { from: owner });
      assert.strictEqual(firstAddLogs.length, 1);
      assert.strictEqual(firstAddLogs[ 0 ].event, 'LogWhitelistAdd');
      assert.strictEqual(firstAddLogs[ 0 ].args.addr, acct1);

      const { logs: secondAddLogs } = await whitelist.addToWhitelist([ acct1, acct2 ], { from: owner });
      assert.strictEqual(secondAddLogs.length, 1);
      assert.strictEqual(secondAddLogs[ 0 ].event, 'LogWhitelistAdd');
      assert.strictEqual(secondAddLogs[ 0 ].args.addr, acct2);

      const { logs: thirdAddLogs } = await whitelist.addToWhitelist([ acct3, acct4, acct5 ], { from: owner });
      assert.strictEqual(thirdAddLogs.length, 3);
      assert.strictEqual(thirdAddLogs[ 0 ].event, 'LogWhitelistAdd');
      assert.strictEqual(thirdAddLogs[ 0 ].args.addr, acct3);
      assert.strictEqual(thirdAddLogs[ 1 ].event, 'LogWhitelistAdd');
      assert.strictEqual(thirdAddLogs[ 1 ].args.addr, acct4);
      assert.strictEqual(thirdAddLogs[ 2 ].event, 'LogWhitelistAdd');
      assert.strictEqual(thirdAddLogs[ 2 ].args.addr, acct5);
    });
  });


  //    function removeFromWhitelist(address[] addresses);
  //    event LogWhitelistRemove(address indexed addr);
  describe('#removeFromWhitelist', async () => {

    beforeEach('add accounts to whitelist', async () => {
      await whitelist.addToWhitelist([ acct1, acct2 ], { from: owner });
    });

    it('can only be called by owner', async () => {
      await expectThrow(whitelist.removeFromWhitelist([], { from: acct1 }));
      await expectThrow(whitelist.removeFromWhitelist([], { from: acct2 }));

      const { logs } = await whitelist.removeFromWhitelist([], { from: owner });
      assert.strictEqual(logs.length, 0);
    });

    it('removes it from the state', async () => {
      const whitelistedBefore = await  whitelist.isWhitelisted(acct1);
      assert.strictEqual(whitelistedBefore, true);

      await whitelist.removeFromWhitelist([ acct1 ], { from: owner });
      const whitelistedAfter = await whitelist.isWhitelisted(acct1);
      assert.strictEqual(whitelistedAfter, false);
    });

    it('is idempotent', async () => {
      const { logs: firstTxLogs } = await whitelist.removeFromWhitelist([ acct1 ], { from: owner });
      assert.strictEqual(firstTxLogs.length, 1);
      assert.strictEqual(firstTxLogs[ 0 ].event, 'LogWhitelistRemove');
      assert.strictEqual(firstTxLogs[ 0 ].args.addr, acct1);

      const { logs: secondTxLogs } = await whitelist.removeFromWhitelist([ acct1, acct2 ], { from: owner });
      assert.strictEqual(secondTxLogs.length, 1);
      assert.strictEqual(secondTxLogs[ 0 ].event, 'LogWhitelistRemove');
      assert.strictEqual(secondTxLogs[ 0 ].args.addr, acct2);
    });

    it('can take an array of addresses', async () => {
      await whitelist.addToWhitelist([ acct3, acct4, acct5 ], { from: owner });

      await whitelist.removeFromWhitelist([], { from: owner });

      const { logs: firstTxLogs } = await whitelist.removeFromWhitelist([ acct1 ], { from: owner });
      assert.strictEqual(firstTxLogs.length, 1);
      assert.strictEqual(firstTxLogs[ 0 ].event, 'LogWhitelistRemove');
      assert.strictEqual(firstTxLogs[ 0 ].args.addr, acct1);

      const { logs: secondTxLogs } = await whitelist.removeFromWhitelist([ acct1, acct2 ], { from: owner });
      assert.strictEqual(secondTxLogs.length, 1);
      assert.strictEqual(secondTxLogs[ 0 ].event, 'LogWhitelistRemove');
      assert.strictEqual(secondTxLogs[ 0 ].args.addr, acct2);

      const { logs: thirdTxLogs } = await whitelist.removeFromWhitelist([ acct3, acct4, acct5 ], { from: owner });
      assert.strictEqual(thirdTxLogs.length, 3);
      assert.strictEqual(thirdTxLogs[ 0 ].event, 'LogWhitelistRemove');
      assert.strictEqual(thirdTxLogs[ 0 ].args.addr, acct3);
      assert.strictEqual(thirdTxLogs[ 1 ].event, 'LogWhitelistRemove');
      assert.strictEqual(thirdTxLogs[ 1 ].args.addr, acct4);
      assert.strictEqual(thirdTxLogs[ 2 ].event, 'LogWhitelistRemove');
      assert.strictEqual(thirdTxLogs[ 2 ].args.addr, acct5);
    });
  });
});
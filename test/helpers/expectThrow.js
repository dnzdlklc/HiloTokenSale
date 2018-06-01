export default async promise => {
  try {
    await promise;
  } catch (error) {
    const { message } = error;

    const invalidOpcode = message.indexOf('invalid opcode') >= 0;
    const revert = message.indexOf('revert') >= 0;

    assert(
      invalidOpcode || revert,
      'Expected throw or revert, got \"' + message + '\" instead',
    );
    return;
  }
  assert.fail('Expected throw not received');
};
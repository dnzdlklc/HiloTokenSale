export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ONE_HOUR_SECONDS = 60 * 60;
export const ONE_DAY_SECONDS = ONE_HOUR_SECONDS * 24;

export const formatTime = t => (new Date(t * 1000)).toISOString();


export function withinPercentage(actual, expected, percentage = 0.1) {
  if (expected === 0) {
    if (actual.valueOf() === '0') {
      return;
    } else {
      throw new Error('division by 0');
    }
  }

  const percent = actual.sub(String(expected)).abs().div(String(expected)).mul(100);

  assert.strictEqual(
    percent.lessThan(percentage),
    true,
    `${actual.valueOf()} was not within ${percentage}% of ${expected}`
  );
}


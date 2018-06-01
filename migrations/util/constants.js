export const HILO_WALLET = '0x1c175d339e00e99daccb0cd14c50bf1bc4348ce8';
export const OWNER_WALLET = '0xbdFD4f31c55ccB866AB6Ff9ed2863F1A4ceaC8d6';
export const PRESALE_CONTRACT_ADDRESS = '0x998C31DBAD9567Df0DDDA990C0Df620B79F559ea';

const PLACEHOLDER_WALLET = '0x0000000000000000000000000000000000000001';

//////// THESE CONSTANTS SHOULD BE TRIPLE CHECKED /////////////

export const VESTED_TOKEN_CONTRACTS = {
  // FOUNDERS (total 150M)
  'Angelo': {
    wallet: '0x694a9b63ff8956f9149a69fdb662436c5353af11',
    stake: 60 * Math.pow(10, 6), // 60M
    stakeDuration: 72
  },
  'Deniz': {
    wallet: OWNER_WALLET,
    stake: 45 * Math.pow(10, 6), // 45M
    stakeDuration: 72
  },
  'Pascal': {
    wallet: '0x5a1ecbf485bfb23aa6e74393e9b26b40afd95da9',
    stake: 45 * Math.pow(10, 6), // 45M
    stakeDuration: 72
  },
  // ADVISERS (total 15M)
  'Ben': {
    wallet: '0xcf289684138CED39b29ED5a17f6aFE43963Fe55f',
    stake: (3.23232323 * Math.pow(10, 6)) + (0.36363636 * Math.pow(10, 6)),
    stakeDuration: 24
  },
  'Sean (pt. 1)': {
    wallet: '0x2D2b4a7826618A4B9D732Aa437F7bcd28204A6EC',
    stake: 2.020202 * Math.pow(10, 6),
    stakeDuration: 24
  },
  'Sean (pt. 2) & (optional)': {
    wallet: '0x5862EAFe15DEB92187FFF260Aae973668425D2fD',
    stake: (2.35690236 * Math.pow(10, 6)) + (1.01010101 * Math.pow(10, 6)),
    stakeDuration: 0
  },
  'Uwe (investment)': {
    wallet: '0x6282aF688d49Ea0BDC17f9E6E6a0F8b2b6D70692',
    stake: (1.21212121 * Math.pow(10, 6)) + (0.30303030 * Math.pow(10, 6)),
    stakeDuration: 24
  },
  'Angelo (investment)': {
    wallet: '0x694a9b63ff8956f9149a69fdb662436c5353af11',
    stake: 3.53198653 * Math.pow(10, 6),
    stakeDuration: 24
  },
  'Cathy (investment)': {
    wallet: '0x98B5201cdE8E2fec8DD3241793829dCC7Aa35f9e',
    stake: 0.60606060 * Math.pow(10, 6),
    stakeDuration: 24
  },
  'George (investment)': {
    wallet: '0x8ff8b997fbc09b5bcfd1887716a1fad17f03744a',
    stake: 0.36363636 * Math.pow(10, 6),
    stakeDuration: 24
  }
};

export const FIXED_CROWDSALE_USD_ETHER_PRICE = 660;

// Token constants, in HILO (a HILO has 18 decimals)
export const MAXIMUM_TOKEN_SUPPLY = 500 * Math.pow(10, 6);                // maximum HILO tokens to be minted at any given point
export const PRESALE_POOL = 18.95 * Math.pow(10, 6);                         // 18.95M HILO Pre-Sale Pool
export const MAINSALE_POOL = 90.91 * Math.pow(10, 6);                        // 90.91M HILO for Main-Sale Pool
export const HILO_RESERVE = 225.14 * Math.pow(10, 6);                    // 225.14M HILO Hilo Reserve Pool

//////// THESE CONSTANTS SHOULD BE TRIPLE CHECKED /////////////

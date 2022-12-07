import { Abi as abi } from '../contracts/Multicall';

export const HISTORY_TYPE = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

export const CONFIG = {
  LAST_BLOCK: 'last_block',
};

export default () => ({
  mongo_uri: process.env.MONGO_URL,
  environment: process.env.NODE_ENV,
  chainId: process.env.CHAIN_ID || 97,
  97: {
    appNodes: [
      'https://bsc-testnet.nodereal.io/v1/5cd049a82f194ba4b06adf80199ea40d',
      // "https://bsc-testnet.nodereal.io/v1/a45a0f7f736a4d9c9fac21eb722c2d97"
      // "https://bsc-testnet.nodereal.io/v1/29428fcbbb9d4e8eb33e3c98a9b9c9cc",
      // "https://bsc-testnet.nodereal.io/v1/29428fcbbb9d4e8eb33e3c98a9b9c9cc",
      // "https://bsc-testnet.nodereal.io/v1/29428fcbbb9d4e8eb33e3c98a9b9c9cc",
      // 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      // 'https://data-seed-prebsc-2-s2.binance.org:8545/',
      // 'https://data-seed-prebsc-2-s1.binance.org:8545/',
    ],
  },
  56: {
    appNodes: [
      'https://bsc-mainnet.nodereal.io/v1/c54bad219f4b44ac804b0c93fb85c726',
      // "https://bsc-mainnet.nodereal.io/v1/08f2d8ac70d944219436029af9a7b175",
    ],
  },
});

export const getTime = (now: any) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return `${
    monthNames[now?.getMonth()]
  } ${now?.getDate()}, ${now?.getFullYear()}, ${now?.getHours()}:${
    now?.getMinutes() < 10 ? `0${now?.getMinutes()}` : now?.getMinutes()
  }`;
};

export const GET_AMOUNT_LAUNCHPAD = {
  0: 1000,
  1: 3000,
  2: 5000,
  3: 10000,
  4: 20000,
};

export const SORT_BY = {
  newest: 'newest',
  oldest: 'oldest',
  highest: 'highest',
  lowest: 'lowest',
  alphabet: 'alphabet',
};

const MULTICALL_ADDRESS = {
  56: '0x38ce767d81de3940CFa5020B55af1A400ED4F657',
  97: '0x67ADCB4dF3931b0C5Da724058ADC2174a9844412',
  137: '0x95028E5B8a734bb7E2071F96De89BABe75be9C8E',
};

export const getMultiContract = (web3) => {
  const address = MULTICALL_ADDRESS[process.env.CHAIN_ID || 97];
  const contract = new web3.eth.Contract(abi, address);

  return contract;
};


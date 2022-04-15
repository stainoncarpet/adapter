/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import * as dotenv from "dotenv";

import { runTasks } from "./tasks/index";
import { HardhatUserConfig } from "hardhat/config";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();
runTasks();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ETHERSCAN_API_KEY: string;
      ALCHEMY_KEY: string;
      METAMASK_PRIVATE_KEY: string;
      METAMASK_PUBLIC_KEY: string;
      COINMARKETCAP_API_KEY: string;
      RINKEBY_URL: string;
    }
  }
}

export const FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
export const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const WETH_ADDRESS = "0xc778417e063141139fce010982780140aa0cd5ab";

const config: HardhatUserConfig = {
  solidity: "0.8.12",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [process.env.METAMASK_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000
    },
    hardhat: {
      forking: {
        url: process.env.RINKEBY_URL,
        blockNumber: 10503735,
      }
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
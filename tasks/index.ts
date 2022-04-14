/* eslint-disable prettier/prettier */
/* eslint-disable node/no-missing-require */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { task } from "hardhat/config";

const NETWORK = "rinkeby";

export const runTasks = async () => {
    task("stake", "Stake Uniswap Liquidity Provider Token for MyERC20Token")
        .addParam("staker", "Staker contract address")
        .addParam("pair", "Pair contract address")
        .addParam("amount", "Amount of Uniswap Liquidity Token to stake")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const stakerContractInstance = new hre.ethers.Contract(taskArguments.staker, contractSchema.abi, walletOwner);

            const stakeTx = await stakerContractInstance.stake(taskArguments.amount);

            console.log("Receipt: ", stakeTx);
        })
    ;

};
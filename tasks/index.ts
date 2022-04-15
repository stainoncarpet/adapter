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
    task("createpair", "Create new pair for swaps")
        .addParam("adapter", "Adapter contract address")
        .addParam("tokena", "Token A contract address")
        .addParam("tokenb", "Token B contract address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const adapterContractInstance = new hre.ethers.Contract(taskArguments.adapter, contractSchema.abi, walletOwner);

            const createPairTx = await adapterContractInstance.createPair(taskArguments.tokena, taskArguments.tokenb);

            console.log("Receipt: ", createPairTx);
        })
        ;

    task("addliquidity", "Add liquidity to token pair pool")
        .addParam("adapter", "Adapter contract address")
        .addParam("tokena", "Token A contract address")
        .addParam("tokenb", "Token B contract address")
        .addParam("amount0d", "Amount of tokenA to add as liquidity if the B/A price is <= amountBDesired/amountADesired (A depreciates)")
        .addParam("amount1d", "Amount of tokenB to add as liquidity if the A/B price is <= amountADesired/amountBDesired (B depreciates)")
        .addParam("amount0m", "Bounds the extent to which the B/A price can go up before the transaction reverts. Must be <= amountADesired")
        .addParam("amount1m", "Bounds the extent to which the A/B price can go up before the transaction reverts. Must be <= amountBDesired")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const adapterContractInstance = new hre.ethers.Contract(taskArguments.adapter, contractSchema.abi, walletOwner);

            const addLiquidityTx = await adapterContractInstance.addLiquidity(
                taskArguments.tokena,
                taskArguments.tokenb,
                taskArguments.amount0d,
                taskArguments.amount1d,
                taskArguments.amount0m,
                taskArguments.amount1m,
            );

            console.log("Receipt: ", addLiquidityTx);
        });

    task("addliquidityeth", "Add liquidity to token pair pool (involves ETH)")
        .addParam("adapter", "Adapter contract address")
        .addParam("token", "Token contract address")
        .addParam("amountd", "Amount of token to add as liquidity if the WETH/token price is <= msg.value/amountTokenDesired (token depreciates)")
        .addParam("amountm", "Bounds the extent to which the WETH/token price can go up before the transaction reverts. Must be <= amountTokenDesired")
        .addParam("amountem", "Bounds the extent to which the token/WETH price can go up before the transaction reverts. Must be <= msg.value")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const adapterContractInstance = new hre.ethers.Contract(taskArguments.adapter, contractSchema.abi, walletOwner);

            const addLiquidityTx = await adapterContractInstance.addLiquidityETH(
                taskArguments.token,
                taskArguments.amountd,
                taskArguments.amountm,
                taskArguments.amountem
            );

            console.log("Receipt: ", addLiquidityTx);
        });

    task("removeliquidity", "Removes liquidity from token pair pool")
        .addParam("adapter", "Adapter contract address")
        .addParam("tokena", "Token A contract address")
        .addParam("tokenb", "Token B contract address")
        .addParam("liquidity", "Amount of liquidity to remove")
        .addParam("amount0m", "Minimum amount of tokenA that must be received for the transaction not to revert")
        .addParam("amount1m", "Minimum amount of tokenB that must be received for the transaction not to revert")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const adapterContractInstance = new hre.ethers.Contract(taskArguments.adapter, contractSchema.abi, walletOwner);

            const removeLiquidityTx = await adapterContractInstance.removeLiquidity(
                taskArguments.tokena,
                taskArguments.tokenb,
                taskArguments.liquidity,
                taskArguments.amount0m,
                taskArguments.amount1m,
            );

            console.log("Receipt: ", removeLiquidityTx);
        });

    task("removeliquidityeth", "Removes liquidity from token pair pool (involves ETH)")
        .addParam("adapter", "Adapter contract address")
        .addParam("token", "Token contract address")
        .addParam("liquidity", "Amount of liquidity to remove")
        .addParam("amountm", "Minimum amount of token that must be received for the transaction not to revert")
        .addParam("amountem", "Minimum amount of ETH that must be received for the transaction not to revert")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const adapterContractInstance = new hre.ethers.Contract(taskArguments.adapter, contractSchema.abi, walletOwner);

            const removeLiquidityTx = await adapterContractInstance.removeLiquidityETH(
                taskArguments.token,
                taskArguments.liquidity,
                taskArguments.amountm,
                taskArguments.amountem,
            );

            console.log("Receipt: ", removeLiquidityTx);
        });

    task("updatepairprice", "Update pair price")
        .addParam("adapter", "Adapter contract address")
        .addParam("tokena", "Token A contract address")
        .addParam("tokenb", "Token B contract address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const adapterContractInstance = new hre.ethers.Contract(taskArguments.adapter, contractSchema.abi, walletOwner);

            const updatePairPriceTx = await adapterContractInstance.updatePairPrice(taskArguments.tokena, taskArguments.tokenb);

            console.log("Receipt: ", updatePairPriceTx);
        })
        ;

    task("makedirectswap", "Make swap between two tokens")
        .addParam("adapter", "Adapter contract address")
        .addParam("tokena", "Token A contract address")
        .addParam("tokenb", "Token B contract address")
        .addParam("amountin", "Amount of input tokens to send")
        .addParam("amountout", "Minimum amount of output tokens that must be received for the transaction not to revert")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const adapterContractInstance = new hre.ethers.Contract(taskArguments.adapter, contractSchema.abi, walletOwner);

            const directSwapTx = await adapterContractInstance.makeDirectSwap(
                taskArguments.tokena, 
                taskArguments.tokenb,
                taskArguments.amountin.
                taskArguments.amountout
            );

            console.log("Receipt: ", directSwapTx);
        })
        ;

    task("makepathswap", "Make swap between multiple tokens")
        .addParam("adapter", "Adapter contract address")
        .addParam("tokens", "String containing token addresses separated by whitespace")
        .addParam("amountin", "Amount of input tokens to send")
        .addParam("amountout", "Minimum amount of output tokens that must be received for the transaction not to revert")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Adapter.sol/Adapter.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const adapterContractInstance = new hre.ethers.Contract(taskArguments.adapter, contractSchema.abi, walletOwner);

            if(taskArguments.tokens.split(" ").length < 2) {
                throw new Error("Too few tokens");
            }

            const directSwapTx = await adapterContractInstance.makePathSwap(
                taskArguments.tokens.split(" "), 
                taskArguments.amountin.
                taskArguments.amountout
            );

            console.log("Receipt: ", directSwapTx);
        })
        ;
};
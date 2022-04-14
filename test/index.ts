/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
/* eslint-disable spaced-comment */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-missing-import */
/* eslint-disable import/no-duplicates */

import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, network, waffle } from "hardhat";
import { FACTORY_ADDRESS, ROUTER_ADDRESS, WETH_ADDRESS } from "../hardhat.config";
import { Token } from "../typechain";

const parseEth = ethers.utils.parseEther;
const formatEth = ethers.utils.formatEther;

describe("ACDM", () => {
  let ACDMToken, acdmToken: Contract, TSTToken, tstToken: Token, POPToken, popToken: Token, Adapter, adapter: Contract;
  let signers, deployer: { address: any; }, user1, user2, user3, user4, user5, user6;

  beforeEach(async () => {
    ACDMToken = await ethers.getContractFactory("Token");
    acdmToken = await ACDMToken.deploy(ethers.utils.parseEther("21000000"), "ACDMToken", "ACDM");
    await acdmToken.deployed();
  
    TSTToken = await ethers.getContractFactory("Token");
    tstToken = await TSTToken.deploy(ethers.utils.parseEther("42000000"), "TSTToken", "TST");
    await tstToken.deployed();
  
    POPToken = await ethers.getContractFactory("Token");
    popToken = await POPToken.deploy(ethers.utils.parseEther("84000000"), "POPToken", "POP");
    await popToken.deployed();
  
    Adapter = await ethers.getContractFactory("Adapter");
    adapter = await Adapter.deploy(ROUTER_ADDRESS, FACTORY_ADDRESS);
    await adapter.deployed();

    signers = await ethers.getSigners();
    [deployer, user1, user2, user3, user4, user5, user6] = signers;
  });

  it("Should create pairs", async () => {
    await adapter.createPair(acdmToken.address, tstToken.address);
    const pair = await adapter.pairs(acdmToken.address, tstToken.address);
    expect(pair).to.not.be.equal("0x00000000000000000000")
  });

  it("Should add liquidity to liquidity pool (ACDM/TST)", async () => {
    await adapter.createPair(acdmToken.address, tstToken.address);

    await acdmToken.approve(adapter.address, parseEth("100"));
    await tstToken.approve(adapter.address, parseEth("200"));
    
    await adapter.addLiquidity(
      acdmToken.address, 
      tstToken.address,
      parseEth("100"),
      parseEth("200"),
      parseEth("99"),
      parseEth("199")
    );
  });

  it("Should add liquidity to liquidity pool (POP/ETH)", async () => {
    await adapter.createPair(popToken.address, WETH_ADDRESS);
    await popToken.approve(adapter.address, parseEth("400"));
    
    await adapter.addLiquidityETH(
      popToken.address, 
      parseEth("400"),
      parseEth("390"),
      parseEth("0.99"),
      { value: parseEth("2") }
    );
  });

  it("Should remove liquidity from liquidity pool (ACDM/TST)", async () => {
    await adapter.createPair(acdmToken.address, tstToken.address);

    await acdmToken.approve(adapter.address, parseEth("100"));
    await tstToken.approve(adapter.address, parseEth("200"));
    
    await adapter.addLiquidity(
      acdmToken.address, 
      tstToken.address,
      parseEth("100"),
      parseEth("200"),
      parseEth("99"),
      parseEth("199")
    );
    
    const pair = await adapter.pairs(acdmToken.address, tstToken.address);
    const pairContract = await ethers.getContractAt([
      "function balanceOf(address owner) view returns (uint256 balance)",
      "function approve(address spender, uint256 value) external returns (bool)",
      "function allowance(address owner, address spender) external view returns (uint)"
    ], pair);

    const liquidityBeforeRemoval = await pairContract.balanceOf(deployer.address);

    await pairContract.approve(adapter.address, liquidityBeforeRemoval)
    
    await adapter.removeLiquidity(
      acdmToken.address, 
      tstToken.address,
      liquidityBeforeRemoval,
      parseEth("95"),
      parseEth("190"),
    );

    const liquidityAfterRemoval = await pairContract.balanceOf(deployer.address);

    expect(liquidityBeforeRemoval).to.not.be.equal(0);
    expect(liquidityAfterRemoval).to.be.equal(0);
  });
});
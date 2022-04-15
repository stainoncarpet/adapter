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
import { ethers } from "hardhat";
import { FACTORY_ADDRESS, ROUTER_ADDRESS, WETH_ADDRESS } from "../hardhat.config";
import { Token } from "../typechain";

const parseEth = ethers.utils.parseEther;
const formatEth = ethers.utils.formatEther;

const getContractInstance = async (addr: string) => {
  return await ethers.getContractAt([
    "function balanceOf(address owner) view returns (uint256 balance)",
    "function approve(address spender, uint256 value) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)"
  ], addr);
};

describe("Adapter & Tokens", () => {
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

    const pair = await adapter.pairs(popToken.address, WETH_ADDRESS);
    const pairContract = await getContractInstance(pair);

    await popToken.approve(adapter.address, parseEth("400"));
    
    const lpTokenLiquidityBefore = await pairContract.totalSupply();

    await adapter.addLiquidityETH(
      popToken.address, 
      parseEth("400"),
      parseEth("390"),
      parseEth("0.99"),
      { value: parseEth("1") }
    );

    const lpTokenLiquidityAfter = await pairContract.totalSupply();

    expect(lpTokenLiquidityBefore).to.be.equal(0);
    expect(lpTokenLiquidityAfter).to.not.be.equal(0);
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
    const pairContract = await getContractInstance(pair);

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
 
  it("Should remove liquidity from liquidity pool (POP/ETH)", async () => {
    await adapter.createPair(popToken.address, WETH_ADDRESS);

    const pair = await adapter.pairs(popToken.address, WETH_ADDRESS);
    const pairContract = await getContractInstance(pair);

    await popToken.approve(adapter.address, parseEth("400"));
    
    await adapter.addLiquidityETH(
      popToken.address, 
      parseEth("400"),
      parseEth("390"),
      parseEth("0.99"),
      { value: parseEth("1") }
    );

    const liquidityBeforeRemoval = await pairContract.balanceOf(deployer.address);

    await pairContract.approve(adapter.address, liquidityBeforeRemoval);
    
    await adapter.removeLiquidityETH(
      popToken.address, 
      liquidityBeforeRemoval,
      parseEth("399"),
      parseEth("0.99"),
    );

    const liquidityAfterRemoval = await pairContract.balanceOf(deployer.address);

    expect(parseFloat(liquidityBeforeRemoval)).to.be.greaterThan(0);
    expect(parseFloat(liquidityAfterRemoval)).to.be.equal(0);
  });

  it("Should get pair price", async () => {
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

    // update and then fetch price, has to be done in two steps
    // function return values aren't available offchain
    await adapter.updatePairPrice(acdmToken.address, tstToken.address);
    const pairPrice = await adapter.prices(acdmToken.address, tstToken.address);
    const roundedPairPrice = Math.round(parseFloat(formatEth(pairPrice)));
    
    // ACDM should be roughly 2x of TST + fees
    expect(roundedPairPrice).to.be.equal(2);
  });

  it("Should make direct swap", async () => {
    await adapter.createPair(acdmToken.address, tstToken.address);
    const pair = await adapter.pairs(acdmToken.address, tstToken.address);
   
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

    // allow adapter to spend additional 30 ACDM
    await acdmToken.approve(adapter.address, parseEth("30"));

    const acdmLiquidityBeforeSwap = await acdmToken.balanceOf(pair);

    // Uniswap gets 30 ACDM as result of swap
    await adapter.makeDirectSwap(
      acdmToken.address, 
      tstToken.address,
      parseEth("30"),
      parseEth("0")
    )

    const acdmLiquidityAfterSwap = await acdmToken.balanceOf(pair);

    expect(acdmLiquidityAfterSwap.sub(acdmLiquidityBeforeSwap)).to.be.equal(parseEth("30"));
  });

  it("Should make path swap", async () => {
    await adapter.createPair(tstToken.address, acdmToken.address);
    await adapter.createPair(acdmToken.address, popToken.address);
   
    await acdmToken.approve(adapter.address, parseEth("10000"));
    await tstToken.approve(adapter.address, parseEth("20000"));

    await adapter.addLiquidity(
      tstToken.address,
      acdmToken.address, 
      parseEth("20000"),
      parseEth("10000"),
      parseEth("19500"),
      parseEth("9500")
    );

    await acdmToken.approve(adapter.address, parseEth("10000"));
    await popToken.approve(adapter.address, parseEth("40000"));

    await adapter.addLiquidity(
      acdmToken.address,
      popToken.address,
      parseEth("10000"),
      parseEth("40000"),
      parseEth("9500"),
      parseEth("38000")
    );

    await tstToken.approve(adapter.address, parseEth("10000"));

    const popTokenBalanceBeforeSwap = await popToken.balanceOf(deployer.address);

    await adapter.makePathSwap(
      [tstToken.address, acdmToken.address, popToken.address],
      parseEth("10"),
      parseEth("0")
    );
    
    const popTokenBalanceAfterSwap = await popToken.balanceOf(deployer.address);

    // tst = 2 x pop, 10 tst should turn into 19.860408873594498 (roughly 20 pop)
    expect(parseInt(formatEth(popTokenBalanceAfterSwap.sub(popTokenBalanceBeforeSwap)))).to.be.equal(19);
    expect(Math.round(parseFloat(formatEth(popTokenBalanceAfterSwap.sub(popTokenBalanceBeforeSwap))))).to.be.equal(20);
  });
});
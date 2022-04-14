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
import { FACTORY_ADDRESS, ROUTER_ADDRESS } from "../hardhat.config";
import { Token } from "../typechain";

const parseEth = ethers.utils.parseEther;
const formatEth = ethers.utils.formatEther;

describe("ACDM", () => {
  let ACDMToken, acdmToken: Contract, TSTToken, tstToken: Token, POPToken, popToken, Adapter, adapter: Contract;
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

  it("Should add liquidity to liquidity pool", async () => {
    await adapter.createPair(acdmToken.address, tstToken.address);
    const pair = await adapter.pairs(acdmToken.address, tstToken.address);

    // user allows adapter to manage tokens
    // await acdmToken.approve(adapter.address, parseEth("100"));
    // await tstToken.approve(adapter.address, parseEth("200"));

    // user allows pair to manage tokens
    await acdmToken.approve(pair, parseEth("100"));
    await tstToken.approve(pair, parseEth("200"));
    
    await adapter.addLiquidity(
      acdmToken.address, 
      tstToken.address,
      parseEth("100"),
      parseEth("200"),
      parseEth("99"),
      parseEth("199")
    );
  });
});
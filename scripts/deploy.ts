/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */

import { ethers } from "hardhat";
import { FACTORY_ADDRESS, ROUTER_ADDRESS } from "../hardhat.config";

const main = async () => {
  const ACDMToken = await ethers.getContractFactory("Token");
  const acdmToken = await ACDMToken.deploy(ethers.utils.parseEther("21000000"), "ACDMToken", "ACDM");
  await acdmToken.deployed();

  const TSTToken = await ethers.getContractFactory("Token");
  const tstToken = await TSTToken.deploy(ethers.utils.parseEther("42000000"), "TSTToken", "TST");
  await tstToken.deployed();

  const POPToken = await ethers.getContractFactory("Token");
  const popToken = await POPToken.deploy(ethers.utils.parseEther("84000000"), "POPToken", "POP");
  await popToken.deployed();

  const Adapter = await ethers.getContractFactory("Adapter");
  const adapter = await Adapter.deploy(ROUTER_ADDRESS, FACTORY_ADDRESS);
  await adapter.deployed();

  console.log("ACDMToken deployed to:", acdmToken.address, "by", await acdmToken.signer.getAddress());
  console.log("TSTToken deployed to:", tstToken.address, "by", await tstToken.signer.getAddress());
  console.log("POPToken deployed to:", popToken.address, "by", await popToken.signer.getAddress());
  console.log("Adapter deployed to:", adapter.address, "by", await adapter.signer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
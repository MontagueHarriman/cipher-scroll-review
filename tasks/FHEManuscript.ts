import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FHEManuscript } from "../types";

task("fheManuscript:getTotal", "Get total number of manuscripts")
  .addParam("address", "The contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const fheManuscript = (await hre.ethers.getContractAt("FHEManuscript", taskArgs.address)) as FHEManuscript;
    const total = await fheManuscript.getTotalManuscripts();
    console.log(`Total manuscripts: ${total}`);
  });

task("fheManuscript:getManuscript", "Get manuscript details")
  .addParam("address", "The contract address")
  .addParam("id", "The manuscript ID")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const fheManuscript = (await hre.ethers.getContractAt("FHEManuscript", taskArgs.address)) as FHEManuscript;
    const [encryptedContent, author, timestamp, exists] = await fheManuscript.getManuscript(taskArgs.id);
    console.log(`Manuscript ID: ${taskArgs.id}`);
    console.log(`Author: ${author}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Exists: ${exists}`);
    console.log(`Encrypted Content (handle): ${encryptedContent}`);
  });

task("fheManuscript:getAuthorManuscripts", "Get all manuscript IDs for an author")
  .addParam("address", "The contract address")
  .addParam("author", "The author address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const fheManuscript = (await hre.ethers.getContractAt("FHEManuscript", taskArgs.address)) as FHEManuscript;
    const manuscriptIds = await fheManuscript.getAuthorManuscripts(taskArgs.author);
    console.log(`Author: ${taskArgs.author}`);
    console.log(`Manuscript IDs: ${manuscriptIds.join(", ")}`);
  });


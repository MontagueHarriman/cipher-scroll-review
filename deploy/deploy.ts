import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHEManuscript = await deploy("FHEManuscript", {
    from: deployer,
    log: true,
  });

  console.log(`FHEManuscript contract: `, deployedFHEManuscript.address);
};
export default func;
func.id = "deploy_fheManuscript"; // id required to prevent reexecution
func.tags = ["FHEManuscript"];


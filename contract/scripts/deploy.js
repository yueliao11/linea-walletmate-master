const hre = require("hardhat");

async function main() {
  const LineaAdvisor = await hre.ethers.getContractFactory("LineaAdvisor");
  const advisor = await LineaAdvisor.deploy();
  await advisor.waitForDeployment();
  
  console.log("LineaAdvisor deployed to:", await advisor.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const baseURI = "http://localhost/nft2/";
  const signerAddress = "0xb568Ae18D051618dB3600773F90C0c5B9F4A7269";

  const nft = await hre.ethers.deployContract("GlacierCollHubNFT1155", [baseURI, signerAddress]);
  console.log('pre deploy...')
  await nft.waitForDeployment();
  console.log('post deploy...')

  console.log(
   `$deployed to ${nft.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

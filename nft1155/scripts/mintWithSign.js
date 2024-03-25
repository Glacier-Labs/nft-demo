// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x89AeE348F429464fF9Cbae51A0A09Bb9e08d5E6c";
  const nft = await hre.ethers.getContractAt("GlacierCollHubNFT1155", contractAddress);

  const params = {"signature":"0xe3ee4045da933881e9205469deea548fb10a9637532a1a0b564604dde6a0f50b1b9a9e81b8f0f497aa1986f40436bf2e642ed6e53cbd9bff814a15da153e348f1b","collhash":"acfee7581d1a3223fe1a6ab2620c7e08387f380a83354bac3c81eca5f7d60a4c","collector":"0x830f93b43a737a7b45d84b1631c58e8fe54d0afc"}

  _mint(nft, params)
}

async function _mint(nft, params) {
  const tx = await nft.mintCollectionWithSign(params.collector, params.collhash, params.signature)
  console.log(`tx: ${JSON.stringify(tx)}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

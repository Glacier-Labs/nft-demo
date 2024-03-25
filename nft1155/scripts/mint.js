// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const contractAddress = "0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D";
  const nft = await hre.ethers.getContractAt("GlacierCollHubNFT1155", contractAddress);

  const collection = "acfee7581d1a3223fe1a6ab2620c7e08387f380a83354bac3c81eca5f7d60a4c"
  const collector = "0xb568Ae18D051618dB3600773F90C0c5B9F4A7269"

  const tx = await nft.mintCollection(collector, collection)
  console.log(`tx: ${JSON.stringify(tx)}`)
  // console.log(await nft.collectionIds('acfee7581d1a3223fe1a6ab2620c7e08387f380a83354bac3c81eca5f7d60a4c'))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

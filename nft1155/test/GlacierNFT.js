const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require('crypto');  

describe("GlacierNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const name = "Glacier Collection NFT";
    const symbol = "GLC";
    const baseURI = "http://localhost/nft"
  
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, signer] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("GlacierCollHubNFT");
    const nft = await NFT.deploy(name, symbol, baseURI, signer.address);

    return { nft, name, symbol, baseURI, owner, otherAccount, signer };
  }
  describe("sign", function () {
    it("xx", async function() {

    // 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    const [owner, otherAccount, alice, bob, treasure] = await ethers.getSigners();
    const signer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
    console.log(signer.address);
    // console.log('...')
    // console.log("sign", "xx")
    console.log("sign", await createWhitelistSignature(signer, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', "hello"))
    })
  })

  describe("Deployment", function () {
    it("Should set the right value", async function () {
      const { nft, name, symbol } = await loadFixture(deployOneYearLockFixture);

      expect(await nft.name()).to.equal(name);
      expect(await nft.symbol()).to.equal(symbol);
    });

    it("Should mint", async function () {
      const { nft, owner, baseURI, otherAccount, signer } = await loadFixture(deployOneYearLockFixture);

      const namespace = 'test'
      const dataset = 'test'
      let collection = 'test'
      let hash = crypto.createHash('sha256').update(`${namespace}:${dataset}:${collection}`).digest('hex');  

      console.log(await nft.mintNFT(otherAccount, hash))

      expect(await nft.balanceOf(otherAccount)).to.equal(1);
      const tokenURI = `${baseURI}/${hash}1/meta`

      expect(await nft.tokenURI(1)).to.equal(tokenURI)

      await expect(nft.connect(otherAccount).mintNFT(owner, hash)).revertedWith(/is missing role/);

      const buffer = Buffer.from("MINTER_ROLE", 'utf8')
      const MINTER_ROLE = ethers.keccak256(new Uint8Array(buffer))

      // Add New Minter
      await nft.grantRole(MINTER_ROLE, otherAccount)
      console.log('MinterRole:', MINTER_ROLE)
      console.log('TokenURI:', tokenURI)
      // 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6

      await expect(nft.connect(otherAccount).mintNFT(owner, hash)).revertedWith(/already minted/);

      collection = 'test2'
      hash = crypto.createHash('sha256').update(`${namespace}:${dataset}:${collection}`).digest('hex');  

      // mint with sign
      const sign = await createWhitelistSignature(signer, owner.address, hash)
      console.log("signer:", signer.address, sign)

      console.log(await nft.mintNFTWithSign(owner.address, hash, sign))

      // invalid sign
      const invalidSign = await createWhitelistSignature(signer, owner.address, hash + "x")
      await expect(nft.mintNFTWithSign(owner.address, hash, invalidSign)).rejectedWith('invalid signature')

      expect(await nft.balanceOf(owner)).to.equal(1);
      const tokenURI1 = `${baseURI}/${hash}1/meta`
      expect(await nft.tokenURI(2)).to.equal(tokenURI1)
    });
  });
});

async function createWhitelistSignature(signer, address, hash) {
  const addressHash = ethers.solidityPackedKeccak256([ "string", "string", "address" ], [hash, '@', address.toLowerCase()])
  return signer.signMessage(ethers.getBytes(addressHash))
}
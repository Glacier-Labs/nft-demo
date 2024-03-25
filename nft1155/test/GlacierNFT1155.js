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
    const baseURI = "http://localhost/nft"
  
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, signer] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("GlacierCollHubNFT1155");
    const nft = await NFT.deploy(baseURI, signer.address);

    return { nft, baseURI, owner, otherAccount, signer };
  }
  describe("sign", function () {
    it("xx", async function() {

    // 0xb568Ae18D051618dB3600773F90C0c5B9F4A7269
    const [owner, otherAccount, alice, bob, treasure] = await ethers.getSigners();
    const signer = new ethers.Wallet('0xd5c2893cf42f2c262cefb728355b8d9b7a197ee093ac2845d3b60b9027738450')
    console.log(signer.address);
    // console.log('...')
    // console.log("sign", "xx")
    console.log("sign", await createWhitelistSignature(signer, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', "hello"))
    })
  })

  describe("Deployment", function () {
    it("Should mint", async function () {
      const { nft, owner, baseURI, otherAccount, signer } = await loadFixture(deployOneYearLockFixture);

      const namespace = 'test'
      const dataset = 'test'
      let collection = 'test'
      let hash = crypto.createHash('sha256').update(`${namespace}:${dataset}:${collection}`).digest('hex');  

      console.log(await nft.mintCollection(otherAccount, hash))

      let tokenId = 1

      expect(await nft.balanceOf(otherAccount, tokenId)).to.equal(1);
      const tokenURI = `${baseURI}/${hash}1/meta`

      expect(await nft.uri(tokenId)).to.equal(tokenURI)

      await expect(nft.connect(otherAccount).mintCollection(owner, hash)).revertedWith(/is missing role/);

      const buffer = Buffer.from("MINTER_ROLE", 'utf8')
      const MINTER_ROLE = ethers.keccak256(new Uint8Array(buffer))

      // Add New Minter
      await nft.grantRole(MINTER_ROLE, otherAccount)
      console.log('MinterRole:', MINTER_ROLE)
      console.log('TokenURI:', tokenURI)
      // 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6

      await expect(nft.connect(otherAccount).mintCollection(owner, hash)).revertedWith(/already minted/);

      collection = 'test2'
      hash = crypto.createHash('sha256').update(`${namespace}:${dataset}:${collection}`).digest('hex');  

      // mint with sign
      const sign = await createWhitelistSignature(signer, owner.address, hash)
      console.log("signer:", signer.address, sign)

      console.log(await nft.mintCollectionWithSign(owner.address, hash, sign))

      await expect(nft.mintCollectionWithSign(owner.address, hash, sign)).rejectedWith('already minted')

      // invalid sign
      const invalidSign = await createWhitelistSignature(signer, owner.address, hash + "x")
      await expect(nft.mintCollectionWithSign(owner.address, hash, invalidSign)).rejectedWith('already minted')

      await expect(nft.mintCollectionWithSign(owner.address, "x", invalidSign)).rejectedWith('invalid signature')

      tokenId = 2
      expect(await nft.balanceOf(owner, tokenId)).to.equal(1);
      const tokenURI1 = `${baseURI}/${hash}1/meta`
      expect(await nft.uri(tokenId)).to.equal(tokenURI1)

      // nft owner mint
      await nft.mintByOwner(tokenId, 100)
      expect(await nft.balanceOf(owner, tokenId)).to.equal(101);

      // transfer
      expect(await nft.balanceOf(otherAccount, tokenId)).to.equal(0);
      await nft.safeTransferFrom(owner, otherAccount, tokenId, 100, ethers.toUtf8Bytes("hello glacier"));
      expect(await nft.balanceOf(owner, tokenId)).to.equal(1);
      expect(await nft.balanceOf(otherAccount, tokenId)).to.equal(100);
    });

    it("Should mint by nft-api", async function () {
      const { nft, owner, baseURI, otherAccount } = await loadFixture(deployOneYearLockFixture);

      await nft.setSignerAddress("0xb568Ae18D051618dB3600773F90C0c5B9F4A7269".toLowerCase())
      expect((await nft.signerAddress()).toLowerCase()).to.equal("0xb568Ae18D051618dB3600773F90C0c5B9F4A7269".toLowerCase())

      const params = {"signature":"0xe3ee4045da933881e9205469deea548fb10a9637532a1a0b564604dde6a0f50b1b9a9e81b8f0f497aa1986f40436bf2e642ed6e53cbd9bff814a15da153e348f1b","collhash":"acfee7581d1a3223fe1a6ab2620c7e08387f380a83354bac3c81eca5f7d60a4c","collector":"0x830f93b43a737a7b45d84b1631c58e8fe54d0afc"}

      console.log(await nft.mintCollectionWithSign(params.collector, params.collhash, params.signature))

      let tokenId = 1
      expect(await nft.balanceOf(params.collector, tokenId)).to.equal(1);
      const tokenURI = `${baseURI}/${params.collhash}1/meta`

      expect(await nft.uri(tokenId)).to.equal(tokenURI)
    });
  });
});

async function createWhitelistSignature(signer, address, hash) {
  const addressHash = ethers.solidityPackedKeccak256([ "string", "string", "address" ], [hash, '@', address.toLowerCase()])
  return signer.signMessage(ethers.getBytes(addressHash))
}
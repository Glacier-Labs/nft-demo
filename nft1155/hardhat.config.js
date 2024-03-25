require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

OPBNB_PRIVATE_KEY = process.env.OPBNB_PRIVATE_KEY
NODEREAL_API_KEY = process.env.NODEREAL_API_KEY
BSCMAINNET_PRIVATE_KEY = process.env.BSCMAINNET_PRIVATE_KEY
LOCALHOST_PRIVATE_KEY = process.env.LOCALHOST_PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    opbnbtestnet: {
      url: `https://opbnb-testnet.nodereal.io/v1/${NODEREAL_API_KEY}`,
      chainId: 5611,
      accounts: [OPBNB_PRIVATE_KEY],
      gasPrice: 200000000
    },
    bsctestnet: {
      url: `https://bsc-testnet.nodereal.io/v1/${NODEREAL_API_KEY}`,
      chainId: 97,
      accounts: [OPBNB_PRIVATE_KEY]
    },
    // bscmainnet: {
    //   url: `https://bsc-mainnet.nodereal.io/v1/${NODEREAL_API_KEY}`,
    //   chainId: 56,
    //   accounts: [BSCMAINNET_PRIVATE_KEY]
    // },
    localhost: {
      url: `http://127.0.0.1:8545`,
      chainId: 31337,
      accounts: [        "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e", 
      "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0",
      "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd",
      "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0",
      "0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa"]
    }
  },
  etherscan: {
    apiKey: {
      opbnbtestnet: NODEREAL_API_KEY,//replace your nodereal API key
      bsctestnet: NODEREAL_API_KEY,//replace your nodereal API key
    },
   customChains: [
    {
     network: "opbnbtestnet",
     chainId: 5611,
     urls: {
       apiURL:  `https://open-platform.nodereal.io/${NODEREAL_API_KEY}/op-bnb-testnet/contract/`,
       browserURL: "https://opbnbscan.com/",
     },
    },
    {
      network: "bsctestnet",
      chainId: 97,
      urls: {
        apiURL:  `https://open-platform.nodereal.io/${NODEREAL_API_KEY}/bsc-bnb-testnet/contract/`,
        browserURL: "https://opbnbscan.com/",
      },
     },
   ],
   },
};

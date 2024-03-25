import { getSha256Hex } from "../common/hash.ts";
import { Bad } from "../common/http.ts";
import { collectionDetail } from "./glacierscan.ts";
import {
  MintStatus,
  NFTContract,
  NFTMintable,
  NFTmintedModel,
} from "./types.ts";
import ethers from "npm:ethers@^5.7";
import * as config from "../common/config.ts";
import { ABI } from "./abi.ts";
import { sleep } from "../common/util.ts";

const signer = new ethers.Wallet(
  config.SIGNER_PRIVATE_KEY || "",
);

export function contracts(): Array<NFTContract> {
  return [{
    chain_id: "5611",
    chain: "opbnb-testnet",
    rpc: "https://opbnb-testnet-rpc.bnbchain.org",
    contract: "0x89AeE348F429464fF9Cbae51A0A09Bb9e08d5E6c",
    // scan: "https://opbnb-testnet.bscscan.com/address/0x89aee348f429464ff9cbae51a0a09bb9e08d5e6c",
  }, {
    chain_id: "31337",
    chain: "localhost",
    rpc: "http://127.0.0.1:8545",
    contract: "0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D",
  }];
}

export async function mintedNFTs(owner: string) {
  const docs = await NFTmintedModel.find({
    owner: owner,
    status: MintStatus.Minted,
  });
  return docs;
}

export async function mintable(
  chain: string,
  namespace: string,
  dataset: string,
  collection: string,
): Promise<NFTMintable> {
  const nftContract = contracts().filter((c) => c.chain == chain);
  if (nftContract.length === 0) {
    throw Bad("unsupported chain");
  }

  const collhash = getSha256Hex(
    `${namespace}:${dataset}:${collection}`,
  ) as string;
  const query = { _id: collhash, chain: chain };
  const doc = await NFTmintedModel.findOne(query);

  // already minted
  if (doc && doc.txhash) {
    return { mintable: false, params: undefined };
  }

  if (doc && doc.signature && doc.owner) {
    return {
      mintable: true,
      params: {
        signature: doc.signature,
        collhash: collhash,
        collector: doc.owner,
      },
    };
  }

  // check collection
  const detail = await collectionDetail(namespace, dataset, collection);
  if (detail.seqId == 0) {
    const signature = await createMintSignature(signer, detail.owner, collhash);
    await NFTmintedModel.insertMany([{
      _id: collhash,
      namespace: namespace,
      dataset: dataset,
      collection: collection,
      owner: detail.owner,
      chain: chain,
      chain_id: nftContract[0].chain_id,
      contract: nftContract[0].contract,
      signature: signature,
      status: MintStatus.Requested,
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    return {
      mintable: true,
      params: {
        signature,
        collhash,
        collector: detail.owner,
      },
    };
  }

  return { mintable: false, params: undefined };
}

export async function callbackNFT(
  chain: string,
  collhash: string,
  txhash: string,
) {
  const query = { _id: collhash, chain: chain };
  const exists = await NFTmintedModel.exists(query);
  if (!exists) {
    return [false, "mint first"];
  }

  const query1 = { _id: collhash, chain: chain, txhash: { "$ne": "" } };
  const res = await NFTmintedModel.updateOne(query1, {
    "$set": {
      "txhash": txhash,
      "status": MintStatus.Minting,
      "updated_at": new Date(),
    },
  });

  console.log(`NFTmintedModel.updateOne: ${JSON.stringify(res)}`)

  watchTx(chain, txhash, collhash, 60);
  return [true, ""];
}

// internal helper

function createMintSignature(
  signer: ethers.Wallet,
  collecor: string,
  collhash: string,
) {
  const addressHash = ethers.utils.solidityKeccak256([
    "string",
    "string",
    "address",
  ], [collhash, "@", collecor.toLowerCase()]);
  return signer.signMessage(ethers.utils.arrayify(addressHash));
}

async function watchTx(
  chain: string,
  txhash: string,
  collhash: string,
  maxTries: number,
) {
  if (maxTries < 0) {
    return;
  }

  // sleep 1s
  await sleep(1000)

  const nftContracts = contracts().filter((c) => c.chain == chain);
  if (nftContracts.length === 0) {
    throw Bad("unsupported chain");
  }
  const nftContract = nftContracts[0];

  const provider = new ethers.providers.JsonRpcProvider(nftContract.rpc);
  const tx = await provider.getTransaction(txhash);
  console.log(`getTransaction: ${txhash}, ${tx.confirmations}, ${nftContract.contract}`)
  if (tx && tx.confirmations >= 5) {
    const nft = ethers.ContractFactory.getContract(nftContract.contract, ABI, provider.getSigner());
    console.log(`NFT: ${collhash}`)
    const tokenId = await nft.collectionIds(collhash);
    console.log(`0 - watchTx: ${collhash}, minting tokenId ${tokenId}`)
    if (tokenId) {
      console.log(`watchTx: ${collhash}, minting tokenId ${tokenId}`)

      const doc = await NFTmintedModel.findOne({_id: collhash})
      if (doc && doc.status === MintStatus.Minted) {
        return
      }

      console.log(`watchTx: ${collhash}, minted`)

      await NFTmintedModel.updateOne({
        chain: chain,
        txhash: txhash,
        _id: collhash,
      }, {
        "$set": {
          "token_id": tokenId,
          "status": MintStatus.Minted,
          "updated_at": new Date(),
        },
      });
    }
  } else {
    watchTx(chain, txhash, collhash, maxTries - 1);
  }
}

export function startNFTEventListener() {
  contracts().forEach((nftContract) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(nftContract.rpc);

      const nft = ethers.ContractFactory.getContract(
        nftContract.contract,
        ABI,
        provider.getSigner(),
      );
      
      nft.on('MintCollection', (operator, collecor, collhash, tokenId, amount, event: ethers.Event) => {
        console.log(operator, collecor, collhash, tokenId, amount, JSON.stringify(event))

        const txhash = event.transactionHash;
        try {
          watchTx(nftContract.chain, txhash, collhash, 60);
        } catch (error) {
          console.log(`startNFTEventListener, watchTx MintCollection, error: ${error}`) 
        }
      });
    } catch (error) {
      console.log(`startNFTEventListener, error: ${error}`);
    }
  });
}

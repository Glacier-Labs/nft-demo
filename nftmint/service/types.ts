import { model, Schema } from "npm:mongoose@8.2.0";

export enum MintStatus {
  Requested,
  Minting,
  Minted
}

export interface GlacierCollectionDetail {
  seqSpace: string
  namespace: string
  dataset: string
  collection: string
  schema: string
  owner: string
  seqId: number 
  createdAt: number
  updatedAt: number
}

export interface NFTContract {
  chain_id: string;
  chain: string;
  rpc: string;
  contract: string;
}

export interface NFTMintable {
  mintable: boolean;
  params: {
    collhash: string;
    signature: string;
    collector: string;
  } | undefined;
}

const nftMinted = new Schema({
  _id: String, // hash(namespace:dataset:collection)
  namespace: String,
  dataset: String,
  collection: String,
  owner: String,
  chain: String,
  chain_id: String,
  contract: String,
  token_id: String,
  txhash: String,
  status: Number, // 0(requestMint) -> 1(minting) -> 2(minted)
  signature: String,
  created_at: Date,
  updated_at: Date,
});

export const NFTmintedModel = model("NFTminted", nftMinted);

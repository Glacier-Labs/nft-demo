import axios from 'axios'
import config from './config'

const api = axios.create({
  baseURL: config.apiGateway,
  validateStatus: status => status < 500
})

export interface ContractItem {
  chain_id: string
  chain: string
  rpc: string
  contract: string
}

export interface MintableResp {
  mintable: boolean
  params: {
    signature: string
    collhash: string
    collector: string
  }
}

export interface NFTItem {
  _id: string
  name: string
  description: string
  image: string
  token_id: string
  contract: string
  chain: string
}

export interface ApiResp<T = any> {
  result: string
  data: T
}

export async function contracts() {
  const { data } = await api.get<ApiResp<ContractItem[]>>('/nft/contracts')
  if (data.result === 'ok') return data.data
  return []
}

export async function mintable(
  chain: string,
  namespace: string,
  dataset: string,
  collection: string
) {
  const params = new URLSearchParams()
  params.set('chain', chain)
  params.set('namespace', namespace)
  params.set('dataset', dataset)
  params.set('collection', collection)
  const url = `/nft/mintable?${params.toString()}`
  const { data } = await api.get<ApiResp<MintableResp>>(url)
  return data
}

export async function callback(
  chain: string,
  collhash: string,
  txhash: string
) {
  const params = new URLSearchParams()
  params.set('chain', chain)
  params.set('collhash', collhash)
  params.set('txhash', txhash)
  const url = `/nft/callback?${params.toString()}`
  const { data } = await api.get<ApiResp>(url)
  return data
}

export async function nfts(collector: string) {
  const { data } = await api.get<ApiResp<NFTItem[]>>(
    `/nft/minted?collector=${collector}`
  )
  return data
}

export async function nftDetail(id: string) {
  const { data } = await axios.get<NFTItem>(
    `https://glcnft.deno.dev/api/${id}1/meta`
  )
  return data
}

export function shortAddr(address: string, len = 4) {
  return `${address.slice(0, len + 2)}..${address.slice(-len)}`
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = error => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

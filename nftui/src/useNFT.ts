import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider
} from '@web3modal/ethers/react'
import { BrowserProvider, Contract } from 'ethers'
import { message } from 'antd'
import { GlacierClient } from '@glacier-network/client'
import config from './config'
import * as service from './service'

const ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'collector',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'coll',
        type: 'string'
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes'
      }
    ],
    name: 'mintCollectionWithSign',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

export default function useNFT() {
  const { chainId, address } = useWeb3ModalAccount()
  const [contract, setContract] = useState<service.ContractItem>()
  const [items, setItems] = useState<service.NFTItem[]>([])
  const { walletProvider } = useWeb3ModalProvider()

  const account = useMemo(() => {
    if (chainId === config.network.chainId) return address
    return undefined
  }, [chainId, address])

  const provider = useMemo(() => {
    if (!walletProvider) return
    return new BrowserProvider(walletProvider!)
  }, [walletProvider])

  const client = useMemo(() => {
    if (!walletProvider) return
    return new GlacierClient(config.glacierEndpoint, {
      provider: walletProvider
    })
  }, [walletProvider])

  const getContracts = useCallback(async () => {
    const result = await service.contracts()
    setContract(result[0])
  }, [])

  const getMintable = useCallback(
    async (namespace: string, dataset: string, collection: string) => {
      if (!contract) return undefined
      try {
        const result = await service.mintable(
          contract.chain,
          namespace,
          dataset,
          collection
        )
        if (result.result === 'ok') {
          return result.data
        } else {
          return undefined
        }
      } catch (error) {
        return undefined
      }
    },
    [contract]
  )

  const listNFTs = useCallback(async () => {
    if (!account) return
    try {
      message.loading('Loading...', 0)
      const result = await service.nfts(account)
      const actions = result.data.map(item => service.nftDetail(item._id))
      const nfts = await Promise.all(actions)
      const items = result.data.map((item, i) => {
        const nft = {
          ...item,
          ...nfts[i]
        }
        return nft
      })
      setItems(items)
    } finally {
      message.destroy()
    }
  }, [account])

  const mint = useCallback(
    async (
      namespace: string,
      dataset: string,
      collection: string,
      description: string,
      img: File,
      mintable: service.MintableResp
    ) => {
      if (!contract || !client || !provider) return
      const image = await service.fileToBase64(img)
      const doc = {
        description: description.trim(),
        external_url: 'https://glacier.io/',
        image,
        name: collection
      }
      await client
        .namespace(namespace)
        .dataset(dataset)
        .collection(collection)
        .insertOne(doc)
      const singer = await provider.getSigner()
      const nft = new Contract(contract.contract, ABI, singer)
      const { params } = mintable
      const trans = await nft.mintCollectionWithSign(
        params.collector,
        params.collhash,
        params.signature
      )
      await trans.wait(1)
      const tx = trans.hash
      const result = await service.callback(contract.chain, params.collhash, tx)
      return result.result
    },
    [client, contract, provider]
  )

  useEffect(() => {
    getContracts()
  }, [getContracts])

  return {
    account,
    items,
    client,
    mint,
    listNFTs,
    getMintable
  }
}

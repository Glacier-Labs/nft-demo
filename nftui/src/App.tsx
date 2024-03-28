import { useState, useEffect } from 'react'
import { Button, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useWeb3Modal, useDisconnect } from '@web3modal/ethers/react'
import useNFT from './useNFT'
import MintModal from './MintModal'
import { shortAddr, NFTItem } from './service'

export default function App() {
  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  const { account, items, listNFTs } = useNFT()
  const [visible, setVisible] = useState(false)

  const columns: ColumnProps<NFTItem>[] = [
    {
      title: 'Image',
      dataIndex: 'image',
      width: 240,
      render: value => <img src={value} className="w-52" alt="" />
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      render: (value, record) => `${value} #${record.token_id}`
    },
    {
      title: 'Description',
      dataIndex: 'description'
    },
    {
      title: 'View',
      dataIndex: 'view',
      width: 100,
      render: (_, record) => (
        <a
          href={`https://opbnb-testnet.bscscan.com/token/${record.contract}?a=${record.token_id}`}
          target="_blank"
          className="text-blue-600 hover:underline"
        >
          view
        </a>
      )
    }
  ]

  const content = () => {
    if (!account) {
      return (
        <div className="py-24 flex items-center justify-center">
          <Button
            type="primary"
            shape="round"
            size="large"
            onClick={() => open()}
          >
            Connect Wallet
          </Button>
        </div>
      )
    }
    return (
      <div>
        <div className="mb-4">
          <Button
            type="primary"
            size="large"
            shape="round"
            onClick={() => setVisible(true)}
          >
            Mint my NFT
          </Button>
        </div>
        <Table columns={columns} dataSource={items} rowKey="_id"></Table>
      </div>
    )
  }

  useEffect(() => {
    listNFTs()
  }, [listNFTs])

  return (
    <div>
      <header className="fixed w-full bg-white shadow-sm">
        <div className="h-16 flex items-center max-w-5xl mx-auto gap-2 px-5">
          <img src="/favicon.svg" alt="" className="w-10 h-10" />
          <span className="flex-1 text-lg text-gray-700 font-semibold">
            NFT Mint
          </span>
          <Button
            shape="round"
            size="large"
            href="https://playground.bnb.glacier.io/"
            target="_blank"
          >
            Playground
          </Button>
          {account !== undefined ? (
            <Button
              shape="round"
              size="large"
              type="primary"
              onClick={disconnect}
            >
              {shortAddr(account)}
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              size="large"
              onClick={() => open()}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </header>
      <div className="w-full max-w-5xl mx-auto pt-20 pb-6 px-5">
        {content()}
      </div>
      <MintModal
        open={visible}
        onOk={() => {
          setTimeout(listNFTs, 2000)
        }}
        onClose={() => setVisible(false)}
      />
    </div>
  )
}

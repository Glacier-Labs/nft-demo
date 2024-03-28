import ReactDOM from 'react-dom/client'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import App from './App.tsx'
import config from './config'
import './index.css'

const metadata = {
  name: 'NFT Mint',
  description: 'NFT mint demo',
  url: window.location.origin,
  icons: [window.location.origin + '/favicon.svg']
}

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  defaultChainId: config.network.chainId
})

createWeb3Modal({
  ethersConfig,
  chains: [config.network],
  projectId: config.projectId,
  enableAnalytics: true
})

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)

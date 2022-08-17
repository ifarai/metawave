import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

//rainbow kit imports
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

//Rainbowkit setup

const { chains, provider } = configureChains(
  [chain.mainnet, chain.rinkeby, chain.arbitrum],
  [
    //alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY})
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

ReactDOM.render(
	<WagmiConfig client={wagmiClient}>
		<RainbowKitProvider chains={chains}>
			<React.StrictMode>
					<App />
			</React.StrictMode>
		</RainbowKitProvider>
	</WagmiConfig>
		,
  document.getElementById('root')
)

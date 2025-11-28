# Cipher Scroll Review Frontend

## Framework Stack

This frontend is built with:

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **RainbowKit** - Wallet connection UI
- **Wagmi** - Ethereum React hooks
- **Ethers.js v6** - Ethereum library
- **FHEVM SDK** - Fully Homomorphic Encryption integration

## Network Selection

The app supports multiple networks and users can switch between them:

### Supported Networks

1. **Localhost (Hardhat)** - Chain ID: 31337
   - RPC: `http://127.0.0.1:8545`
   - For local development and testing

2. **Sepolia Testnet** - Chain ID: 11155111
   - Public testnet for testing

3. **Mainnet & Other Networks** - Also configured but require contract deployment

### How to Switch Networks

RainbowKit's `ConnectButton` automatically provides network switching functionality:

1. **Click the Connect Button** in the top right corner
2. **If already connected**, click your wallet address
3. **Select "Switch Network"** from the dropdown
4. **Choose your desired network** (Localhost or Sepolia)

The wallet will prompt you to switch networks, and the app will automatically update to use the selected network.

### Network Configuration

Networks are configured in `src/config/wagmi.ts`. To add or modify networks:

```typescript
import { defineChain } from 'wagmi';

const customChain = defineChain({
  id: YOUR_CHAIN_ID,
  name: 'Your Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['YOUR_RPC_URL'],
    },
  },
});

export const config = getDefaultConfig({
  chains: [localhost, sepolia, customChain],
  // ...
});
```

### Contract Addresses

After deploying contracts, update the addresses in `src/abi/FHEManuscriptAddresses.ts`:

```typescript
export const FHEManuscriptAddresses: Record<number, string> = {
  31337: "YOUR_LOCALHOST_ADDRESS",  // Hardhat localhost
  11155111: "YOUR_SEPOLIA_ADDRESS", // Sepolia testnet
};
```

## Development

### Install Dependencies

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file (optional):

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Notes

- Make sure Hardhat node is running on `http://127.0.0.1:8545` for localhost network
- For Sepolia, ensure you have testnet ETH in your wallet
- The app automatically detects the connected network and uses the appropriate contract address


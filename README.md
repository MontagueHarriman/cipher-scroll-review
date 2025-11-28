# Cipher Scroll Review

**World's first truly blind academic review system using Fully Homomorphic Encryption (FHE) on blockchain.**

> "全球第一个真正盲审的学术评审系统：论文全程 FHE 加密上链，连作者自己都看不到明文，只有本人私钥能解密查看，实现终极隐私保护。"

## 🌐 Live Demo

- **Vercel Deployment**: [https://cipher-scroll-review.vercel.app/](https://cipher-scroll-review.vercel.app/)

## 📹 Demo Video

Watch the complete demo video: [cipher-scroll-review.mp4](./cipher-scroll-review.mp4)

## 🎯 Overview

Cipher Scroll Review is an MVP that demonstrates end-to-end FHE encryption for academic manuscripts. Papers are encrypted with FHE before submission, and only the author's private key can decrypt them. **Even the author cannot see the plaintext without decrypting.**

### Core Business Flow

1. **Author submits manuscript**: Connect wallet → Input manuscript content → Click "Encrypt & Submit for Review"
   - Text is FHE encrypted in the browser
   - Only ciphertext is stored on-chain
   - Page displays: "Your Manuscript #001 – Encrypted & Sealed"

2. **Anyone views the page**: Refreshing the page shows only "An encrypted anonymous manuscript" with a lock icon and timestamp
   - **Completely unable to view content** (including the author without decrypting)

3. **Author decrypts**: Click "Decrypt and View My Manuscript" → Sign with wallet → Browser decrypts with private key → Original text displayed
   - **Other wallets cannot decrypt** - only the original author's private key works

### FHE Encryption/Decryption Loop

```
Manuscript content 
  → Browser FHE encryption 
  → Only ciphertext stored on-chain 
  → Only original author's private key can decrypt 
  → Ultimate anonymity and privacy protection
```

## ✨ Features

- **FHE Encryption**: Manuscripts are encrypted with FHE before blockchain submission
- **Private Key Decryption**: Only the author's wallet private key can decrypt their manuscript
- **On-Chain Storage**: Encrypted manuscripts are stored on-chain permanently
- **True Blind Review**: Even authors cannot see plaintext without decrypting
- **Rainbow Wallet Integration**: Seamless wallet connection using RainbowKit
- **Local & Testnet Support**: Works on localhost (Hardhat) and Sepolia testnet

## 📋 Contract Addresses

### Localhost (Hardhat)
- **Chain ID**: 31337
- **Contract Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Network**: Local Hardhat node (`http://127.0.0.1:8545`)

### Sepolia Testnet
- **Chain ID**: 11155111
- **Contract Address**: `0x31D4375a1F9fbD116fb40F132eeB80ED329B8641`
- **Network**: Sepolia Testnet
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x31D4375a1F9fbD116fb40F132eeB80ED329B8641)

## 📜 Smart Contract

### Contract: `FHEManuscript.sol`

The contract uses Zama's FHE library to store encrypted manuscript content on-chain:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEManuscript is SepoliaConfig {
    struct Manuscript {
        euint8[] encryptedContent; // Encrypted manuscript content as array of encrypted bytes
        address author;            // Author's address
        uint256 timestamp;          // Submission timestamp
        bool exists;                // Whether the manuscript exists
    }

    mapping(uint256 => Manuscript) public manuscripts;
    mapping(address => uint256[]) public authorManuscripts;
    
    uint256 public nextManuscriptId;
    
    event ManuscriptSubmitted(
        uint256 indexed manuscriptId,
        address indexed author,
        uint256 timestamp
    );

    /// @notice Submit an encrypted manuscript
    /// @param encryptedContent Array of encrypted bytes (each byte as externalEuint8)
    /// @param inputProof The input proof for the encrypted content
    /// @return manuscriptId The ID of the submitted manuscript
    function submitManuscript(
        externalEuint8[] calldata encryptedContent,
        bytes calldata inputProof
    ) external returns (uint256) {
        require(encryptedContent.length > 0, "Empty content");
        require(encryptedContent.length <= 32, "Content too long (max 32 bytes)");
        
        uint256 manuscriptId = nextManuscriptId;
        nextManuscriptId++;
        
        // Convert external encrypted bytes to internal euint8 array
        euint8[] memory encryptedBytes = new euint8[](encryptedContent.length);
        for (uint256 i = 0; i < encryptedContent.length; i++) {
            euint8 encryptedByte = FHE.fromExternal(encryptedContent[i], inputProof);
            encryptedBytes[i] = encryptedByte;
            
            // Allow the author to decrypt each byte
            FHE.allowThis(encryptedByte);
            FHE.allow(encryptedByte, msg.sender);
        }
        
        manuscripts[manuscriptId] = Manuscript({
            encryptedContent: encryptedBytes,
            author: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        authorManuscripts[msg.sender].push(manuscriptId);
        
        emit ManuscriptSubmitted(manuscriptId, msg.sender, block.timestamp);
        
        return manuscriptId;
    }

    /// @notice Get the encrypted content of a manuscript
    function getManuscript(uint256 manuscriptId)
        external
        view
        returns (
            euint8[] memory encryptedContent,
            address author,
            uint256 timestamp,
            bool exists
        );

    /// @notice Get all manuscript IDs for an author
    function getAuthorManuscripts(address author)
        external
        view
        returns (uint256[] memory);

    /// @notice Get the total number of manuscripts
    function getTotalManuscripts() external view returns (uint256);
}
```

### Key Contract Functions

- `submitManuscript(encryptedContent, inputProof)`: Submit an encrypted manuscript (max 32 bytes for MVP)
- `getManuscript(manuscriptId)`: Get manuscript details (encrypted content, author, timestamp)
- `getAuthorManuscripts(author)`: Get all manuscript IDs for an author
- `getTotalManuscripts()`: Get total number of manuscripts

## 🔐 Encryption & Decryption Logic

### Encryption Process

The encryption happens in the browser using FHEVM SDK:

```typescript
// 1. Convert text to bytes array
const contentBytes = ethers.toUtf8Bytes(content);

// 2. Create encrypted input instance
const input = instance.createEncryptedInput(
  contractAddress,
  userAddress
);

// 3. Add all bytes to the same input (shares single proof)
for (let i = 0; i < contentBytes.length; i++) {
  input.add8(contentBytes[i]);
}

// 4. Encrypt all bytes at once (generates single inputProof)
const enc = await input.encrypt();

// 5. Extract handles and proof
const encryptedBytes = enc.handles; // Array of encrypted byte handles
const inputProof = enc.inputProof;   // Single proof for all bytes

// 6. Submit to contract
await contract.submitManuscript(encryptedBytes, inputProof);
```

**Key Points:**
- All bytes are added to a single `createEncryptedInput` instance
- Single `encrypt()` call generates one `inputProof` for all bytes
- Contract stores `euint8[]` (array of encrypted bytes)
- Each byte has ACL permissions set for the author

### Decryption Process

Only the author can decrypt using their private key:

```typescript
// 1. Load or create decryption signature
const sig = await FhevmDecryptionSignature.loadOrSign(
  instance,
  [contractAddress],
  signer,
  storage
);

// 2. Prepare handle pairs for decryption
const handlePairs = encryptedContent.map((handle) => ({
  handle: handle,
  contractAddress: contractAddress,
}));

// 3. Call userDecrypt with signature
const res = await instance.userDecrypt(
  handlePairs,
  sig.privateKey,
  sig.publicKey,
  sig.signature,
  sig.contractAddresses,
  sig.userAddress,
  sig.startTimestamp,
  sig.durationDays
);

// 4. Extract decrypted bytes
const decryptedBytesArray: number[] = [];
for (let i = 0; i < encryptedContent.length; i++) {
  const handle = encryptedContent[i];
  const decryptedByte = res[handle];
  if (decryptedByte !== undefined) {
    decryptedBytesArray.push(Number(decryptedByte));
  }
}

// 5. Convert bytes back to string
const decryptedString = ethers.toUtf8String(
  new Uint8Array(decryptedBytesArray)
);
```

**Key Points:**
- Requires EIP712 signature signed by the author's wallet
- Uses the author's private key (managed by wallet)
- Contract ACL ensures only the author has decryption permission
- Decryption happens in the browser, never on-chain

## 🏗️ Project Structure

```
cipher-scroll-review/
├── contracts/              # Solidity smart contracts
│   └── FHEManuscript.sol   # Main contract
├── deploy/                  # Deployment scripts
│   └── deploy.ts
├── test/                   # Test scripts
│   ├── FHEManuscript.ts    # Local Hardhat tests
│   └── FHEManuscriptSepolia.ts  # Sepolia testnet tests
├── tasks/                  # Hardhat tasks
│   ├── accounts.ts
│   └── FHEManuscript.ts
├── scripts/                 # Utility scripts
│   └── deploy-sepolia.js   # Sepolia deployment script
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── abi/           # Contract ABIs and addresses
│   │   ├── components/    # React components
│   │   ├── config/        # Configuration (wagmi, contracts)
│   │   ├── fhevm/         # FHEVM integration
│   │   ├── hooks/         # React hooks
│   │   │   ├── useFHEManuscript.tsx  # Main business logic
│   │   │   ├── useRainbowEthersSigner.tsx
│   │   │   └── useInMemoryStorage.tsx
│   │   └── pages/         # Page components
│   └── public/            # Static assets
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- A Web3 wallet (Rainbow, MetaMask, etc.)
- Hardhat node running (for local development)

### Contract Setup

1. **Install dependencies:**
```bash
cd project/cipher-scroll-review
npm install
```

2. **Compile contracts:**
```bash
npm run compile
```

3. **Start Hardhat node (Terminal 1):**
```bash
npx hardhat node
```

4. **Deploy to localhost (Terminal 2):**
```bash
npx hardhat deploy --network hardhat
```

5. **Update contract address in frontend:**
```typescript
// frontend/src/abi/FHEManuscriptAddresses.ts
export const FHEManuscriptAddresses: Record<number, string> = {
  31337: "YOUR_DEPLOYED_CONTRACT_ADDRESS", // Update after deployment
  11155111: "0x31D4375a1F9fbD116fb40F132eeB80ED329B8641", // Sepolia
};
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Update WalletConnect Project ID (optional):**
```typescript
// src/config/wagmi.ts
projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📖 Usage

### Submit a Manuscript

1. Connect your wallet using RainbowKit (top right corner)
2. Switch to Localhost network (or Sepolia for testnet)
3. Click "Encrypt & Submit Manuscript" button
4. Enter your manuscript content (max 32 bytes for MVP)
   - Example: `"FHE enables private computation"`
5. Click "Encrypt & Submit"
6. Wait for encryption (10-30 seconds) and transaction confirmation
7. Page displays: "Your Manuscript #001 – Encrypted & Sealed"

### View Your Manuscripts

1. Scroll down to "My Manuscripts" section
2. Your submitted manuscripts appear as encrypted
3. Only encrypted data is visible - no plaintext
4. Even you (the author) cannot see content without decrypting

### Decrypt Your Manuscript

1. Click "Decrypt & View My Manuscript" button
2. Approve wallet signature if prompted
3. Wait for decryption (5-15 seconds)
4. Original plaintext content is displayed
5. **Only you (the author) can decrypt** - other wallets will fail

## 🧪 Testing

### Local Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/FHEManuscript.ts
```

### Sepolia Testnet Testing

1. **Deploy to Sepolia:**
```bash
# Using environment variables (recommended)
$env:PRIVATE_KEY="0x..."; $env:INFURA_API_KEY="..."; node scripts/deploy-sepolia.js

# Or using Hardhat deploy
npx hardhat deploy --network sepolia
```

2. **Update contract address in frontend** (if different)

3. **Run Sepolia tests:**
```bash
npm run test:sepolia
```

## 🔧 Technical Details

### FHE Encryption Architecture

The system uses **FHEVM (Fully Homomorphic Encryption Virtual Machine)** by Zama:

1. **Localhost (Hardhat)**: Uses `MockFhevmInstance` from `@fhevm/mock-utils`
   - No relayer service needed
   - Works offline
   - Fast encryption/decryption

2. **Sepolia Testnet**: Uses Zama Relayer SDK
   - Loads SDK from CDN (`window.relayerSDK`)
   - Requires connection to `relayer.testnet.zama.cloud`
   - Uses `createInstance(SepoliaConfig)` pattern

### Network Configuration

- **Localhost**: Chain ID 31337, RPC `http://127.0.0.1:8545`
- **Sepolia**: Chain ID 11155111, RPC via Infura or public endpoint

### FHEVM Instance Creation

For Sepolia network, the system:
1. Loads relayer SDK from CDN (in `index.html`)
2. Uses `window.relayerSDK.createInstance(SepoliaConfig)`
3. No provider/network parameter needed (relayer SDK handles it)

### Data Flow

```
User Input (Text)
  ↓
Browser FHE Encryption (FHEVM SDK)
  ↓
Encrypted Bytes Array + Input Proof
  ↓
Smart Contract (euint8[] storage)
  ↓
On-Chain Encrypted Data (permanent)
  ↓
Author Requests Decryption
  ↓
Browser FHE Decryption (Author's Private Key)
  ↓
Original Plaintext (only visible to author)
```

## ⚠️ Limitations (MVP)

- **Content Limit**: Max 32 bytes per manuscript (can be extended to support longer content)
- **Single Author**: One author per manuscript
- **No Reviewer Functionality**: Review workflow not yet implemented
- **Text Only**: No file upload support
- **Network Dependency**: Sepolia requires connection to Zama relayer service

## 🔮 Future Enhancements

- Support for longer content (multiple `euint8[]` chunks)
- Reviewer assignment and encrypted review submission
- File upload and encryption
- Multiple authors per manuscript
- Review workflow management
- Batch encryption/decryption
- Encrypted search functionality

## 📚 References

- **Zama FHEVM**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **FHEVM Solidity Library**: `@fhevm/solidity`
- **Relayer SDK**: `@zama-fhe/relayer-sdk`
- **Hardhat**: [https://hardhat.org](https://hardhat.org)
- **RainbowKit**: [https://www.rainbowkit.com](https://www.rainbowkit.com)

## 📝 License

MIT

## 🙏 Acknowledgments

- Built with [Zama's FHEVM](https://www.zama.ai/)
- Inspired by the need for truly blind academic review systems
- Uses [Dairy project](https://github.com/zama-ai/fhevm-hardhat-template) as reference for FHEVM integration

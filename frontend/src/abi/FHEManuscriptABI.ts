// ABI for FHEManuscript contract
// FHEVM types are mapped to bytes32 for Ethers.js compatibility
export const FHEManuscriptABI = {
  abi: [
    {
      inputs: [
        {
          internalType: "bytes32[]",
          name: "encryptedContent",
          type: "bytes32[]",
        },
        {
          internalType: "bytes",
          name: "inputProof",
          type: "bytes",
        },
      ],
      name: "submitManuscript",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "manuscriptId",
          type: "uint256",
        },
      ],
      name: "getManuscript",
      outputs: [
        {
          internalType: "bytes32[]",
          name: "encryptedContent",
          type: "bytes32[]",
        },
        {
          internalType: "address",
          name: "author",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "exists",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "author",
          type: "address",
        },
      ],
      name: "getAuthorManuscripts",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getTotalManuscripts",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "manuscripts",
      outputs: [
        {
          internalType: "bytes32[]",
          name: "encryptedContent",
          type: "bytes32[]",
        },
        {
          internalType: "address",
          name: "author",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "exists",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "nextManuscriptId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "manuscriptId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "author",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "ManuscriptSubmitted",
      type: "event",
    },
  ],
} as const;

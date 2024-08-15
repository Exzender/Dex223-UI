export const AUTOLISTING_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_factory", type: "address" },
      { internalType: "address", name: "_registry", type: "address" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_URL", type: "string" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "token0_erc20", type: "address" },
      { indexed: false, internalType: "address", name: "token0_erc223", type: "address" },
      { indexed: true, internalType: "address", name: "token1_erc20", type: "address" },
      { indexed: false, internalType: "address", name: "token1_erc223", type: "address" },
      { indexed: true, internalType: "address", name: "pool", type: "address" },
      { indexed: false, internalType: "uint256", name: "feeTier", type: "uint256" },
    ],
    name: "PairListed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "token_erc20", type: "address" },
      { indexed: true, internalType: "address", name: "token_erc223", type: "address" },
    ],
    name: "TokenListed",
    type: "event",
  },
  {
    inputs: [],
    name: "getName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRegistry",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getToken",
    outputs: [
      { internalType: "address", name: "_erc20", type: "address" },
      { internalType: "address", name: "_erc223", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getURL",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    name: "isListed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "last_update",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "uint24", name: "feeTier", type: "uint24" },
    ],
    name: "list",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "listed_tokens",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "num_listed_tokens",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "pairs",
    outputs: [
      { internalType: "address", name: "token1_erc20", type: "address" },
      { internalType: "address", name: "token2_erc20", type: "address" },
      { internalType: "address", name: "token1_erc223", type: "address" },
      { internalType: "address", name: "token2_erc223", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "tokens",
    outputs: [
      { internalType: "address", name: "erc20", type: "address" },
      { internalType: "address", name: "erc223", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "url",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
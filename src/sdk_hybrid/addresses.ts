import { Address } from "viem";

import { DexChainId } from "./chains";

export const CONVERTER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0x5714E07b52FCF05EeBE586815062a049D786C3DB",
  [DexChainId.SEPOLIA]: "0x258e392a314034eb093706254960f26a90696d4c",
  [DexChainId.BSC_TESTNET]: "0x1e6951b73f44E7C71B43Dfc1FFA63cA2eab2cEdA",
};
export const FACTORY_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xEAc1aF2e4472219b88e56dC009F4824547830AC0",
  [DexChainId.SEPOLIA]: "0xb0085429ff43a2a51ec1b1ac8956a35c19ec008e",
  [DexChainId.BSC_TESTNET]: "0xfCCB28483d26EadB90A11cD50e09c12E553fFb22",
};
export const ROUTER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xd71B50caF51f39657BA358759c54777FA44357Fb",
  [DexChainId.SEPOLIA]: "0xf5bf22509f1368a65b758655ee60522bbe7e4e92",
  [DexChainId.BSC_TESTNET]: "0x62AAC63568Fc0b1Bd0c746B3073D5A2CD1281141",
};

export const QUOTER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xf35D69f403E89d54e4D3d6B01125010AB596095e",
  [DexChainId.SEPOLIA]: "0x9d5af46fbd55a742969eac7710d54aeff4ace4d9",
  [DexChainId.BSC_TESTNET]: "0x45c0eD3D1D9c6d464B6a89056Cbd9F83b4641db7",
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xeAAfD389039229BB850F8F3a9CA5e5E1d53f3BeE",
  [DexChainId.SEPOLIA]: "0x250155fca186afd41349097791bfffdb2c4c7c28",
  [DexChainId.BSC_TESTNET]: "0x0784048E1306AF88A082d499aeC9C21d77E3B8cd",
};

export const POOL_INIT_CODE_HASH: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xeb2af1344b4aa73e15e4ec4d5110b0358721463fa322ae01294d16e65a9966a3",
  [DexChainId.SEPOLIA]: "0xab833028026788c713a927db0b749989cac2bdfce76df735761cac2f9c3ec069",
  [DexChainId.BSC_TESTNET]: "0xeec262796ecc14445f5c61bc47690b549e0fb69dbc0b99b87ae5b61b9707cdf5",
};

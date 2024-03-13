import JSBI from "jsbi";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";

import { POOL_STATE_ABI } from "@/config/abis/poolState";
import { BigintIsh, FeeAmount } from "@/sdk";
import { V3_CORE_FACTORY_ADDRESSES } from "@/sdk/addresses";
import { Currency } from "@/sdk/entities/currency";
import { Pool } from "@/sdk/entities/pool";
import { Token } from "@/sdk/entities/token";
import { computePoolAddress } from "@/sdk/utils/computePoolAddress";
import { usePoolsStore } from "@/stores/usePoolsStore";

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128;

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = [];
  private static addresses: { key: string; address: string }[] = [];

  static getPoolAddress(
    factoryAddress: string,
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
  ): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2);
    }

    const { address: addressA } = tokenA;
    const { address: addressB } = tokenB;
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`;
    const found = this.addresses.find((address) => address.key === key);
    if (found) return found.address;

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
      }),
    };
    this.addresses.unshift(address);
    return address.address;
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number,
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2);
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick,
    );
    if (found) return found;

    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96.toString(), liquidity.toString(), tick);
    this.pools.unshift(pool);
    return pool;
  }
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}
export default function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [PoolState, Pool | null][] {
  const { chainId } = useAccount();
  const { pools, addPool } = usePoolsStore();

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length);

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped;
        const tokenB = currencyB.wrapped;
        if (tokenA.equals(tokenB)) return undefined;

        return tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB, feeAmount]
          : [tokenB, tokenA, feeAmount];
      }
      return undefined;
    });
  }, [chainId, poolKeys]);

  const poolAddresses: (Address | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId];
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length);

    return poolTokens.map(
      (value) =>
        value &&
        computePoolAddress({
          factoryAddress: v3CoreFactoryAddress,
          tokenA: value[0],
          tokenB: value[1],
          fee: value[2],
        }),
    );
  }, [chainId, poolTokens]);

  const slot0Contracts = useMemo(() => {
    return poolAddresses.map((address) => {
      return {
        abi: POOL_STATE_ABI,
        address: address,
        functionName: "slot0",
      };
    });
  }, [poolAddresses]);

  const liquidityContracts = useMemo(() => {
    return poolAddresses.map((address) => {
      return {
        abi: POOL_STATE_ABI,
        address: address,
        functionName: "liquidity",
      };
    });
  }, [poolAddresses]);

  const { data: slot0Data, isLoading: slot0Loading } = useReadContracts({
    contracts: slot0Contracts,
  });

  const { data: liquidityData, isLoading: liquidityLoading } = useReadContracts({
    contracts: liquidityContracts,
  });

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index];
      if (!tokens) return [PoolState.INVALID, null];
      const [token0, token1, fee] = tokens;

      if (!slot0Data || slot0Data[index].error) return [PoolState.INVALID, null];
      if (!liquidityData || liquidityData[index].error) return [PoolState.INVALID, null];

      if (!slot0Data[index]) return [PoolState.INVALID, null];
      if (!liquidityData[index]) return [PoolState.INVALID, null];

      const [sqrtPriceX96, tick] = slot0Data[index].result as [bigint, number];
      const liquidity = liquidityData[index].result as bigint;

      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null];
      if (!sqrtPriceX96 || sqrtPriceX96 === BigInt(0)) return [PoolState.NOT_EXISTS, null];

      try {
        const pool = pools.find((pool) => {
          return (
            token0 === pool.token0 &&
            token1 === pool.token1 &&
            fee === pool.fee &&
            JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
            JSBI.EQ(pool.liquidity, liquidity) &&
            pool.tickCurrent === tick
          );
        });
        if (pool) {
          return [PoolState.EXISTS, pool];
        } else {
          const poolToAdd = new Pool(
            token0,
            token1,
            fee,
            sqrtPriceX96.toString(),
            liquidity.toString(),
            tick,
          );
          addPool(poolToAdd);
          return [PoolState.EXISTS, poolToAdd];
        }
      } catch (error) {
        console.error("Error when constructing the pool", error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [
    poolKeys,
    poolTokens,
    slot0Data,
    liquidityData,
    slot0Loading,
    liquidityLoading,
    pools,
    addPool,
  ]);
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  );

  return usePools(poolKeys)[0];
}

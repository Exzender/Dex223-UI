import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useAccount, useBalance, useBlockNumber } from "wagmi";

import Button, { ButtonVariant } from "@/components/buttons/Button";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useRevoke from "@/hooks/useRevoke";
import useWithdraw from "@/hooks/useWithdraw";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Standard } from "@/sdk_hybrid/standard";

import { useLiquidityApprove } from "../../hooks/useLiquidityApprove";
import { usePriceRange } from "../../hooks/usePrice";
import { useV3DerivedMintInfo } from "../../hooks/useV3DerivedMintInfo";
import {
  Field,
  useLiquidityAmountsStore,
  useTokensStandards,
} from "../../stores/useAddLiquidityAmountsStore";
import {
  AddLiquidityStatus,
  useAddLiquidityStatusStore,
} from "../../stores/useAddLiquidityStatusStore";
import { useAddLiquidityTokensStore } from "../../stores/useAddLiquidityTokensStore";
import { useConfirmLiquidityDialogStore } from "../../stores/useConfirmLiquidityDialogOpened";
import { useLiquidityTierStore } from "../../stores/useLiquidityTierStore";
import { APPROVE_BUTTON_TEXT } from "./ConfirmLiquidityDialog";

export const LiquidityActionButton = ({
  increase = false,
  tokenId,
}: {
  increase?: boolean;
  tokenId?: string;
}) => {
  const t = useTranslations("Liquidity");
  const tWallet = useTranslations("Wallet");
  const { setIsOpen } = useConfirmLiquidityDialogStore();

  const {
    setStatus,
    setApprove0Status,
    setApprove0Hash,
    setDeposite0Hash,
    setDeposite1Hash,
    setApprove1Status,
    setApprove1Hash,
    setDeposite0Status,
    setDeposite1Status,
  } = useAddLiquidityStatusStore();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();
  const { price } = usePriceRange();
  const { tokenAStandard, tokenBStandard } = useTokensStandards();
  const { address, isConnected } = useAccount();

  const { approveTransactionsCount, approveTransactionsType } = useLiquidityApprove();
  const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();

  const { typedValue } = useLiquidityAmountsStore();

  const { parsedAmounts, noLiquidity } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const chainId = useCurrentChainId();

  const { currentAllowance: currentAllowanceA } = useRevoke({
    token: tokenA,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  const { currentDeposit: currentDepositA } = useWithdraw({
    token: tokenA,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  const { currentAllowance: currentAllowanceB } = useRevoke({
    token: tokenB,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  const { currentDeposit: currentDepositB } = useWithdraw({
    token: tokenB,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  const { data: tokenA0Balance, refetch: refetchBalanceA0 } = useBalance({
    address: tokenA ? address : undefined,
    token: tokenA && !tokenA.isNative ? tokenA.address0 : undefined,
    query: {
      enabled: Boolean(tokenA),
    },
  });
  const { data: tokenA1Balance, refetch: refetchBalanceA1 } = useBalance({
    address: tokenA ? address : undefined,
    token: tokenA && !tokenA.isNative ? tokenA.address1 : undefined,
    query: {
      enabled: Boolean(tokenA),
    },
  });

  const { data: tokenB0Balance, refetch: refetchBalanceB0 } = useBalance({
    address: tokenB ? address : undefined,
    token: tokenB && !tokenB.isNative ? tokenB.address0 : undefined,
    query: {
      enabled: Boolean(tokenB),
    },
  });
  const { data: tokenB1Balance, refetch: refetchBalanceB1 } = useBalance({
    address: tokenB ? address : undefined,
    token: tokenB && !tokenB.isNative ? tokenB.address1 : undefined,
    query: {
      enabled: Boolean(tokenB),
    },
  });

  useEffect(() => {
    refetchBalanceA0();
    refetchBalanceA1();
    refetchBalanceB0();
    refetchBalanceB1();
  }, [blockNumber, refetchBalanceA0, refetchBalanceB0, refetchBalanceA1, refetchBalanceB1]);

  const amountToCheckA = parsedAmounts[Field.CURRENCY_A]
    ? BigInt(parsedAmounts[Field.CURRENCY_A].quotient.toString())
    : BigInt(0);
  const amountToCheckB = parsedAmounts[Field.CURRENCY_B]
    ? BigInt(parsedAmounts[Field.CURRENCY_B].quotient.toString())
    : BigInt(0);

  const isSufficientBalanceA = useMemo(() => {
    return tokenAStandard === Standard.ERC20
      ? tokenA0Balance
        ? tokenA0Balance?.value + BigInt(currentAllowanceA || 0) >= amountToCheckA
        : false
      : tokenA1Balance
        ? tokenA1Balance?.value + BigInt(currentDepositA || 0) >= amountToCheckA
        : false;
  }, [
    amountToCheckA,
    currentAllowanceA,
    currentDepositA,
    tokenA0Balance,
    tokenA1Balance,
    tokenAStandard,
  ]);

  const isSufficientAllowanceA = useMemo(() => {
    return tokenAStandard === Standard.ERC20
      ? BigInt(currentAllowanceA || 0) >= amountToCheckA
      : BigInt(currentDepositA || 0) >= amountToCheckA;
  }, [amountToCheckA, currentAllowanceA, currentDepositA, tokenAStandard]);

  const isSufficientAllowanceB = useMemo(() => {
    return tokenBStandard === Standard.ERC20
      ? BigInt(currentAllowanceB || 0) >= amountToCheckB
      : BigInt(currentDepositB || 0) >= amountToCheckB;
  }, [amountToCheckB, currentAllowanceB, currentDepositB, tokenBStandard]);

  const isSufficientBalanceB = useMemo(() => {
    return tokenBStandard === Standard.ERC20
      ? tokenB0Balance
        ? tokenB0Balance?.value + BigInt(currentAllowanceB || 0) >= amountToCheckB
        : false
      : tokenB1Balance
        ? tokenB1Balance?.value + BigInt(currentDepositB || 0) >= amountToCheckB
        : false;
  }, [
    amountToCheckB,
    currentAllowanceB,
    currentDepositB,
    tokenB0Balance,
    tokenB1Balance,
    tokenBStandard,
  ]);

  const isSufficientBalance = useMemo(() => {
    return isSufficientBalanceA && isSufficientBalanceB;
  }, [isSufficientBalanceA, isSufficientBalanceB]);

  if (!isConnected) {
    return (
      <Button onClick={() => setWalletConnectOpened(true)} fullWidth>
        {tWallet("connect_wallet")}
      </Button>
    );
  }

  if (!tokenA || !tokenB) {
    return (
      <Button variant={ButtonVariant.CONTAINED} fullWidth disabled>
        {t("select_pair")}
      </Button>
    );
  }

  if (!typedValue || typedValue === "0") {
    return (
      <Button variant={ButtonVariant.CONTAINED} fullWidth disabled>
        {t("button_enter_amount")}
      </Button>
    );
  }

  if (!isSufficientBalance) {
    return (
      <Button variant={ButtonVariant.CONTAINED} fullWidth disabled>
        {t("button_insufficient_balance")}
      </Button>
    );
  }

  if (approveTransactionsCount || !isSufficientAllowanceA || !isSufficientAllowanceB) {
    return (
      <Button
        variant={ButtonVariant.CONTAINED}
        fullWidth
        onClick={() => {
          setStatus(AddLiquidityStatus.INITIAL);
          setApprove0Status(0);
          setApprove0Hash(undefined);
          setApprove1Status(0);
          setDeposite0Status(0);
          setDeposite1Status(0);
          setApprove1Hash(undefined);
          setDeposite0Hash(undefined);
          setDeposite1Hash(undefined);
          setIsOpen(true);
        }}
      >
        {t(APPROVE_BUTTON_TEXT[approveTransactionsType] as any)}
      </Button>
    );
  }

  return (
    <Button
      variant={ButtonVariant.CONTAINED}
      fullWidth
      onClick={() => {
        setStatus(AddLiquidityStatus.MINT);
        setIsOpen(true);
      }}
    >
      {increase ? "Add liquidity" : noLiquidity ? "Create Pool & Mint liquidity" : "Mint liquidity"}
    </Button>
  );
};

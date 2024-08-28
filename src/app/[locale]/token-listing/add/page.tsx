"use client";

import clsx from "clsx";
import Image from "next/image";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatUnits, isAddress, parseUnits } from "viem";
import { usePublicClient, useReadContract, useWalletClient } from "wagmi";

import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import ConfirmListingDialog from "@/app/[locale]/token-listing/add/components/ConfirmListingDialog";
import useAutoListingContracts, {
  useAutoListingContract,
} from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import { useAutoListingSearchParams } from "@/app/[locale]/token-listing/add/hooks/useAutolistingSearchParams";
import { useAutoListingContractStore } from "@/app/[locale]/token-listing/add/stores/useAutoListingContractStore";
import { useConfirmListTokenDialogStore } from "@/app/[locale]/token-listing/add/stores/useConfirmListTokenDialogOpened";
import { useListTokensStore } from "@/app/[locale]/token-listing/add/stores/useListTokensStore";
import { usePaymentTokenStore } from "@/app/[locale]/token-listing/add/stores/usePaymentTokenStore";
import Alert from "@/components/atoms/Alert";
import Container from "@/components/atoms/Container";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import Preloader from "@/components/atoms/Preloader";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import { HelperText, InputLabel } from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonSize } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import SwapButton from "@/components/buttons/SwapButton";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import TokenInput from "@/components/common/TokenInput";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { PAYABLE_AUTOLISTING_ABI } from "@/config/abis/autolisting";
import { ERC20_ABI } from "@/config/abis/erc20";
import { TOKEN_CONVERTER_ABI } from "@/config/abis/tokenConverter";
import { networks } from "@/config/networks";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { CONVERTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";
import { Standard } from "@/sdk_hybrid/standard";

export default function ListTokenPage() {
  useAutoListingSearchParams();
  const router = useRouter();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useCurrentChainId();
  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useSwapRecentTransactionsStore();
  const { autoListingContract, setAutoListingContract } = useAutoListingContractStore();
  const autoListings = useAutoListingContracts();
  useRecentTransactionTracking();

  const autoListing = useAutoListingContract(autoListingContract);

  console.log(autoListing);

  const { tokenA, tokenB, setTokenA, setTokenB } = useListTokensStore();

  const [tokenAAddress, setTokenAAddress] = useState("");
  const [tokenBAddress, setTokenBAddress] = useState("");

  const tokens = useTokens();

  const [isPickTokenOpened, setPickTokenOpened] = useState(false);
  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handleChange = useCallback(
    async (
      e: ChangeEvent<HTMLInputElement>,
      setToken: (token: Token) => void,
      setTokenAddress: (value: string) => void,
    ) => {
      const value = e.target.value;
      setTokenAddress(value);

      if (isAddress(value) && publicClient && chainId) {
        const tokenToFind = tokens.find((t) => t.address0 === value);
        if (tokenToFind) {
          setToken(tokenToFind);
          return;
        }

        const decimals = await publicClient.readContract({
          abi: ERC20_ABI,
          functionName: "decimals",
          address: value,
        });

        const symbol = await publicClient.readContract({
          abi: ERC20_ABI,
          functionName: "symbol",
          address: value,
        });
        const name = await publicClient.readContract({
          abi: ERC20_ABI,
          functionName: "name",
          address: value,
        });
        const predictedERC223Address = await publicClient.readContract({
          abi: TOKEN_CONVERTER_ABI,
          functionName: "predictWrapperAddress",
          address: CONVERTER_ADDRESS[chainId],
          args: [value as Address, true],
        });

        const _token = new Token(
          chainId,
          value,
          predictedERC223Address,
          decimals,
          symbol,
          name,
          "/tokens/placeholder.svg",
        );

        setToken(_token);
      }
    },
    [chainId, publicClient, tokens],
  );

  const { paymentToken, setPaymentToken } = usePaymentTokenStore();

  // const [paymentMethod, setPaymentMethod] = useState<{ token: Address; price: bigint }>();

  const tokensToPay = useReadContract({
    abi: PAYABLE_AUTOLISTING_ABI,
    address: autoListingContract,
    functionName: "getPrices",
  });

  useEffect(() => {
    if (!paymentToken && tokensToPay?.data?.[0]) {
      setPaymentToken(tokensToPay?.data?.[0]);
    }
  }, [paymentToken, setPaymentToken, tokensToPay?.data]);

  const tokenDecimals = useReadContract({
    abi: ERC20_ABI,
    functionName: "decimals",
    address: paymentToken?.token,
  });

  const tokenSymbol = useReadContract({
    abi: ERC20_ABI,
    functionName: "symbol",
    address: paymentToken?.token,
  });

  console.log(tokenDecimals);
  console.log(tokenSymbol);

  const [isAutolistingSelectOpened, setAutoListingSelectOpened] = useState(false);
  const [isPaymentDialogSelectOpened, setPaymentDialogSelectOpened] = useState(false);

  const { setIsOpen } = useConfirmListTokenDialogStore();

  return (
    <>
      <Container>
        <div
          className={clsx(
            "grid py-4 lg:py-[40px] grid-cols-1 mx-auto",
            showRecentTransactions
              ? "xl:grid-cols-[580px_600px] xl:max-w-[1200px] gap-4 xl:grid-areas-[left_right] grid-areas-[right,left]"
              : "xl:grid-cols-[600px] xl:max-w-[600px] grid-areas-[right]",
          )}
        >
          {showRecentTransactions && (
            <div className="grid-in-[left] flex justify-center">
              <div className="w-full sm:max-w-[600px] xl:max-w-full">
                <RecentTransactions
                  showRecentTransactions={showRecentTransactions}
                  handleClose={() => setShowRecentTransactions(false)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-center grid-in-[right]">
            <div className="flex flex-col gap-5 w-full sm:max-w-[600px] xl:max-w-full">
              <div className="px-4 md:px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="font-bold text-20">List tokens</h3>
                  <div className="flex items-center">
                    <IconButton
                      buttonSize={IconButtonSize.LARGE}
                      active={showRecentTransactions}
                      iconName="recent-transactions"
                      onClick={() => setShowRecentTransactions(!showRecentTransactions)}
                    />
                  </div>
                </div>
                <p className="text-secondary-text text-14 mb-4">
                  List your token automatically using our smart contract. Click the button below to
                  proceed and leverage our seamless, automated process for adding your token to our
                  platform. This method ensures a quick and efficient listing, utilizing the power
                  of smart contracts to handle the process securely and transparently. Get started
                  now to enjoy hassle-free token listing!
                </p>

                <div className="flex flex-col gap-4 pb-5">
                  <div>
                    <InputLabel label="Token contract address" />
                    <div className="bg-secondary-bg relative flex items-center border border-transparent rounded-2 pr-[3px]">
                      <input
                        className="bg-transparent peer duration-200 focus:outline-0 h-12 pl-5 placeholder:text-tertiary-text text-16 w-full rounded-2 pr-2"
                        value={tokenAAddress}
                        onChange={(e) => {
                          handleChange(e, setTokenA, setTokenAAddress);
                        }}
                        type="text"
                        placeholder="Token contract address"
                      />
                      <button
                        className="flex-shrink-0 p-2 flex items-center border border-transparent gap-1 text-primary-text bg-primary-bg rounded-2 hover:bg-green-bg hover:border-green duration-200 hover:shadow-checkbox"
                        onClick={() => {
                          setCurrentlyPicking("tokenA");
                          setPickTokenOpened(true);
                        }}
                      >
                        <Image
                          className="mr-1"
                          width={24}
                          height={24}
                          src={tokenA?.logoURI || "/tokens/placeholder.svg"}
                          alt=""
                        />
                        {tokenA?.symbol || "Select token"}
                        <Svg iconName="small-expand-arrow" />
                      </button>
                      <div className="duration-200 rounded-3 pointer-events-none absolute w-full h-full border border-transparent peer-hover:shadow-checkbox peer-focus:shadow-checkbox peer-focus:border-green top-0 left-0" />
                    </div>
                    <HelperText helperText="Enter the contract address of the token you want to list" />
                  </div>

                  <div>
                    <InputLabel label="Paired token contract address" />
                    <div className="bg-secondary-bg relative flex items-center border border-transparent rounded-2 pr-[3px]">
                      <input
                        className="bg-transparent peer duration-200 focus:outline-0 h-12 pl-5 placeholder:text-tertiary-text text-16 w-full rounded-2 pr-2"
                        value={tokenBAddress}
                        onChange={(e) => {
                          handleChange(e, setTokenB, setTokenBAddress);
                        }}
                        type="text"
                        placeholder="Token contract address"
                      />
                      <button
                        className="flex-shrink-0 p-2 flex items-center border border-transparent gap-1 text-primary-text bg-primary-bg rounded-2 hover:bg-green-bg hover:border-green duration-200 hover:shadow-checkbox"
                        onClick={() => {
                          setCurrentlyPicking("tokenB");
                          setPickTokenOpened(true);
                        }}
                      >
                        <Image
                          className="mr-1"
                          width={24}
                          height={24}
                          src={tokenB?.logoURI || "/tokens/placeholder.svg"}
                          alt=""
                        />
                        {tokenB?.symbol || "Select token"}
                        <Svg iconName="small-expand-arrow" />
                      </button>
                      <div className="duration-200 rounded-3 pointer-events-none absolute w-full h-full border border-transparent peer-hover:shadow-checkbox peer-focus:shadow-checkbox peer-focus:border-green top-0 left-0" />
                    </div>
                    <HelperText helperText="Enter or select the paired token address" />
                  </div>

                  <Alert
                    text="You can only list a token that has a pool on our exchange"
                    type="info"
                  />

                  <div>
                    <InputLabel label="You list in auto-listing contract" />
                    <SelectButton
                      fullWidth
                      size="medium"
                      className="bg-secondary-bg justify-between pl-5"
                      onClick={() => setAutoListingSelectOpened(true)}
                    >
                      {autoListing?.name || "Select token list"}
                    </SelectButton>
                    <HelperText
                      helperText={
                        !autoListing ? (
                          "Choose contract address you want to list"
                        ) : (
                          <span className="flex items-center gap-2">
                            Contract address:{" "}
                            <ExternalTextLink
                              color="white"
                              text={truncateMiddle(autoListing.id)}
                              href={getExplorerLink(
                                ExplorerLinkType.ADDRESS,
                                autoListing.id,
                                DexChainId.SEPOLIA,
                              )}
                            />
                          </span>
                        )
                      }
                    />
                  </div>

                  {!!tokensToPay?.data?.length && (
                    <>
                      {tokensToPay.data.length > 1 ? (
                        <div>
                          <InputLabel label="Payment for listing" />
                          <div className="h-12 rounded-2 border w-full border-secondary-border text-primary-text flex justify-between items-center px-5">
                            {paymentToken
                              ? formatUnits(paymentToken.price, tokenDecimals.data || 18)
                              : "1"}
                            <SelectButton
                              onClick={() => setPaymentDialogSelectOpened(true)}
                              className="flex items-center gap-2"
                            >
                              <>
                                {tokenSymbol.data}
                                <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                              </>
                            </SelectButton>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <InputLabel label="Payment for listing" />
                          <div className="h-12 rounded-2 border w-full border-secondary-border text-primary-text flex justify-between items-center px-5">
                            {formatUnits(tokensToPay.data[0].price, tokenDecimals.data || 18)}
                            <span className="flex items-center gap-2">
                              {tokenSymbol.data}
                              <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Button onClick={() => setIsOpen(true)} fullWidth>
                  List token(s)
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Dialog isOpen={isAutolistingSelectOpened} setIsOpen={setAutoListingSelectOpened}>
          <DialogHeader
            onClose={() => setAutoListingSelectOpened(false)}
            title="Select auto-listing contract"
          />
          <div className="flex flex-col gap-2">
            {autoListings.data?.autoListings.map((a: any) => {
              return (
                <button
                  onClick={() => {
                    setAutoListingContract(a.id);
                    // searchParams.set("autoListingAddress", a.id);
                    setAutoListingSelectOpened(false);
                  }}
                  key={a.id}
                  className="w-full h-10 flex items-center hover:bg-tertiary-bg duration-200"
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </Dialog>

        <Dialog isOpen={isPaymentDialogSelectOpened} setIsOpen={setPaymentDialogSelectOpened}>
          <DialogHeader
            onClose={() => setPaymentDialogSelectOpened(false)}
            title="Select auto-listing contract"
          />
          <div className="flex flex-col gap-2">
            {tokensToPay?.data?.map((a: any) => {
              return (
                <button
                  onClick={() => {
                    setPaymentToken(a);
                    // searchParams.set("autoListingAddress", a.id);
                    setPaymentDialogSelectOpened(false);
                  }}
                  key={a.id}
                  className="w-full h-10 flex items-center hover:bg-tertiary-bg duration-200"
                >
                  {formatUnits(a.price, 18)}
                  <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                </button>
              );
            })}
          </div>
        </Dialog>

        <PickTokenDialog
          isOpen={isPickTokenOpened}
          setIsOpen={setPickTokenOpened}
          handlePick={(token) => {
            if (currentlyPicking === "tokenA") {
              setTokenA(token);
              setTokenAAddress(token.address0);
            }
            if (currentlyPicking === "tokenB") {
              setTokenB(token);
              setTokenBAddress(token.address0);
            }

            setPickTokenOpened(false);
          }}
        />

        <ConfirmListingDialog />
      </Container>
    </>
  );
}

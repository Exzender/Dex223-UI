import React, { useMemo, useState } from "react";
import { Address, isAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

import Checkbox from "@/components/atoms/Checkbox";
import DialogHeader from "@/components/atoms/DialogHeader";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import TextField from "@/components/atoms/TextField";
import Button, { ButtonSize } from "@/components/buttons/Button";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { ERC20_ABI } from "@/config/abis/erc20";
import { TOKEN_CONVERTER_ABI } from "@/config/abis/tokenConverter";
import { db, TokenList } from "@/db/db";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useTokenLists } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";
import { CONVERTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { Token } from "@/sdk_hybrid/entities/token";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
  handleClose: () => void;
}

function EmptyState({
  tokenAddressToImport,
  isFound,
}: {
  tokenAddressToImport: string;
  isFound: boolean;
}) {
  if (!tokenAddressToImport) {
    return (
      <div className="flex-grow flex justify-center items-center flex-col gap-2">
        <EmptyStateIcon iconName="imported" />
        <p className="text-secondary-text text-center">
          To import a token, enter a token address in the format 0x...
        </p>
      </div>
    );
  }

  if (!isAddress(tokenAddressToImport)) {
    return (
      <div className="flex items-center justify-center gap-2 flex-col flex-grow">
        <EmptyStateIcon iconName="warning" />
        <span className="text-red-input">Enter valid token address</span>
      </div>
    );
  }

  if (!isFound) {
    return (
      <div className="flex items-center justify-center gap-2 flex-col flex-grow">
        <EmptyStateIcon iconName="search" />
        <span className="text-secondary-text">Token not found</span>
      </div>
    );
  }
}

export default function ImportToken({ setContent, handleClose }: Props) {
  const [tokenAddressToImport, setTokenAddressToImport] = useState("");
  const chainId = useCurrentChainId();
  const tokenLists = useTokenLists();

  const { data: tokenName, isFetched } = useReadContract({
    abi: ERC20_ABI,
    functionName: "name",
    chainId,
    address: tokenAddressToImport! as Address,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const { data: tokenSymbol } = useReadContract({
    abi: ERC20_ABI,
    functionName: "symbol",
    address: tokenAddressToImport! as Address,
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const { data: tokenDecimals } = useReadContract({
    abi: ERC20_ABI,
    functionName: "decimals",
    address: tokenAddressToImport! as Address,
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const { data: erc223Address } = useReadContract({
    abi: TOKEN_CONVERTER_ABI,
    functionName: "getERC223WrapperFor",
    address: CONVERTER_ADDRESS[chainId],
    args: [tokenAddressToImport as Address],
    chainId,
    query: {
      enabled: !!tokenAddressToImport && isAddress(tokenAddressToImport),
    },
  });

  const [checkedUnderstand, setCheckedUnderstand] = useState<boolean>(false);

  const custom = useTokenLists(true);

  const alreadyImported = useMemo(() => {
    return !!(custom && custom?.[0]?.list.tokens.find((v) => v.address0 === tokenAddressToImport));
  }, [custom, tokenAddressToImport]);

  return (
    <>
      <DialogHeader
        onBack={() => setContent("default")}
        onClose={handleClose}
        title="Import token"
      />
      <div className="w-full md:w-[600px] px-4 pb-4 md:px-10 md:pb-10 min-h-[580px] flex flex-col">
        <TextField
          label="Import token"
          value={tokenAddressToImport}
          onChange={(e) => setTokenAddressToImport(e.target.value)}
          placeholder="Token address (0x...)"
          error={
            Boolean(tokenAddressToImport) && !isAddress(tokenAddressToImport)
              ? "Enter token address in correct format"
              : ""
          }
        />

        <EmptyState
          tokenAddressToImport={tokenAddressToImport}
          isFound={Boolean(
            tokenName && typeof tokenDecimals !== "undefined" && tokenSymbol && erc223Address?.[0],
          )}
        />

        {tokenName && typeof tokenDecimals !== "undefined" && tokenSymbol && erc223Address?.[0] && (
          <>
            <div className="flex-grow">
              <div className="flex items-center gap-3 pb-2.5 mt-0.5 mb-3">
                <img
                  className="w-12 h-12"
                  width={48}
                  height={48}
                  src="/tokens/placeholder.svg"
                  alt=""
                />
                <div className="flex flex-col text-16">
                  <span className="text-primary-text">{tokenSymbol}</span>
                  <span className="text-secondary-text">
                    {tokenName} ({tokenDecimals} decimals)
                  </span>
                </div>
              </div>
              {!alreadyImported && (
                <>
                  <div className="mb-4">
                    <span className="text-primary-text">
                      <b>ERC223:</b> {erc223Address[0]}
                    </span>
                  </div>
                  <div className="px-5 py-3 flex gap-2 rounded-1 border border-orange bg-orange-bg">
                    <Svg className="text-orange shrink-0" iconName="warning" />
                    <p className="text-16 text-primary-text flex-grow">
                      Create tokens with caution, as including fake versions of existing tokens is
                      possible. Be aware that certain tokens may not align with DEX223 services.
                      Importing custom tokens acknowledges and accepts associated risks. Learn more
                      about potential risks before proceeding
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {!alreadyImported && (
                <Checkbox
                  checked={checkedUnderstand}
                  handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
                  id="approve-list-import"
                  label="I understand"
                />
              )}
              <Button
                fullWidth
                size={ButtonSize.MEDIUM}
                disabled={!checkedUnderstand || alreadyImported}
                onClick={async () => {
                  if (chainId && tokenName && tokenDecimals && tokenSymbol && erc223Address?.[0]) {
                    const currentCustomList = tokenLists?.find((t) => t.id === `custom-${chainId}`);

                    const token = new Token(
                      chainId,
                      tokenAddressToImport as Address,
                      erc223Address[0] as Address,
                      tokenDecimals,
                      tokenSymbol,
                      tokenName,
                      "/tokens/placeholder.svg",
                    );

                    if (!currentCustomList) {
                      await db.tokenLists.add({
                        id: `custom-${chainId}`,
                        enabled: true,
                        chainId,
                        list: {
                          name: "Custom token list",
                          version: {
                            minor: 0,
                            major: 0,
                            patch: 0,
                          },
                          tokens: [token],
                          logoURI: "/token-list-placeholder.svg",
                        },
                      });
                    } else {
                      (db.tokenLists as any).update(`custom-${chainId}`, {
                        "list.tokens": [...currentCustomList.list.tokens, token],
                      });
                    }
                  }
                  setContent("default");
                  addToast("Token imported");
                }}
              >
                {alreadyImported ? "Token is already imported" : `Import ${tokenSymbol}`}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button from "@/components/buttons/Button";
import {
  PositionInfo,
  usePositionFromPositionInfo,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { Link, useRouter } from "@/navigation";

import { useActiveWalletsPositions } from "../stores/positions.hooks";
import { WalletPositions } from "../stores/useWalletsPosotions";

const PositionTableItem = ({ positionInfo }: { positionInfo: PositionInfo }) => {
  const position = usePositionFromPositionInfo(positionInfo);
  const { inRange, removed } = usePositionRangeStatus({ position });

  return (
    <>
      <div
        className={clsx(
          "h-[56px] flex items-center gap-2 pl-5 rounded-l-3",
          // index % 2 !== 0 && "bg-tertiary-bg",
        )}
      >
        <span>{`${positionInfo.tokenId}`}</span>
      </div>
      <div className={clsx("h-[56px] flex items-center gap-2")}>
        <Image src="/tokens/placeholder.svg" width={24} height={24} alt="" />
        <Image
          src="/tokens/placeholder.svg"
          width={24}
          height={24}
          alt=""
          className="ml-[-20px] bg-primary-bg rounded-full"
        />

        {position
          ? `${position.amount0.toSignificant()} ${position.pool.token0.symbol}/${position.amount1.toSignificant()} ${position.pool.token1.symbol}`
          : "Loading..."}
      </div>
      <div className={clsx("h-[56px] flex items-center")}>$0.00</div>
      <div className={clsx("h-[56px] flex items-center")}>$0.00</div>
      <div className={clsx("h-[56px] flex items-center pr-5 rounded-r-3")}>
        <RangeBadge
          status={
            removed
              ? PositionRangeStatus.CLOSED
              : inRange
                ? PositionRangeStatus.IN_RANGE
                : PositionRangeStatus.OUT_OF_RANGE
          }
        />
      </div>
    </>
  );
};
export const LiquidityPositions = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");

  const { loading, positions: walletsPositions } = useActiveWalletsPositions();

  const currentTableData: WalletPositions[] = searchValue
    ? walletsPositions
        .map((value) => {
          const positions = value.positions.filter(({ tokenId }) => {
            if (!tokenId) return false;
            return tokenId?.toString() === searchValue;
          });
          if (!positions.length) return undefined as any;
          return {
            ...value,
            positions,
          };
        })
        .filter((value) => !!value)
    : walletsPositions;

  return (
    <>
      <div className="mt-5 flex gap-5">
        <div className="flex items-center justify-between bg-portfolio-margin-positions-gradient rounded-3 px-4 py-3 lg:px-5 lg:py-6 w-full lg:w-[50%]">
          <div className="flex flex-col ">
            <div className="flex items-center gap-1">
              <span className="text-14 lg:text-16">Provided liquidity balance</span>
              <Tooltip iconSize={20} text="Info text" />
            </div>
            <span className="text-24 lg:text-32 font-medium">$ —</span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col lg:flex-row w-full justify-between gap-2 lg:gap-0">
        <h1 className="text-18 lg:text-32 font-medium">{t("liquidity_title")}</h1>
        <div className="flex flex-col lg:flex-row gap-3">
          <Link href="/pools/positions" className="w-full lg:w-auto">
            <Button fullWidth>
              <span className="flex items-center gap-2 w-max">
                Liquidity positions
                <Svg iconName="forward" />
              </span>
            </Button>
          </Link>

          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("liquidity_search_placeholder")}
            className="bg-primary-bg lg:w-[480px]"
          />
        </div>
      </div>

      <div className="mt-5 min-h-[640px] mb-5 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[550px]">
            <Preloader type="awaiting" size={48} />
          </div>
        ) : currentTableData.length ? (
          <div className="pr-5 pl-5 grid rounded-5 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,1.33fr),_minmax(87px,2.67fr),_minmax(55px,1.33fr),_minmax(50px,1.33fr),_minmax(50px,1.33fr)] pb-2 relative">
            <div className="text-secondary-text pl-5 h-[60px] flex items-center">ID</div>
            <div className="text-secondary-text h-[60px] flex items-center gap-2">
              Amount tokens
            </div>
            <div className="text-secondary-text h-[60px] flex items-center">Amount, $</div>
            <div className="text-secondary-text h-[60px] flex items-center">Unclaimed fees</div>
            <div className="text-secondary-text pr-5 h-[60px] flex items-center">Status</div>

            {currentTableData?.map(({ positions }, index: number) => {
              return (
                <React.Fragment key={index}>
                  {positions.map((position) => (
                    <PositionTableItem key={position.tokenId} positionInfo={position} />
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        ) : Boolean(searchValue) ? (
          <div className="flex flex-col justify-center items-center h-full min-h-[340px] bg-primary-bg rounded-5 gap-1">
            <EmptyStateIcon iconName="search" />
            <span className="text-secondary-text">Positions not found</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full min-h-[340px] bg-primary-bg rounded-5 gap-1">
            <EmptyStateIcon iconName="pool" />
            <span className="text-secondary-text">No liquidity positions yet</span>
          </div>
        )}
      </div>
    </>
  );
};
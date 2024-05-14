import { useState } from "react";

import Popover from "@/components/atoms/Popover";
import Svg from "@/components/atoms/Svg";
import Switch from "@/components/atoms/Switch";
import IconButton from "@/components/buttons/IconButton";
import { TokenList } from "@/config/types/TokenList";

export default function TokenListItem({
  tokenList,
  toggle,
}: {
  tokenList: TokenList;
  toggle: any;
}) {
  const [open, setOpen] = useState(false);
  const [isPopoverOpened, setPopoverOpened] = useState(false);

  return (
    <div>
      <div className="flex justify-between py-1.5 px-4 md:px-10">
        <div className="flex gap-3 items-center">
          <img
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = "/token-list-placeholder.svg";
            }}
            loading="lazy"
            width={40}
            height={40}
            className="w-10 h-10"
            src={tokenList.logoURI}
            alt=""
          />
          <div className="flex flex-col">
            <span>{tokenList.name}</span>
            <div className="flex gap-1 items-cente text-secondary-text">
              {tokenList.tokens.length} tokens
              <Popover
                placement="top-end"
                isOpened={isPopoverOpened}
                setIsOpened={() => setPopoverOpened(!isPopoverOpened)}
                trigger={
                  <button
                    onClick={() => setPopoverOpened(true)}
                    className="text-secondary-text hover:text-primary-text duration-200 relative"
                  >
                    <Svg iconName="settings" />
                  </button>
                }
              >
                <div className="flex flex-col gap-3 p-5 border-secondary-border border bg-primary-bg rounded-1">
                  v1.0.30
                  <a
                    href="#"
                    className="flex items-center text-green hover:text-green-hover duration-200 gap-2"
                  >
                    See
                    <Svg iconName="forward" />
                  </a>
                  <button className="bg-red py-0.5 px-2 rounded-5 text-black hover:bg-red-hover duration-200">
                    Remove
                  </button>
                </div>
              </Popover>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {tokenList.id === "custom" && (
            <a
              className="flex items-center justify-center w-10 h-10 text-primary-text bg-transparent rounded-full duration-200 hover:bg-white/10"
              download="custom-list.json"
              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(tokenList))}`}
            >
              <Svg iconName="download" />
            </a>
          )}
          <IconButton onClick={() => setOpen(!open)} iconName="details" />
          <Switch checked={tokenList.enabled} handleChange={() => toggle(tokenList.id)} />
        </div>
      </div>
    </div>
  );
}

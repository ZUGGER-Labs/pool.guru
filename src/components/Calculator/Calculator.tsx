"use client";

import { Token } from "@/interfaces/uniswap.interface";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { useRef, useState } from "react";
import { AutoComplete } from "../ui/AutoComplete";

function AddIcon() {
  return (
    <div className="rounded-full border border-black w-10 h-10 flex justify-center items-center bg-[#FFE600]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M10.8425 24V0H13.1575V24H10.8425ZM0 13.1664V10.8336H24V13.1664H0Z"
          fill="black"
        />
      </svg>
    </div>
  );
}

function ComboInput({
  tokens,
  className,
}: {
  tokens: Token[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const onSearchInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target.value;
    setSearch(evt.target.value);
    if (val.trim()) {
      setOpen(true);
    }
    ref.current && ref.current.focus();
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div className="relative flex-1 flex items-center">
          <span className="absolute left-1 text-center w-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21.07 16.83L19 14.71C18.5547 14.2868 17.9931 14.0063 17.3872 13.9047C16.7813 13.8032 16.1589 13.8851 15.6 14.14L14.7 13.24C15.7605 11.8229 16.2449 10.0567 16.0555 8.29684C15.8662 6.537 15.0172 4.91423 13.6794 3.7552C12.3417 2.59618 10.6145 1.98696 8.84565 2.05019C7.07678 2.11341 5.39754 2.84439 4.14596 4.09597C2.89438 5.34755 2.1634 7.0268 2.10017 8.79567C2.03695 10.5645 2.64617 12.2917 3.80519 13.6294C4.96421 14.9672 6.58699 15.8162 8.34683 16.0055C10.1067 16.1949 11.8729 15.7106 13.29 14.65L14.18 15.54C13.8951 16.0996 13.793 16.7346 13.8881 17.3553C13.9831 17.9761 14.2706 18.5513 14.71 19L16.83 21.12C17.3925 21.6818 18.155 21.9974 18.95 21.9974C19.745 21.9974 20.5075 21.6818 21.07 21.12C21.3557 20.8406 21.5828 20.5069 21.7378 20.1386C21.8928 19.7702 21.9726 19.3746 21.9726 18.975C21.9726 18.5754 21.8928 18.1798 21.7378 17.8114C21.5828 17.4431 21.3557 17.1094 21.07 16.83ZM12.59 12.59C11.8902 13.288 10.9993 13.7629 10.0297 13.9549C9.06017 14.1468 8.05549 14.047 7.14259 13.6682C6.2297 13.2894 5.44955 12.6485 4.9007 11.8265C4.35185 11.0046 4.05893 10.0384 4.05893 9.05C4.05893 8.06163 4.35185 7.09544 4.9007 6.27347C5.44955 5.45149 6.2297 4.81062 7.14259 4.43182C8.05549 4.05301 9.06017 3.95325 10.0297 4.14515C10.9993 4.33706 11.8902 4.812 12.59 5.51C13.0556 5.97446 13.4251 6.52621 13.6771 7.13367C13.9292 7.74112 14.0589 8.39233 14.0589 9.05C14.0589 9.70768 13.9292 10.3589 13.6771 10.9663C13.4251 11.5738 13.0556 12.1255 12.59 12.59ZM19.66 19.66C19.567 19.7537 19.4564 19.8281 19.3346 19.8789C19.2127 19.9297 19.082 19.9558 18.95 19.9558C18.818 19.9558 18.6873 19.9297 18.5654 19.8789C18.4436 19.8281 18.333 19.7537 18.24 19.66L16.12 17.54C16.0263 17.447 15.9519 17.3364 15.9011 17.2146C15.8503 17.0927 15.8242 16.962 15.8242 16.83C15.8242 16.698 15.8503 16.5673 15.9011 16.4454C15.9519 16.3236 16.0263 16.213 16.12 16.12C16.213 16.0263 16.3236 15.9519 16.4454 15.9011C16.5673 15.8503 16.698 15.8242 16.83 15.8242C16.962 15.8242 17.0927 15.8503 17.2146 15.9011C17.3364 15.9519 17.447 16.0263 17.54 16.12L19.66 18.24C19.7537 18.333 19.8281 18.4436 19.8789 18.5654C19.9296 18.6873 19.9558 18.818 19.9558 18.95C19.9558 19.082 19.9296 19.2127 19.8789 19.3346C19.8281 19.4564 19.7537 19.567 19.66 19.66Z"
                fill="black"
              />
            </svg>
          </span>
          <input
            value={search}
            ref={ref}
            onFocus={() => ref.current?.focus()}
            onChange={onSearchInput}
            className="flex-1 pl-8 focus-visible:outline-none border border-black leading-[46px] min-w-14"
          />
          <span className="absolute right-1 text-center w-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M13.4099 12L19.7099 5.71C19.8982 5.5217 20.004 5.2663 20.004 5C20.004 4.7337 19.8982 4.47831 19.7099 4.29C19.5216 4.1017 19.2662 3.99591 18.9999 3.99591C18.7336 3.99591 18.4782 4.1017 18.2899 4.29L11.9999 10.59L5.70994 4.29C5.52164 4.1017 5.26624 3.99591 4.99994 3.99591C4.73364 3.99591 4.47824 4.1017 4.28994 4.29C4.10164 4.47831 3.99585 4.7337 3.99585 5C3.99585 5.2663 4.10164 5.5217 4.28994 5.71L10.5899 12L4.28994 18.29C4.19621 18.383 4.12182 18.4936 4.07105 18.6154C4.02028 18.7373 3.99414 18.868 3.99414 19C3.99414 19.132 4.02028 19.2627 4.07105 19.3846C4.12182 19.5064 4.19621 19.617 4.28994 19.71C4.3829 19.8037 4.4935 19.8781 4.61536 19.9289C4.73722 19.9797 4.86793 20.0058 4.99994 20.0058C5.13195 20.0058 5.26266 19.9797 5.38452 19.9289C5.50638 19.8781 5.61698 19.8037 5.70994 19.71L11.9999 13.41L18.2899 19.71C18.3829 19.8037 18.4935 19.8781 18.6154 19.9289C18.7372 19.9797 18.8679 20.0058 18.9999 20.0058C19.132 20.0058 19.2627 19.9797 19.3845 19.9289C19.5064 19.8781 19.617 19.8037 19.7099 19.71C19.8037 19.617 19.8781 19.5064 19.9288 19.3846C19.9796 19.2627 20.0057 19.132 20.0057 19C20.0057 18.868 19.9796 18.7373 19.9288 18.6154C19.8781 18.4936 19.8037 18.383 19.7099 18.29L13.4099 12Z"
                fill="#B7B1A6"
              />
            </svg>
          </span>
        </div>
      </Popover.Trigger>

      <Popover.Content
        asChild
        align="start"
        className="calc-token rounded md:w-[450px] max-h-80 overflow-y-auto p-5 w-full bg-white will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
        sideOffset={5}
      >
        <Command shouldFilter={false}>
          {/* <Command.Input /> */}
          <Command.List className="w-full">
            <Command.Group>
              {tokens.map((token) => {
                const needle = search.trim().toLowerCase();
                if (needle) {
                  if (
                    token.id.toLowerCase() === needle ||
                    token.symbol.toLowerCase().includes(needle)
                  ) {
                    return (
                      <Command.Item
                        key={token.id}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setOpen(false);
                        }}
                      >
                        <div className="flex justify-between w-full">
                          <span>{token.symbol}</span>
                          <span>{token.poolCount} pools</span>
                        </div>
                      </Command.Item>
                    );
                  }
                } else {
                  return (
                    <Command.Item
                      key={token.id}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <div className="flex justify-between w-full">
                        <span>{token.symbol}</span>
                        <span>{token.poolCount} pools</span>
                      </div>
                    </Command.Item>
                  );
                }
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover.Root>
  );
}

function Calculator({ tokens }: { tokens: Token[] }) {
  const [amount, setAmount] = useState(1000);
  return (
    <div>
      <div className="mx-auto flex flex-col justify-center items-center">
        <h1 className="text-[2rem] font-bold leading-10">Yield Calculator</h1>
        <p className="leading-10 text-black/60">
          Finds the best DeFi pool for the selected assets and estimates the
          returns based on an investment amount and the historical metrics of
          the pool
        </p>
      </div>

      <div className="mx-auto w-full md:w-[43rem]">
        <div className="">
          <p className="font-bold leading-5">Assets</p>
          <div className="flex flex-row items-center">
            <AutoComplete tokens={tokens} emptyMessage="" />
            <div className="mx-6">
              <AddIcon />
            </div>
            <div className="relative w-[150px] flex items-center">
              <span className="absolute left-0 w-6 text-center text-[#B1B1B1]">
                $
              </span>
              <span>
                <input
                  value={amount}
                  onChange={(val) => setAmount(+val)}
                  className="border focus-visible:outline-none pl-5 leading-[46px] text-[#111827] border-black focus:rounded-none focus:border focus:border-[#B7B1A6]"
                  type="number"
                />
              </span>
            </div>
          </div>
        </div>

        <div className="">
          <p>Selected assets</p>
          <div></div>

          <div></div>
        </div>

        <button>Calculate</button>
      </div>

      <div></div>
    </div>
  );
}

export default Calculator;

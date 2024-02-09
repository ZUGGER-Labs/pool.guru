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

const useNumStrState = (defaultVal = ""): [string, (val: string) => void] => {
  const removeLeadingZeros = (s: string) => {
    const oldLen = s.length;
    s = s.replace(/^0+/, "");
    if (s.length === 0 && oldLen > 0) {
      s = "0";
    }
    return s;
  };

  defaultVal = removeLeadingZeros(defaultVal);
  const [numVal, setNumVal] = useState(defaultVal);

  const handleChange = (val: string) => {
    val = val.replace(/[^\d]/g, "");
    val = removeLeadingZeros(val);
    setNumVal(val);
  };
  return [numVal, handleChange];
};

function Calculator({ tokens }: { tokens: Token[] }) {
  const [amount, setAmount] = useNumStrState("1000");
  const [selectedAssets, setSelectedAssets] = useState<Set<Token>>(new Set());

  const handleAddAsset = (selectedOption: Token) => {
    const newSelectedAssets = new Set(selectedAssets);
    newSelectedAssets.add(selectedOption);
    setSelectedAssets(newSelectedAssets);
  };

  const handleRemoveAsset = (asset: Token) => {
    const newSelectedAssets = new Set(selectedAssets);
    newSelectedAssets.delete(asset);
    setSelectedAssets(newSelectedAssets);
  };
  return (
    <div>
      <div className="mx-auto flex flex-col justify-center items-center">
        <h1 className="text-[2rem] font-bold leading-10">Yield Calculator</h1>
        <p className="leading-10 text-black/60 text-center">
          Finds the best DeFi pool for the selected assets and estimates the
          returns based on an investment amount and the historical metrics of
          the pool
        </p>
      </div>

      <div className="mx-auto w-full md:w-[43rem] mt-4">
        <div className="">
          <p className="font-bold leading-5 mb-2">Assets</p>
          <div className="flex flex-row items-center">
            <AutoComplete
              options={tokens}
              emptyMessage="No results found"
              onValueChange={handleAddAsset}
            />
            <div className="mx-6">
              <AddIcon />
            </div>
            <div className="relative flex items-center">
              <span className="absolute w-6 text-center text-[#B1B1B1]">$</span>
              <span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-[150px] border focus-visible:outline-none pl-6 leading-[48px] border-[#B7B1A6] focus:border focus:border-black"
                  type="number"
                />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 mb-2">
          <p className="font-bold leading-5 mb-2">Selected assets</p>
          <div className="flex flex-col items-center gap-8">
            {[...selectedAssets].map((asset, index) => (
              <div key={asset.id} className="flex w-[688px] p-4 border border-black bg-white items-center gap-6">
                <div className="flex flex-col items-center justify-center gap-2 w-[90px]">
                  <div className="flex flex-row items-center gap-2">
                    <img
                      src={asset.logoURI}
                      className="w-6 h-6"
                      alt="Icon"
                    ></img>
                    <span className="flex flex-row text-base font-semibold w-full">
                      {asset.symbol}
                    </span>
                  </div>
                  <div className="flex rounded-full bg-gray-200 h-28px px-2 items-center">
                    <span className="text-center text-base italic font-light whitespace-nowrap">
                      {asset.poolCount} pools
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 w-[90px]">
                  <span className="text-gray-400 text-base">Price</span>
                  <span className="text-base">2.45K</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 w-[90px]">
                  <span className="text-gray-400 text-base">Change 7d</span>
                  <span className="text-green-500 text-base"> + 4.12% </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 w-[270px]">
                  <span className="text-gray-400 text-base">Trend 7d</span>
                  <span className="text-green-500 text-center h-7"> + 4.12% </span>
                </div>
                <button
                  onClick={() => handleRemoveAsset(asset)}
                >
                  <img
                      src="/Rounded-edge.svg"
                      className="w-6 h-6"
                    ></img>
                </button>
                {/* <span>{asset.symbol}</span>
                <button
                  className="ml-2 text-red-500"
                  onClick={() => handleRemoveAsset(asset)}
                >
                  X
                </button> */}
              </div>
            ))}
          </div>
        </div>

        <button>Calculate</button>
      </div>

      <div></div>
    </div>
  );
}

export default Calculator;

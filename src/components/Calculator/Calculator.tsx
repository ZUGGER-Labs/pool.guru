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
            <div className="relative w-[150px] flex items-center">
              <span className="absolute w-6 text-center text-[#B1B1B1]">$</span>
              <span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border focus-visible:outline-none pl-6 leading-[48px] border-[#B7B1A6] focus:border focus:border-black"
                  type="number"
                />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-bold leading-5 mb-2">Selected assets</p>
          <div className="flex flex-wrap">
            {[...selectedAssets].map((asset, index) => (
              <div key={asset.id} className="flex items-center mr-2 mb-2">
                <span>{asset.symbol}</span>
                <button
                  className="ml-2 text-red-500"
                  onClick={() => handleRemoveAsset(asset)}
                >
                  X
                </button>
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

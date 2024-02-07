"use client";

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "./command";
import { Command as CommandPrimitive } from "cmdk";
import { useState, useRef, useCallback, type KeyboardEvent } from "react";

import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Token } from "@/interfaces/uniswap.interface";

export type Option = Record<"value" | "label", string> & Record<string, string>;

type AutoCompleteProps = {
  //   options: Option[]
  tokens: Token[];
  emptyMessage: string;
  value?: Option;
  onValueChange?: (value: Token) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export const AutoComplete = ({
  tokens,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Token | null>(null);
  const [inputValue, setInputValue] = useState<string>(value?.label || "");
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [isOpen, tokens, onValueChange]
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
    setInputValue(selected?.symbol || "");
  }, [selected]);

  const handleInputChange = (newValue: string) => {
    const inputValue = newValue.trim();
    setInputValue(inputValue);
  
    const matchedTokens = tokens.filter(option =>
      option.symbol.toLowerCase().includes(inputValue.toLowerCase())
    );
    // console.log(matchedTokens)
  
    setFilteredTokens(matchedTokens);
    console.log(filteredTokens)
  };
  

  const handleSelectOption = useCallback(
    (selectedOption: Token) => {
      console.log(selectedOption)
      setInputValue(selectedOption.symbol);

      setSelected(selectedOption);
      onValueChange?.(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [onValueChange]
  );

  return (
    <CommandPrimitive
      className="w-[450px] rounded-none"
      onKeyDown={handleKeyDown}
    >
      <div>
        <CommandInput
          ref={inputRef}
          value={inputValue}
          // onValueChange={isLoading ? undefined : setInputValue}
          onValueChange={isLoading ? undefined : handleInputChange
            // (newValue) => {
            // handleInputChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
          }
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-base"
        />
      </div>
      <div className="mt-1 relative">
        {isOpen ? (
          <div className="absolute top-0 z-10 w-full bg-stone-50 outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList className="ring-1 ring-slate-200">
              {isLoading ? (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              ) : null}
              {filteredTokens.length > 0 && !isLoading ? (
                <CommandGroup>
                  {filteredTokens.map((option) => {
                    return (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onSelect={() => handleSelectOption(option)}
                        className={cn(
                          "flex items-center gap-2 w-full"
                          // !isSelected ? "pl-8" : null
                        )}
                      >
                        <div
                          className="flex flex-row items-center w-full gap-2"
                          title={option.id}
                        >
                          <img
                            src={option.logoURI}
                            className="w-6 h-6"
                            alt="Icon"
                          ></img>
                          <span className="flex flex-row items-center h-7 text-base font-medium justify-between w-full">
                            {/* {isSelected ? <Check className="w-4" /> : null} */}
                            {option.symbol}
                          </span>
                          <div className="flex rounded-full bg-gray-200 h-28px px-2 items-center">
                            <span className="text-center text-base italic font-light whitespace-nowrap">
                              {option.poolCount} pools
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
              {!isLoading ? (
                <CommandPrimitive.Empty className="select-none px-2 py-3 text-base text-center">
                  {emptyMessage}
                </CommandPrimitive.Empty>
              ) : null}
            </CommandList>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  );
};

"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronRight, Check, Dot } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import _ from "lodash";

import { FilterConfig } from "@/lib/filter";
import { cn } from "@/lib/utils";
import { CatInputContext, ICatValue } from "./FilterContext";

export interface ChoiceProps {
  fc: FilterConfig;
  isMulti: boolean;
}

function ChoiceInput({ fc, isMulti }: ChoiceProps) {
  const { selected, setSelected } = useContext(CatInputContext);
  const { cat, choices } = fc;
  const catKey = "cat-" + cat.catId;
  const valueIdList = selected[catKey] || [];
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const m: { [key: string]: ICatValue } = _.keyBy(
    valueIdList,
    (o) => o.valId + ""
  );
  const [tmpSelected, setTmpSelected] = useState<{ [key: string]: ICatValue }>(
    m
  ); // 多选临时选中项

  useEffect(() => {
    if (cat.customable) {
      choices.push({ valId: 0, configCat: cat.configCat, catValue: "自定义" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat.customable]);

  const toggleClick = (e: React.SyntheticEvent<HTMLElement>, id: number) => {
    e.stopPropagation();
    e.preventDefault();

    let actived = false;
    for (let item of valueIdList) {
      if (item.valId === id) {
        // this cat value has been select
        actived = true;
        break;
      }
    }
    const choice = choices.filter((c) => c.valId === id)[0];
    if (isMulti) {
      if (actived) {
        // const catValList = tmpSelected[catKey]
        delete tmpSelected[id + ""];
        setTmpSelected({ ...tmpSelected });
        // const newVal = selected[catKey].filter((val) => val !== id);
        // setSelected({ ...selected, [catKey]: newVal });
      } else {
        setTmpSelected({
          ...tmpSelected,
          [id + ""]: { valId: choice.valId, value: choice.catValue },
        });
        // const newVal = _.clone(selected[catKey]);
        // newVal.push(id);
        // setSelected({ ...selected, [catKey]: newVal });
      }
    } else {
      if (id === 0) {
        // show input
        setCustomInput(true);

        setSelected({ ...selected, [catKey]: [{ valId: 0, value: "" }] });
      } else {
        setCustomInput(false);
        if (actived) {
          // toggle to false
          setSelected({ ...selected, [catKey]: [] });
        } else {
          const val = choice.catValue;
          setSelected({ ...selected, [catKey]: [{ valId: id, value: val }] });
          setOpen(false);
        }
      }
    }
  };

  const isActive = (idx: number) => {
    if (isMulti) {
      return tmpSelected[idx];
    }
    const valList = selected[catKey];
    for (let val of valList) {
      if (val.valId === idx) {
        return true;
      }
    }
    return false;
  };

  const onClear = () => {
    setTmpSelected({});
    setSelected({ ...selected, [catKey]: [] });
    setCustomVal("");
    setCustomInput(false);

    setOpen(false);
  };

  const onApply = () => {
    const customItem = { valId: 0, value: customVal };
    setTmpSelected({
      ...tmpSelected,
      "0": customItem,
    });
    const valList = [customItem]; // _.values(tmpSelected); // _.keys(tmpSelected).map(k => Number(k))
    setSelected({ ...selected, [catKey]: valList });
    // %255B202%2C206%255D
    // %[202,206%]
    setOpen(false);
  };

  return (
    <div>
      <DropdownMenu.Root open={open} onOpenChange={(o) => setOpen(o)}>
        <DropdownMenu.Trigger asChild>
          <button className="flex flex-row items-center py-1 px-4">
            <span className={cn(open ? "text-blue-500" : "")}>
              {cat.configCatCn}
            </span>
            {open && (
              <span className="transition-all">
                <ChevronDown color="rgb(59 130 246)" strokeWidth={1} />
              </span>
            )}
            {!open && (
              <span className="transition-all">
                <ChevronRight strokeWidth={1} />
              </span>
            )}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="bg-slate-50 min-w-[320px] max-w-[640px] rounded-md text-sm p-4 z-10">
            <div className="grid gap-4 grid-cols-4">
              {choices.map((child, idx) => {
                return (
                  <div key={idx}>
                    <>
                      <button
                        key={child.valId}
                        data-cat-val-idx={idx}
                        className={cn(
                          "relative py-1 w-20 text-sm leading-6 text-black border transition-all flex flex-row justify-center items-center text-center",
                          isActive(child.valId)
                            ? "border-[#222]"
                            : "border-slate-300"
                        )}
                        onClick={(e) => {
                          toggleClick(e, child.valId);
                        }}
                      >
                        {isActive(child.valId) && (
                          <>
                            <span className="absolute w-4 h-4 right-0 bottom-0 config-val-checked"></span>
                            {isMulti && (
                              <Check
                                className="absolute -right-1 -bottom-1"
                                color="#fff"
                                size={16}
                                strokeWidth={1}
                              />
                            )}
                            {!isMulti && (
                              <Dot
                                className="absolute -right-1 -bottom-1"
                                color="#fff"
                                size={16}
                                strokeWidth={1}
                              />
                            )}
                          </>
                        )}
                        <span>{child.catValue}</span>
                      </button>
                    </>
                  </div>
                );
              })}
            </div>

            {((isMulti && choices.length > 0) || customInput) && (
              <div className="mt-2 flex flex-row justify-end items-center pr-2">
                {customInput && (
                  <input
                    type="text"
                    autoFocus={true}
                    value={customVal}
                    className="leading-6 px-2 py-2 rounded-none focus:rounded-none mr-4"
                    onChange={(e) => setCustomVal(e.target.value)}
                  />
                )}
                <button
                  onClick={onClear}
                  className="text-[#222] p-2 mr-6 border border-slate-300"
                >
                  Clear
                </button>
                <button
                  onClick={onApply}
                  className="text-white bg-[#222] p-2 border border-slate-300"
                >
                  Apply
                </button>
              </div>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

export default ChoiceInput;

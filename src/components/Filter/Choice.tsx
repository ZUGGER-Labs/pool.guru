"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronRight, Check, Dot } from "lucide-react";
import { useContext, useState } from "react";
import _ from "lodash";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  FilterConfig,
  getFilterSelectName,
  getQuerySearchFiler,
  toFilterValueNames,
} from "@/lib/filter";
import { cn } from "@/lib/utils";
import { FilterContext } from "./FilterContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildURI } from "@/lib/page";

export interface ChoiceDialogProps {
  fc: FilterConfig;
  isMulti: boolean;
  selectMenu?: boolean;
}

function ChoiceDialog({ fc, isMulti, selectMenu }: ChoiceDialogProps) {
  const { selected, setSelected } = useContext(FilterContext);
  const { cat, choices } = fc;
  const catKey = "cat-" + cat.catId;
  const valueIdList = selected[catKey] || [];
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const m: { [key: string]: boolean } = {};
  for (let k in valueIdList) {
    m[valueIdList[k] + ""] = true;
  }
  const [tmpSelected, setTmpSelected] = useState<{ [key: string]: boolean }>(m); // 多选临时选中项

  const toggleClick = (e: React.SyntheticEvent<HTMLElement>, id: number) => {
    e.stopPropagation();
    e.preventDefault();

    let actived = !!tmpSelected[id];

    if (isMulti) {
      const newVal: number[] = [];
      if (actived) {
        setTmpSelected({ ...tmpSelected, [id + ""]: false });

        _.mapKeys(tmpSelected, (val, key) => {
          const iKey = +key;
          if (id !== iKey) {
            newVal.push(iKey);
          }
        });
        setSelected({ ...selected, [catKey]: newVal });
      } else {
        setTmpSelected({ ...tmpSelected, [id + ""]: true });
        _.mapKeys(tmpSelected, (val, key) => {
          newVal.push(+key);
        });
        setSelected({ ...selected, [catKey]: newVal });
      }
      console.log("selected:", catKey, newVal, selected[catKey]);
    } else {
      if (actived) {
        // toggle to false
        setSelected({ ...selected, [catKey]: [] });
        router.push(buildURI(pathname, query, catKey, null));
      } else {
        setSelected({ ...selected, [catKey]: [id] });
        router.push(buildURI(pathname, query, catKey, id + ""));
      }
    }
  };

  const isActive = (idx: number) =>
    isMulti
      ? tmpSelected[idx]
      : selected[catKey] && selected[catKey].indexOf(idx) !== -1;

  const selectedCount = () => {
    // if (isMulti) {
    //   return _.size(tmpSelected)
    // }
    return _.size(selected[catKey]);
  };

  const onClear = () => {
    setTmpSelected({});
    setSelected({ ...selected, [catKey]: [] });

    router.push(buildURI(pathname, query, catKey, null));
    setOpen(false);
  };

  const onApply = () => {
    const valList = _.keys(tmpSelected).map((k) => Number(k));
    setSelected({ ...selected, [catKey]: valList });
    // %255B202%2C206%255D
    // %[202,206%]
    router.push(buildURI(pathname, query, catKey, JSON.stringify(valList)));
    setOpen(false);
  };

  if (selectMenu) {
    return (
      <div>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={"Select " + fc.cat.configCat} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {/* <SelectLabel>
                {getFilterSelectName(
                  fc,
                  getQuerySearchFiler(query, "cat-" + fc.cat.catId)
                )}
              </SelectLabel> */}
              {choices.map((child, idx) => (
                <SelectItem key={idx} value={child.valId + ""}>
                  {child.catValue}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div>
      <DropdownMenu.Root open={open} onOpenChange={(o) => setOpen(o)}>
        <DropdownMenu.Trigger asChild>
          <button className="flex flex-row items-center py-1 px-4">
            <span className={cn(open ? "text-blue-500" : "")}>
              {cat.configCatCn}
            </span>
            {selectedCount() > 0 && (
              <span className="mx-2 w-6 h-6 rounded-full bg-[#42ff77] inline-flex justify-center items-center">
                {selectedCount()}
              </span>
            )}
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

            {isMulti && choices.length > 0 && (
              <div className="mt-2 flex flex-row justify-end items-center pr-2">
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

export default ChoiceDialog;

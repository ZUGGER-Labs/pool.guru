"use client";

import { Check, Dot } from "lucide-react";
import { useContext, useState } from "react";
import _ from "lodash";

import { FilterConfig } from "@/lib/filter";
import { cn } from "@/lib/utils";
import { FilterContext } from "./FilterContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildURI } from "@/lib/page";

export interface ChoiceProps {
  fc: FilterConfig;
  isMulti: boolean;
}

function ChoiceMobile({ fc, isMulti }: ChoiceProps) {
  const { selected, setSelected } = useContext(FilterContext);
  const { cat, choices } = fc;
  const catKey = "cat-" + cat.catId;
  const valueIdList = selected[catKey] || [];

  const m: { [key: string]: boolean } = {};
  for (let k in valueIdList) {
    // console.log(catKey, valueIdList[k])
    m[valueIdList[k] + ""] = true;
  }
  const [tmpSelected, setTmpSelected] = useState<{ [key: string]: boolean }>(m); // 多选临时选中项
  // console.log('choice mobile:', catKey, m, tmpSelected, valueIdList)

  const toggleClick = (e: React.SyntheticEvent<HTMLElement>, id: number) => {
    e.stopPropagation();
    e.preventDefault();

    let actived = !!tmpSelected[id];

    if (isMulti) {
      if (actived) {
        setTmpSelected({ ...tmpSelected, [id + ""]: false });
        const newVal: number[] = [];

        _.mapKeys(tmpSelected, (val, key) => {
          const iKey = +key;
          if (id !== iKey) {
            newVal.push(iKey);
          }
        });
        setSelected({ ...selected, [catKey]: newVal });
      } else {
        setTmpSelected({ ...tmpSelected, [id + ""]: true });
        const newVal: number[] = [id];
        _.mapKeys(tmpSelected, (val, key) => {
          newVal.push(+key);
        });
        setSelected({ ...selected, [catKey]: newVal });
      }
    } else {
      if (actived) {
        // toggle to false
        setTmpSelected({})
        setSelected({ ...selected, [catKey]: [] });
        // router.push(buildURI(pathname, query, catKey, null))
      } else {
        setTmpSelected({[id]: true})
        setSelected({ ...selected, [catKey]: [id] });
        // router.push(buildURI(pathname, query, catKey, id+''))
      }
    }
  };

  const isActive = (idx: number) =>
    isMulti
      ? tmpSelected[idx]
      : selected[catKey] && selected[catKey].indexOf(idx) !== -1;

  return (
    <div>
      <div>
        <div>
          <button className="flex flex-row items-center py-1 px-4">
            <span>
              {cat.configCatCn}
            </span>
          </button>
        </div>

        <div>
          <div className="bg-slate-50 w-[300px] rounded-md text-sm p-2 z-10">
            <div className="grid gap-4 grid-cols-3">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChoiceMobile;

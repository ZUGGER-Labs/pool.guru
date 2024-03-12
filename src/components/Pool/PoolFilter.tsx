"use client";

import {
  FilterConfig,
  getQuerySearchFiler,
  toFilterValueNames,
} from "@/lib/filter";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FilterContext, TFilterContext } from "../Filter/FilterContext";
import FilterMobile from "../Filter/FilterMobile";
import { Filter as FilterIcon } from "lucide-react";
import ChoiceDialog from "../Filter/Choice";

function PoolFilter({ filters }: { filters: FilterConfig[] }) {
  const query = useSearchParams();
  const initial: { [key: string]: number[] } = {};

  for (let fc of filters) {
    const key = "cat-" + fc.cat.catId;
    initial[key] = [];
    const vals = query.get(key);

    console.log(`query item: key=${key} val=${vals}`);
    if (vals) {
      try {
        const val = JSON.parse(vals);
        if (typeof val === "number") {
          initial[key] = [val];
          console.log(
            `parsed query item: key=${key} vals=${vals} val=${val}`,
            typeof val,
            val
          );
        } else {
          initial[key] = val;
        }
      } catch {
        console.log(`invalid query item: key=${key} val=${vals}`);
      }
    }
  }

  // const filtered = (fc: FilterConfig) => {
  //   const vals = initial["cat-" + fc.cat.catId];
  //   if (vals.length === 0) {
  //     return "ALL";
  //   }
  //   return toFilterValueNames(
  //     filters,
  //     fc.cat.catId,
  //     getQuerySearchFiler(query, "cat-" + fc.cat.catId)
  //   );
  // };

  const [selected, setSelected] = useState(initial);
  const props: TFilterContext = {
    productCat: 0,
    configs: filters,
    selected,
    setSelected,
  };

  return (
    <div className="py-2">
      <div className="w-screen flex md:hidden">
        <FilterContext.Provider value={props}>
          <div
            className="pr-4"
            onClick={() => console.log("selected result:", props.selected)}
          >
            <FilterMobile filterConfigs={filters} />
          </div>
        </FilterContext.Provider>
      </div>

      <div className="hidden md:flex md:w-full md:items-center md:flex-col text-sm">
        <div className="flex flex-row">
          <FilterContext.Provider value={props}>
            <div
              className="pr-32"
              onClick={() => console.log("selected result:", props.selected)}
            >
              <FilterIcon strokeWidth={1.5} />
            </div>
            {filters.map((filter, idx) => {
              return (
                <div key={idx} className="w-32">
                  <ChoiceDialog isMulti={filter.cat.multiFilter} fc={filter} />
                </div>
              );
            })}
          </FilterContext.Provider>
        </div>

        {/* <div className="flex flex-row">
          <div className="pr-8">Filtered</div>
          {filters.map((filter, idx) => {
            return <div key={idx} className="w-32 pl-1">{filtered(filter)}</div>;
          })}
        </div> */}
      </div>
    </div>
  );
}

export default PoolFilter;

"use client";

import { FilterConfig } from "@/lib/filter";
import ChoiceDialog from "./Choice";
import { Filter as FilterIcon } from "lucide-react";
import { useState } from "react";
import { FilterContext, TFilterContext } from "./FilterContext";
import FilterMobile from "./FilterMobile";
import { useSearchParams } from "next/navigation";

function Filter({
  productCat,
  filterConfigs,
}: {
  productCat: number;
  filterConfigs: FilterConfig[];
}) {
  const query = useSearchParams()
  const initial: { [key: string]: number[] } = {};
  for (let fc of filterConfigs) {
    const key = "cat-" + fc.cat.catId
    initial[key] = [];
    const vals = query.get(key)

    console.log(`query item: key=${key} val=${vals}`)
    if (vals) {
      try {
        const val = JSON.parse(vals)
        if (typeof val === 'number') {
          initial[key] = [val]
          console.log(`parsed query item: key=${key} vals=${vals} val=${val}`, typeof val, val)
        } else {
          initial[key] = val
        }
      } catch {
        console.log(`invalid query item: key=${key} val=${vals}`)
      }
    }
  }
  const [selected, setSelected] = useState(initial);
  const props: TFilterContext = {
    productCat,
    configs: filterConfigs,
    selected,
    setSelected,
  };

  return (
    <>
      <div className="w-screen flex md:hidden">
        <FilterContext.Provider value={props}>
          <div
            className="pr-4"
            onClick={() => console.log("selected result:", props.selected)}
          >
            <FilterMobile filterConfigs={filterConfigs} />
          </div>
        </FilterContext.Provider>
      </div>

      <div className="hidden md:flex md:w-full md:items-center md:flex-row text-sm">
        <FilterContext.Provider value={props}>
          <div
            className="pr-4"
            onClick={() => console.log("selected result:", props.selected)}
          >
            <FilterIcon strokeWidth={1.5} />
          </div>
          {filterConfigs.map((filter, idx) => {
            return (
              <ChoiceDialog key={idx} isMulti={filter.cat.multiFilter} fc={filter} />
            );
          })}
        </FilterContext.Provider>
      </div>
    </>
  );
}

export default Filter;

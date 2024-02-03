"use client";

import { FilterConfig } from "@/lib/filter";
import Choice from "./Choice";
import { Filter as FilterIcon } from "lucide-react";
import { useState } from "react";
import { FilterContext, TFilterContext } from "./FilterContext";

function Filter({
  productCat,
  filterConfigs,
}: {
  productCat: number;
  filterConfigs: FilterConfig[];
}) {
  const initial: { [key: string]: number[] } = {};
  for (let fc of filterConfigs) {
    initial["cat-" + fc.cat.catId] = [];
  }
  const [selected, setSelected] = useState(initial);
  const props: TFilterContext = {
    productCat,
    configs: filterConfigs,
    selected,
    setSelected,
  };

  return (
    <div className="w-screen md:w-full flex flex-col items-center md:flex-row text-sm">
      <FilterContext.Provider value={props}>
        <div
          className="pr-4"
          onClick={() => console.log("selected result:", props.selected)}
        >
          <FilterIcon strokeWidth={1.5} />
        </div>
        {filterConfigs.map((filter, idx) => {
          return (
            <Choice
              key={filter.cat.catId}
              index={idx}
              isMulti={filter.cat.multiFilter}
              fc={filter}
            />
          );
        })}
      </FilterContext.Provider>
    </div>
  );
}

export default Filter;

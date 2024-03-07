"use client";

import { Drawer } from "vaul";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ChoiceMobile from "./ChoiceMobile";
import { FilterConfig } from "@/lib/filter";
import { useContext, useState } from "react";
import { FilterContext } from "./FilterContext";
import { FilterIcon } from "lucide-react";
import { buildURIByKeys, clearURI } from "@/lib/page";

function FilterMobile({ filterConfigs }: { filterConfigs: FilterConfig[] }) {
  const { selected, setSelected } = useContext(FilterContext);
  const [open, setOpen] = useState(false)
  const pathname = usePathname();
  const query = useSearchParams();
  const router = useRouter();

  const onClear = () => {
    const initial: { [key: string]: number[] } = {};
    const keys = [];
    for (let fc of filterConfigs) {
      const key = "cat-" + fc.cat.catId;
      initial[key] = [];
      keys.push(key);
    }
    setSelected(initial);

    router.push(clearURI(pathname, query, keys));
    setOpen(false)
  };

  const onApply = () => {
    const keys = [];
    const vals = [];

    for (let key in selected) {
      keys.push(key);
      vals.push(JSON.stringify(selected[key]));
    }

    router.push(buildURIByKeys(pathname, query, keys, vals));
    setOpen(false)
  };

  return (
    <>
      <Drawer.Root direction="right" open={open} onOpenChange={(o) => setOpen(o)}>
        <Drawer.Trigger asChild>
          <FilterIcon strokeWidth={1.5} />
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-white flex flex-col z-50 h-full w-[330px] mt-24 fixed outline-0 bottom-0 right-0">
            <div className="p-4 bg-white flex-1 h-full">
              <div className="max-w-md mx-auto">
                <Drawer.Title className="font-medium mb-4">Filter</Drawer.Title>
                {filterConfigs.map((filter, idx) => {
                  return (
                    <ChoiceMobile
                      key={idx}
                      isMulti={filter.cat.multiFilter}
                      fc={filter}
                    />
                  );
                })}

                <div>
                  <div className="mt-6 flex flex-row justify-end items-center pr-2 text-sm">
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
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

export default FilterMobile;

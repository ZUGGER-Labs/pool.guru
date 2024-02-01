import { FilterConfig } from '@/lib/filter';
import { Dispatch, SetStateAction, createContext } from 'react';

export type TFilterContext = {
    productCat: number
    configs: readonly FilterConfig[];
    selected: { [key: string]: number[] };  // key: cat-{catId}; value: value id array
    setSelected: Dispatch<SetStateAction<{
        [key: string]: number[];
    }>>
    
}

export const FilterContext = createContext<TFilterContext>({
    productCat: 0,
    configs: [],
    selected: {},
    setSelected: () => {}
})

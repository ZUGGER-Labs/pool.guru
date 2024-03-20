// filter interface


// 数据库记录的id和value
export interface IdValue {
  id: number;
  value: string;
}

export interface FilterCatValue {
  valId: number;
  configCat: string;
  catValue: string;
  valDesc?: any;
}

export interface FilterCat {
  catId: number;
  multiFilter: boolean; // 是否多选
  mulitInput: boolean
  quantifiable: boolean;
  filterable: boolean;
  customable?: boolean;
  mandatory?: boolean;
  configCat: string;
  configCatCn: string;
  catDesc?: any;
  selectMenu?: boolean;
}

export interface FilterConfig {
  cat: FilterCat;
  choices: FilterCatValue[];
}

export interface FilterResult {
  productCat: number
  configCats: {[key: string]: number | number[]}
}

// 解析 url filter 参数
function extractSearchParams(params: {
  [key: string]: string | string[] | undefined;
}): FilterResult {
  let productCat = 0
  const param: { [key: string]: number | number[] } = {};

  for (let key in params) {
    if (key === "p") {
      continue;
    }
    const val = params[key];
    if (!val) {
      continue;
    }
    if (key === 'productCat') {
      productCat = +val
      continue
    }
    if (!key.startsWith('cat-')) {
      continue
    }
    
    if (typeof val === "string") {
      const escaped = decodeURIComponent(val);
      try {
        param[key] = JSON.parse(escaped) as number[];
      } catch {
        // param[key] = [escaped];
        param[key] = +escaped
        console.log('invalid value of key:', key)
      }
    }
  }

  return {productCat, configCats: param };
}

function getQuerySearchFiler(search: URLSearchParams, key: string) {
  const vals = search.get(key + '')
  if (!vals) return [];

  try {
    const val = JSON.parse(vals);
    if (typeof val === "number") {
      return [val];
    } else {
      return val;
    }
  } catch {
    console.log(`invalid query item: key=${key} val=${vals}`);
    return []
  }
}

// 将 filter value 对应的 key 转换为 name
function toFilterValueNames(fcs: FilterConfig[], key: number, vals: number[]) {
  let fc: FilterConfig | undefined = undefined

  if (vals.length === 0) return [];

  for (let item of fcs) {
    if (item.cat.catId === key) {
      fc = item
      break
    }
  }
  if (fc === undefined) {
    throw new Error('not found filterConfig by catId: ' + key)
  }
  
  const names: string[] = []
  const choices = fc.choices
  for (let item of choices) {
    if (vals.indexOf(item.valId) !== -1) {
      names.push(item.catValue)
    }
  }

  return names
}

// radio select
function getFilterSelectName(fc: FilterConfig, val: number) {
  const choices = fc.choices
  for (let item of choices) {
    if (item.valId == val) {
      return item.catValue
    }
  }

  return ''
}


export {
  getQuerySearchFiler,
  toFilterValueNames,
  extractSearchParams,
  getFilterSelectName
}

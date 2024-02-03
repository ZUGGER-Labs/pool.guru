// filter interface


// 数据库记录的id和value
export interface IdValue {
  id: number;
  value: string;
}

export interface VPSFilterResult {
  provider: IdValue;
  cpu: IdValue;
  memory: IdValue;
  disk: IdValue;
  traffic: IdValue;
  line: IdValue;
  ipv4: IdValue;
  ipv6: IdValue;
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
  configCat: string;
  configCatCn: string;
  catDesc?: any;
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

export {
  extractSearchParams
}

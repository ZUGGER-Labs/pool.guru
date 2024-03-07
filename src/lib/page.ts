import { ReadonlyURLSearchParams } from "next/navigation";

export interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export function buildURI(
  pathname: string,
  query:
    | ReadonlyURLSearchParams
    | URLSearchParams
    | { [key: string]: string | string[] | undefined },
  key?: string,
  val?: string | null
) {
  let nq = new URLSearchParams(query as any);
  if (key) {
    if (val) {
      nq.set(key, val!);
    } else {
      nq.delete(key);
    }
  }
  const qs = nq.toString();
  return qs === "" ? pathname : pathname + "?" + qs;
}

export function buildURIByKeys(
  pathname: string,
  query:
    | ReadonlyURLSearchParams
    | URLSearchParams
    | { [key: string]: string | string[] | undefined },
  keys: string[],
  vals: (string[] | string | null)[]
) {
  let nq = new URLSearchParams(query as any);
  
  // console.log('buildURIByKeys:', keys, vals)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const val = vals[i]
    if (val) {
      if (typeof val === 'string') {
        try {
          const v = JSON.parse(val)
          if (v.length === 0) {
            nq.delete(key)
          } else {
            nq.set(key, val)
          }
        } catch {
          nq.set(key, val!);
        }
      } else {
        if (val.length === 0) {
          nq.delete(key)
        } else {
          nq.set(key, JSON.stringify(val))
        }
      }
    } else {
      nq.delete(key);
    }
  }
  const qs = nq.toString();
  return qs === "" ? pathname : pathname + "?" + qs;
}

export function clearURI(
  pathname: string,
  query:
    | ReadonlyURLSearchParams
    | URLSearchParams
    | { [key: string]: string | string[] | undefined },
  keys: string[]
) {
  let nq = new URLSearchParams(query as any);

  for (let key of keys) {
    nq.delete(key);
  }
  const qs = nq.toString();
  return qs === "" ? pathname : pathname + "?" + qs;
}

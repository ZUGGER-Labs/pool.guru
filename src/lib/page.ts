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

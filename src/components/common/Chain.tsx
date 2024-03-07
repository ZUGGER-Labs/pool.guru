/* eslint-disable @next/next/no-img-element */
import { getChainNameLogo } from "@/lib/network";
import { cn } from "@/lib/utils";

export function Chain({ chainId, className }: { chainId: number; className?: string }) {
  const {name, logo} = getChainNameLogo(chainId)

  return (
    <div className={cn("flex flex-row items-center", className)}>
      <span>{name}</span>
      <span className="max-w-9 max-h-9"><img className="object-contain" src={logo} alt={name} max-width="36px" max-height="36px" width="24" height="100%" /></span>
    </div>
  );
}

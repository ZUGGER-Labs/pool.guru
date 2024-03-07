/* eslint-disable @next/next/no-img-element */
import { getDEXLogoByName } from "@/lib/network";
import { cn } from "@/lib/utils";

export function DEX({ name, className }: { name: string; className?: string }) {
  const logo = getDEXLogoByName(name);

  return (
    <div className={cn("flex flex-row items-center", className)}>
      <span>{name}</span>
      <span><img src={logo} alt={name} width={36} height={36} /></span>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import LinkItem from "./LinkItem";
import IconItem from "./IconItem";
// import { useTranslation } from "@/i18n/client";
// import { getLang } from "@/i18n/settings";
// import Link from "next/link";

const Footer = () => {
  const searchParams = useSearchParams();
  // const { t } = useTranslation(getLang(searchParams.get("lang")));
  const year = new Date().getFullYear();

  return (
    <footer className="flex md:mx-auto md:container py-8 justify-between items-center">
      <div className="flex items-center gap-8">
        {LinkItem("FAQ", "")}
        {LinkItem("Docs", "")}
        {LinkItem("Blog", "")}
      </div>
      <div className="flex items-start gap-6">
        {IconItem("/twitter.svg", "https://twitter.com/ZuggerLabs")}
        {IconItem("/github.svg", "https://github.com/ZUGGER-Labs")}
        {IconItem("/discord.svg", "https://discord.gg/WeNskB8CMf")}
      </div>
    </footer>
  );
};

export default Footer;

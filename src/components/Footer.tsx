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
    <footer className="flex w-full py-8 px-4 justify-between items-center">
      <div className="flex items-center gap-8">
        {LinkItem("FAQ", "https://www.google.com")}
        {LinkItem("Docs", "https://www.github.com")}
        {LinkItem("Blog", "https://www.example.com")}
      </div>
      <div className="flex items-start gap-6">
        {IconItem("/twitter.svg")}
        {IconItem("/github.svg")}
        {IconItem("/discord.svg")}
      </div>
      {/* <div className="flex flex-col justify-center text-slate-500 items-center">
        <p className="md:text-sm">
          Copyright © {year === 2024 ? "2024" : `2024 - ${year}`} All Rights
          Reserved
        </p>
      </div> */}
    </footer>
  );
};

export default Footer;

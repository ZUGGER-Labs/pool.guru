"use client";

import Link from "next/link";
import Image from "next/image";

import { CiGlobe } from "react-icons/ci";
import { CiLight } from "react-icons/ci";
// import { MdCurrencyBitcoin } from "react-icons/md";
// import { CiBellOn } from "react-icons/ci";
// import { VscAdd } from "react-icons/vsc";

// import { HeaderProps } from "@/utils/header";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "@/i18n/client";
import { getLang } from "@/i18n/settings";

// const Header = ({ t, pathname, lang, searchParams }: HeaderProps) => {
const Header = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { t } = useTranslation(getLang(searchParams.get("lang")));
  let query = searchParams.toString();
  query = query === "" ? "" : "?" + searchParams.toString();

  const navList = [
    {
      url: "/",
      title: t("Home"),
      isActive: false,
    },
    {
      url: "/pools",
      title: t("Pools"),
      isActive: false,
    },
    {
      url: "/positions",
      title: t("Positions"),
      isActive: false,
    },
  ].map((nav) => {
    if (
      (nav.url === "/" && pathname === nav.url) ||
      (nav.url !== "/" && pathname.startsWith(nav.url))
    ) {
      nav.isActive = true;
    }
    nav.url += query;
    return nav;
  });

  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
      <div className="max-w-5xl mx-auto">
        <div className="py-1 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 px-4">
          <div className="relative flex items-center">
            <Link
              href={"/" + query}
              className="mr-6 flex-none overflow-hidden md:w-auto"
            >
              {/* <MdCurrencyBitcoin className="w-8 h-8 text-[#F7931A]" /> */}
              <Image src="/fav.svg" alt="logo" width={32} height={32} />
            </Link>

            <div className="relative flex items-center ml-6">
              <nav className="leading-6 font-medium text-primary dark:text-slate-200">
                <ul className="flex space-x-8 text-[15px]">
                  {navList.map((nav, idx) => {
                    return (
                      <li className="space-x-8" key={idx}>
                        <Link
                          className={
                            nav.isActive
                              ? "text-blue-600"
                              : "hover:text-blue-500"
                          }
                          href={nav.url}
                        >
                          {nav.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="relative flex items-center ml-auto">
              <div className="flex items-center border-l border-slate-200 ml-6 pl-3 dark:border-slate-800">
                <button className="ml-3 block">
                  <CiGlobe className="w-6 h-6 text-blue-600" />
                </button>
                <button className="ml-3 mr-3 block">
                  <CiLight className="w-6 h-6 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;

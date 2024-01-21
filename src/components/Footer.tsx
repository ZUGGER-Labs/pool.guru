"use client";

import { useSearchParams } from "next/navigation";
// import { useTranslation } from "@/i18n/client";
// import { getLang } from "@/i18n/settings";
// import Link from "next/link";

const Footer = () => {
    const searchParams = useSearchParams();
    // const { t } = useTranslation(getLang(searchParams.get("lang")));
    const year = new Date().getFullYear()

    return <footer className="mx-auto flex flex-col p-4">
        <div className="flex flex-col justify-center text-slate-500 items-center">
            <p className="md:text-sm">Copyright © {year === 2024 ? '2024' : `2024 - ${year}`} All Rights Reserved</p>
        </div>
    </footer>
}

export default Footer

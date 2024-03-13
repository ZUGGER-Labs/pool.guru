import Link from "next/link";

const FooterFallback = () => {
    const year = new Date().getFullYear()

    return <footer className="max-w-5xl mx-auto flex flex-col p-2">
        <div className="flex flex-col justify-center text-slate-500 items-center">
            <p className="md:text-sm">Copyright © {year === 2024 ? '2024' : `2024 - ${year}`} All Rights Reserved</p>
        </div>
    </footer>
}

export default FooterFallback

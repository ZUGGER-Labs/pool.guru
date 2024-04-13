import type { Metadata } from "next";
import { Inter, Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const inter = Roboto_Flex({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "PoolGuru",
  description: "PoolGuru",
};
export const runtime = "edge";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ga = process.env.GOOGLE_ANALYTICS;
  const umami = process.env.UMAMI_ID;

  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-[#FAF4F0] min-h-screen")}>
        <Header />
        <div className="mx-auto min-h-[calc(100vh-176px)]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

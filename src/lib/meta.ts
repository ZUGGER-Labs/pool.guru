const meta = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
  title: "Uniswap v3 Pool Liquidity calculator",
  keywords: [
    "Uniswap",
    "Pool",
    "Liquidity",
    "LP",
    "calculator",
    "BlockChain",
    "ETH",
    "Defi",
    "LP APY",
  ],
  description: "Uniswap v3 Liquidity calculator",
  openGraph: {
    title: "Uniswap v3 Pool Liquidity calculator",
    images: "/icon.jpg",
    description:
      "Uniswap v3 Liquidity calculator",
    locale: "en",
    type: "website",
  },
  icons: {
    icon: "/icon.jpg",
    shortcut: "/icon.jpg",
    apple: [
      { url: "/apple-icon.jpg" },
      { url: "/apple-icon-x3.jpg", sizes: "180x180", type: "image/jpg" },
    ],
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },
};

export const title = "DEX pool/position APY";

export default meta;

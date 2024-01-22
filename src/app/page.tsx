import { PageProps } from "@/lib/page";
import Calculator from "@/components/Calculator/Calculator";
import { Token } from "@/interfaces/uniswap.interface";
import { sortTokens } from "@/uniswap/token";

export default async function Home(pageProps: PageProps) {
  const tokens:Token[] = await sortTokens([], 10)
  console.log('tokens:', tokens)

  return (
    <main className="flex flex-col items-center justify-between p-24 md:max-w-[1600px] m-auto">
      <Calculator tokens={tokens} />
    </main>
  );
}

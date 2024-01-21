import { PageProps } from "@/lib/page";
import Calculator from '@/components/Calculator/Calculator';
import { Token } from "@/interfaces/uniswap.interface";

export default function Home(pageProps: PageProps) {
  const tokens: Token[] = [] // getTokens()
  
  return (
    <main className="flex flex-col items-center justify-between p-24 md:max-w-[1600px] m-auto">
      <Calculator tokens={tokens} />
    </main>
  )
}

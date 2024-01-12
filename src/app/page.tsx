import Image from 'next/image'
import { PageProps } from "@/lib/page";
import { Pools } from '@/components/Pools/Pools';

export default function Home(pageProps: PageProps) {
  return (
    <main className="flex flex-col items-center justify-between p-24 max-w-[1600px] m-auto">
      <Pools />
    </main>
  )
}

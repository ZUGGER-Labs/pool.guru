import TopPool from "@/components/Pool/TopPool";
import Link from "next/link";

// Pools List
function Pools() {
  return (
    <main className="flex flex-col items-center justify-between p-24 md:max-w-[1600px] m-auto">
      <TopPool />
    </main>
  );
}

export default Pools;

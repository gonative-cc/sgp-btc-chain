"use client";
import { Faucet } from "@/components/faucet";
import { useFaucet } from "@/lib/stores/balances";
import { useWalletStore } from "@/lib/stores/wallet";
import NFTItems from "@/components/NFTCard/NFTItems";
export default function Home() {
  const wallet = useWalletStore();
  const drip = useFaucet();

  return (
      <div>
          <NFTItems />
      </div>

  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LegacyPaymentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/checkout");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#2D2D2D] flex flex-col items-center justify-center pt-24 text-white">
      <Loader2 className="h-12 w-12 text-[#AE876D] animate-spin mb-4" />
      <p className="text-lg">Redirecting you to the updated checkout…</p>
    </div>
  );
}


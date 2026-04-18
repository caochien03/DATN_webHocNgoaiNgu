"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredAuth } from "@/lib/auth-storage";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    if (getStoredAuth()) {
      setState("in");
    } else {
      setState("out");
      router.replace("/login");
    }
  }, [router]);

  if (state === "loading") {
    return (
      <p className="px-4 py-10 text-center text-sm text-zinc-500">
        Đang kiểm tra đăng nhập…
      </p>
    );
  }
  if (state === "out") {
    return null;
  }
  return <>{children}</>;
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredAuth, isAdminUser } from "@/lib/auth-storage";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }
    if (!isAdminUser(auth.user)) {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <p className="px-4 py-8 text-sm text-muted-foreground">
        Đang kiểm tra quyền…
      </p>
    );
  }

  return <>{children}</>;
}

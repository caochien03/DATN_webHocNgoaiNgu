"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredAuth, isAdminUser } from "@/lib/auth-storage";

export function AuthGate({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "in" | "out" | "forbidden">("loading");

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      setState("out");
      router.replace("/login");
      return;
    }
    if (adminOnly && !isAdminUser(auth.user)) {
      setState("forbidden");
      return;
    }
    setState("in");
  }, [router, adminOnly]);

  if (state === "loading") {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        Đang kiểm tra đăng nhập…
      </p>
    );
  }
  if (state === "out") return null;
  if (state === "forbidden") {
    return (
      <p className="px-4 py-10 text-center text-sm text-red-400">
        Bạn không có quyền truy cập trang này.
      </p>
    );
  }
  return <>{children}</>;
}

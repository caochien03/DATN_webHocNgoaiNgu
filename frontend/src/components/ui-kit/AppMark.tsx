import Image from "next/image";
import { cn } from "@/lib/cn";
import { APP, GRADIENT_DIAGONAL } from "./brand";

export function AppMark({ className }: { className?: string }) {
  return (
    <Image
      src={APP.logo}
      alt={APP.name}
      width={64}
      height={64}
      className={cn("object-contain", className)}
    />
  );
}

export function AvatarCircle({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full font-bold text-white",
        className,
      )}
      style={{ background: GRADIENT_DIAGONAL }}
    >
      {label}
    </span>
  );
}

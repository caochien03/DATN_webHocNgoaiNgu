import { cn } from "@/lib/cn";
import { APP, GRADIENT_DIAGONAL } from "./brand";

export function AppMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center font-bold text-white",
        className,
      )}
      style={{ background: GRADIENT_DIAGONAL }}
    >
      {APP.logoChar}
    </span>
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

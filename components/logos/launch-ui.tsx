import { cn } from "@/lib/utils";

function LaunchUI({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block size-7 shrink-0 overflow-hidden", className)}
    >
      <span
        className="absolute inset-0 bg-[url('/brand/stellarvista-logo.png')] bg-no-repeat"
        style={{ backgroundPosition: "50% 36%", backgroundSize: "216%" }}
      />
    </span>
  );
}

export default LaunchUI;

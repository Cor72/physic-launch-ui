import { cn } from "@/lib/utils";

/* The brand asset is a 1254² lockup: the orbital mark occupies roughly
   y 210–700 and the "stellarvista / SEE PHYSICS IN MOTION" wordmark sits
   below it at y 760–945. Only the mark belongs next to the Chinese
   wordmark we set in text, so the background is scaled and offset to crop
   to the mark alone.

   At 224% the visible window is 1/2.24 of the source (≈560px); an offset of
   50% 25% places that window at y 175–735, which clears the mark on both
   sides and excludes the wordmark. The previous 216% / 50% 36% put the
   window at y 242–822 and so caught the top ~60px of the wordmark as a
   blurred sliver under the mark. */
function LaunchUI({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-block size-7 shrink-0 overflow-hidden",
        className,
      )}
    >
      <span
        className="absolute inset-0 bg-[url('/brand/stellarvista-logo.png')] bg-no-repeat"
        style={{ backgroundPosition: "50% 25%", backgroundSize: "224%" }}
      />
    </span>
  );
}

export default LaunchUI;

import { Inter } from "next/font/google";

/* Latin text and all numerals. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Two families are deliberately *not* webfonts:

   - Chinese. A subsetted Noto Sans SC still costs several MB across the
     weights this page uses, and every target device already ships a
     better-hinted face (PingFang SC, HarmonyOS Sans, Microsoft YaHei).

   - Monospace. It is only ever set at 11px uppercase for figure numbers and
     instrument labels, where the platform mono is indistinguishable from a
     downloaded one — and shipping it would add a build-time dependency on
     fonts.gstatic.com, which is not reachable from much of the audience's
     network.

   Both stacks are composed into --font-sans / --font-mono in globals.css,
   next to the rest of the type tokens. */

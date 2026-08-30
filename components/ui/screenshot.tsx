import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

interface ScreenshotProps {
  srcLight: ImageProps["src"];
  srcDark?: ImageProps["src"];
  alt: string;
  width: number;
  height: number;
  loading?: ImageProps["loading"];
  sizes?: ImageProps["sizes"];
  className?: string;
}

export default function Screenshot({
  srcLight,
  srcDark,
  alt,
  width,
  height,
  loading,
  sizes,
  className,
}: ScreenshotProps) {
  if (!srcDark) {
    return (
      <Image
        src={srcLight}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        className={className}
        unoptimized={typeof srcLight === "string" && srcLight.endsWith(".svg")}
      />
    );
  }

  return (
    <>
      <Image
        src={srcLight}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        className={cn(className, "block dark:hidden")}
        unoptimized={typeof srcLight === "string" && srcLight.endsWith(".svg")}
      />
      <Image
        src={srcDark}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        className={cn(className, "hidden dark:block")}
        unoptimized={typeof srcDark === "string" && srcDark.endsWith(".svg")}
      />
    </>
  );
}

import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

interface ScreenshotProps {
  srcLight: string;
  srcDark?: string;
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
        unoptimized={srcLight.endsWith(".svg")}
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
        unoptimized={srcLight.endsWith(".svg")}
      />
      <Image
        src={srcDark}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        className={cn(className, "hidden dark:block")}
        unoptimized={srcDark.endsWith(".svg")}
      />
    </>
  );
}

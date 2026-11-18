import React from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Universal Brand Logo Component
 * Renders the animated Ulavan Mart brand emblem with consistent dimensions across pages.
 */
export default function BrandLogo({
  href = "/",
  width = 160,
  className = "",
  priority = false,
}) {
  const logoImage = (
    <Image
      src="/images/ulavan-mart-animated.gif"
      alt="Ulavan Mart"
      width={719}
      height={234}
      unoptimized
      priority={priority}
      className={`h-auto object-contain mix-blend-multiply transition-transform duration-200 hover:scale-[1.02] ${className}`}
      style={{ width: `${width}px` }}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="Ulavan Mart — Home"
        className="inline-flex items-center shrink-0 cursor-pointer"
      >
        {logoImage}
      </Link>
    );
  }

  return logoImage;
}

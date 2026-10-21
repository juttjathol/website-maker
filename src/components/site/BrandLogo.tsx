import React from "react";
import { BRAND } from "@/lib/brand";
import { cx } from "@/lib/util";

export function BrandMark({
  size = 34,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cx("webloom-brand-mark", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={BRAND.logoBadge}
        alt={`${BRAND.name} logo`}
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

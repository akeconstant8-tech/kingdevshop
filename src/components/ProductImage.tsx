import { useState } from "react";
import { Crown } from "lucide-react";
import { imageSrcSet, isStorageUrl, resizedImageUrl } from "@/lib/images";

const GRID_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

// Product photos are served as resized WebP copies (see resizedImageUrl): the
// originals weigh 1–3 MB each. If the resized copy fails, fall back to the
// original, then to the crown placeholder.
export function ProductImage({
  src,
  alt,
  className,
  sizes = GRID_SIZES,
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState<"none" | "resized" | "all">("none");

  if (!src || failed === "all") {
    return (
      <div className={`flex items-center justify-center bg-[var(--gradient-royal)] text-primary-foreground/50 ${className ?? ""}`}>
        <Crown className="h-12 w-12" strokeWidth={1} />
      </div>
    );
  }

  const resized = failed === "none" && isStorageUrl(src);
  return (
    <img
      src={resized ? resizedImageUrl(src, 640) : src}
      srcSet={resized ? imageSrcSet(src) : undefined}
      sizes={resized ? sizes : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
      onError={() => setFailed(resized ? "resized" : "all")}
    />
  );
}

import { Crown } from "lucide-react";

export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-[var(--gradient-royal)] text-primary-foreground/50 ${className ?? ""}`}>
        <Crown className="h-12 w-12" strokeWidth={1} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={className} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />;
}

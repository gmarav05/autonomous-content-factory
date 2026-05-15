import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/builder", label: "Campaign Builder" },
  { href: "/results", label: "Results" },
];

interface SiteHeaderProps {
  className?: string;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="text-primary">Autonomous</span>
          <span className="text-muted-foreground">Content Factory</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="secondary" className="hidden md:inline-flex">
            <Link href="/builder" className="gap-2">
              Launch Builder
            </Link>
          </Button>
          <Button asChild size="sm" className="md:hidden">
            <Link href="/builder">Start</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { Briefcase, Building2, BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

const NAV_ICONS: Record<string, React.ElementType> = {
  "/jobs": Briefcase,
  "/companies": Building2,
  "/salaries": BarChart3,
};

export function HeaderClient({
  navLinks,
  children,
}: {
  navLinks: NavLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl transition-shadow duration-300",
        scrolled
          ? "border-border/60 shadow-soft"
          : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="transition-opacity duration-200 hover:opacity-80"
          >
            <Logo />
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = NAV_ICONS[link.href];
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-opacity duration-200",
                        isActive
                          ? "text-foreground/80"
                          : "text-muted-foreground/50 group-hover:text-foreground/70"
                      )}
                    />
                  )}
                  {link.label}
                  {/* Active underline indicator */}
                  {isActive && (
                    <span className="absolute -bottom-[calc(0.375rem+1px)] left-3 right-3 h-[2px] rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions + Mobile Hamburger */}
        <div className="flex items-center gap-0.5">
          {/* Desktop actions (lang, theme, auth) */}
          {children}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl sm:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border/50 px-5 py-4">
            <SheetTitle className="text-left">
              <Logo />
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 px-3 py-4">
            {navLinks.map((link) => {
              const Icon = NAV_ICONS[link.href];
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");

              return (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      "inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-primary" : "text-muted-foreground/60"
                        )}
                      />
                    )}
                    {link.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

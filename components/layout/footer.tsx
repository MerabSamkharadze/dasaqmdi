export function Footer() {
  return (
    <footer className="w-full border-t border-border/30 bg-card/30 py-8 mt-auto">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/50 tracking-normal">
            &copy; {new Date().getFullYear()} დასაქმდი &mdash; dasakmdi.com
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
            <span className="text-[11px] text-muted-foreground/40">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

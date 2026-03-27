export function Footer() {
  return (
    <footer className="w-full border-t border-border/30 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <p className="text-xs text-muted-foreground/60 tracking-normal">
          &copy; {new Date().getFullYear()} დასაქმდი &mdash; dasakmdi.com
        </p>
      </div>
    </footer>
  );
}

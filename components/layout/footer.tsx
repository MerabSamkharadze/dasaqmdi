export function Footer() {
  return (
    <footer className="w-full border-t border-border/60 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} დასაქმდი &mdash; dasakmdi.com
        </p>
      </div>
    </footer>
  );
}

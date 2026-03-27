import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

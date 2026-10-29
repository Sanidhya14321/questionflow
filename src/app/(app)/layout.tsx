import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="app-main flex-grow w-full mx-auto px-5 sm:px-8 lg:px-12 py-9 sm:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}

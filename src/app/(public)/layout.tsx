import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AdminPanel from "@/components/admin/AdminPanel";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <AdminPanel />
    </div>
  );
}

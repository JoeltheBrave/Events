import { CgHeader } from "@/components/CgHeader";
import { Footer } from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CgHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

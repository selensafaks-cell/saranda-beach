import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isLoginPage = false; // login page has its own layout via route grouping below

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-sand pb-20">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-black/5">
        <span className="font-display font-bold text-deepsea">S-Cafe Yönetim</span>
        <form action={logout}>
          <button className="text-sm text-terracotta font-semibold">Çıkış</button>
        </form>
      </header>

      <main className="px-4 py-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 flex justify-around py-2">
        <Link href="/admin/orders" className="flex flex-col items-center px-4 py-1 text-sm font-semibold text-charcoal/70">
          Siparişler
        </Link>
        <Link href="/admin/menu" className="flex flex-col items-center px-4 py-1 text-sm font-semibold text-charcoal/70">
          Menüyü Düzenle
        </Link>
        <Link href="/admin/settings" className="flex flex-col items-center px-4 py-1 text-sm font-semibold text-charcoal/70">
          Ayarlar
        </Link>
      </nav>
    </div>
  );
}

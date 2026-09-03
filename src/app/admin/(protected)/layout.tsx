import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      <header className="flex items-center justify-between px-4 py-3 bg-ink">
        <span className="font-display font-bold text-white">S-Cafe Yönetim</span>
        <form action={logout}>
          <button className="text-sm text-deep font-semibold">Çıkış</button>
        </form>
      </header>

      <main className="px-4 py-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 flex justify-around py-2">
        <Link href="/admin/orders" className="flex flex-col items-center px-3 py-1 text-xs font-semibold text-ink/70">
          Siparişler
        </Link>
        <Link href="/admin/history" className="flex flex-col items-center px-3 py-1 text-xs font-semibold text-ink/70">
          Geçmiş
        </Link>
        <Link href="/admin/menu" className="flex flex-col items-center px-3 py-1 text-xs font-semibold text-ink/70">
          Menü
        </Link>
        <Link href="/admin/settings" className="flex flex-col items-center px-3 py-1 text-xs font-semibold text-ink/70">
          Ayarlar
        </Link>
      </nav>
    </div>
  );
}

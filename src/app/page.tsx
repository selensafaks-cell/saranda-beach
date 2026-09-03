import { createClient } from "@/lib/supabase/server";
import MenuScreen from "@/components/MenuScreen";

export const revalidate = 0; // always fresh - prices/sold-out must be live

export default async function HomePage({
  searchParams
}: {
  searchParams: { location?: string; table?: string };
}) {
  const supabase = createClient();

  const [{ data: categories }, { data: products }, { data: mostLoved }, { data: settings }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("active", true).order("sort_order"),
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("most_loved_products").select("*"),
      supabase.from("settings").select("*").eq("id", 1).single()
    ]);

  // location/table QR param is read here and handed to checkout via the cart flow;
  // MenuScreen doesn't need it directly, checkout page re-reads searchParams.

  return (
    <MenuScreen
      categories={categories ?? []}
      products={products ?? []}
      mostLoved={mostLoved ?? []}
      orderingOpen={settings?.ordering_open ?? true}
      closedMessageTr={settings?.closed_message_tr ?? "Şu anda sipariş alımı kapalı."}
      closedMessageEn={settings?.closed_message_en ?? "We are not taking orders right now."}
    />
  );
}

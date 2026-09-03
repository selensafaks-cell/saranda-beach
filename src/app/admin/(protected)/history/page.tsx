import { createClient } from "@/lib/supabase/server";
import HistoryView from "./HistoryView";

export const revalidate = 0;

export default async function AdminHistoryPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, public_order_number, customer_first_name, customer_last_name, customer_phone, status, total, note, created_at, location_number, locations(name_tr), order_items(name_tr, quantity, unit_price)"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  return <HistoryView orders={orders ?? []} />;
}

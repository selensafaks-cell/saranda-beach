import { createClient } from "@/lib/supabase/server";
import MenuEditor from "./MenuEditor";

export const revalidate = 0;

export default async function AdminMenuPage() {
  const supabase = createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*").order("sort_order")
  ]);

  return <MenuEditor categories={categories ?? []} products={products ?? []} />;
}

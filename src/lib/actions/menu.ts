"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleSoldOut(productId: string, soldOut: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("products").update({ sold_out: soldOut }).eq("id", productId);
  revalidatePath("/admin/menu");
  revalidatePath("/");
  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleActive(productId: string, active: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("products").update({ active }).eq("id", productId);
  revalidatePath("/admin/menu");
  revalidatePath("/");
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePrice(productId: string, price: number) {
  const supabase = createClient();
  if (price < 0 || Number.isNaN(price)) return { error: "INVALID_PRICE" };
  const { error } = await supabase
    .from("products")
    .update({ price, updated_at: new Date().toISOString() })
    .eq("id", productId);
  revalidatePath("/admin/menu");
  revalidatePath("/");
  if (error) return { error: error.message };
  return { success: true };
}

export async function createProduct(input: {
  categoryId: string;
  nameTr: string;
  nameEn: string;
  price: number;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("products").insert({
    category_id: input.categoryId,
    name_tr: input.nameTr,
    name_en: input.nameEn,
    price: input.price
  });
  revalidatePath("/admin/menu");
  revalidatePath("/");
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = createClient();
  // Orders keep a name/price snapshot in order_items, so deleting a product
  // never changes past orders - product_id on old order_items just becomes null.
  const { error } = await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/admin/menu");
  revalidatePath("/");
  if (error) return { error: error.message };
  return { success: true };
}

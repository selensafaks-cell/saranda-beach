"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/lib/types";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createClient();

  const patch: Record<string, unknown> = { status };
  if (status === "accepted") patch.accepted_at = new Date().toISOString();
  if (status === "delivered") patch.completed_at = new Date().toISOString();

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { success: true };
}

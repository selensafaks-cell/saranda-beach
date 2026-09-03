"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleOrderingOpen(open: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("settings")
    .update({ ordering_open: open, updated_at: new Date().toISOString() })
    .eq("id", 1);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleWhatsappNotify(enabled: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("settings")
    .update({ whatsapp_notify_enabled: enabled })
    .eq("id", 1);
  revalidatePath("/admin/settings");
  if (error) return { error: error.message };
  return { success: true };
}

import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).single();

  return <SettingsForm settings={settings} />;
}

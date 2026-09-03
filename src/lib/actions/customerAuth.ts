"use client";

import { createClient } from "@/lib/supabase/client";

export async function customerSignUp(email: string, password: string, firstName: string, lastName: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (!data.user) return { error: "SIGNUP_FAILED" };

  const { error: profileError } = await supabase.from("customers").insert({
    id: data.user.id,
    first_name: firstName.trim(),
    last_name: lastName.trim()
  });
  if (profileError) return { error: profileError.message };

  return { success: true };
}

export async function customerSignIn(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function customerSignOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function customerRequestPasswordReset(email: string) {
  const supabase = createClient();
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/account/reset-password` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { error: error.message };
  return { success: true };
}

export async function customerUpdatePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}

export async function joinHousehold(daireNumber: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "NOT_LOGGED_IN" };

  const trimmed = daireNumber.trim();
  if (!trimmed) return { error: "EMPTY_NUMBER" };

  // find or create the household for this daire number
  let { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("daire_number", trimmed)
    .single();

  if (!household) {
    const { data: created, error: createError } = await supabase
      .from("households")
      .insert({ daire_number: trimmed })
      .select("id")
      .single();
    if (createError) return { error: createError.message };
    household = created;
  }

  const { error: updateError } = await supabase
    .from("customers")
    .update({ household_id: household!.id })
    .eq("id", user.id);
  if (updateError) return { error: updateError.message };

  return { success: true };
}

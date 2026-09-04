"use server";

import { createClient } from "@/lib/supabase/server";
import { Language } from "@/lib/types";
import { notifyStaffOfNewOrder } from "@/lib/actions/push";

interface SubmitOrderInput {
  firstName: string;
  lastName: string;
  phone?: string;
  locationCode?: string; // e.g. 'beach', 'daire'
  locationNumber?: string; // free text, only used for 'daire'
  note?: string;
  language: Language;
  customerId?: string; // set if the guest is logged into an account
  lines: { product_id: string; quantity: number; line_note?: string }[];
}

export async function cancelOrder(orderId: string) {
  const supabase = createClient();
  // Only allowed while status is still 'received' - once Turan starts
  // preparing it, cancelling from the guest side stops making sense.
  // Matches the RLS policy that only permits received -> cancelled.
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("status", "received");
  if (error) return { error: error.message };
  return { success: true };
}
export async function deleteOrder(orderId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function submitOrder(input: SubmitOrderInput) {
  const supabase = createClient();

  if (!input.firstName.trim() || !input.lastName.trim()) {
    return { error: "NAME_REQUIRED" as const };
  }
  if (input.lines.length === 0) {
    return { error: "EMPTY_CART" as const };
  }

  // Check ordering is currently open
  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (settings && settings.ordering_open === false) {
    return { error: "ORDERING_CLOSED" as const };
  }

  // CRITICAL: never trust prices from the client. Re-fetch every product's
  // current price from the DB and rebuild the order server-side.
  const productIds = input.lines.map((l) => l.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name_tr, name_en, price, sold_out, active")
    .in("id", productIds);

  if (productsError || !products) {
    return { error: "PRODUCTS_NOT_FOUND" as const };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItemsPayload: {
    product_id: string;
    name_tr: string;
    name_en: string;
    unit_price: number;
    quantity: number;
    line_note?: string;
  }[] = [];

  for (const line of input.lines) {
    const product = productMap.get(line.product_id);
    if (!product || !product.active) {
      return { error: "PRODUCT_UNAVAILABLE" as const };
    }
    if (product.sold_out) {
      return { error: "PRODUCT_SOLD_OUT" as const, productName: product.name_tr };
    }
    const lineTotal = product.price * line.quantity;
    subtotal += lineTotal;
    orderItemsPayload.push({
      product_id: product.id,
      name_tr: product.name_tr,
      name_en: product.name_en,
      unit_price: product.price,
      quantity: line.quantity,
      line_note: line.line_note
    });
  }

  // Defense in depth: never trust customerId from the client blindly - if
  // it doesn't correspond to a real customers row (e.g. a staff session
  // leaking through), silently treat this as a guest order instead of
  // failing the whole checkout.
  let verifiedCustomerId: string | null = null;
  if (input.customerId) {
    const { data: customerRow } = await supabase
      .from("customers")
      .select("id")
      .eq("id", input.customerId)
      .single();
    verifiedCustomerId = customerRow?.id ?? null;
  }

  // Resolve location id + label from code, if provided
  let locationId: string | null = null;
  let locationLabel = "";
  if (input.locationCode) {
    const { data: loc } = await supabase
      .from("locations")
      .select("id, name_tr")
      .eq("code", input.locationCode)
      .single();
    locationId = loc?.id ?? null;
    locationLabel = loc?.name_tr ?? "";
  }
  if (input.locationNumber) locationLabel = `${locationLabel} ${input.locationNumber}`.trim();

  const total = subtotal; // no discounts/tax logic in Phase 1

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_first_name: input.firstName.trim(),
      customer_last_name: input.lastName.trim(),
      customer_phone: input.phone?.trim() || null,
      customer_id: verifiedCustomerId,
      location_id: locationId,
      location_number: input.locationNumber?.trim() || null,
      status: "received",
      subtotal,
      total,
      note: input.note?.trim() || null,
      language: input.language
    })
    .select()
    .single();

  if (orderError || !order) {
    return { error: "ORDER_CREATE_FAILED" as const };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItemsPayload.map((item) => ({
      order_id: order.id,
      ...item
    }))
  );

  if (itemsError) {
    return { error: "ORDER_ITEMS_FAILED" as const };
  }

  // Push notification to staff phones - silently no-ops if push isn't
  // configured (missing VAPID env vars) or no one has opted in yet.
  notifyStaffOfNewOrder(order.public_order_number, locationLabel).catch(() => {
    // never block order success on a notification failure
  });

  return { success: true as const, orderId: order.id, orderNumber: order.public_order_number };
}

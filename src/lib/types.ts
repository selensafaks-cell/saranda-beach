export type Language = "tr" | "en";

export type OrderStatus =
  | "received"
  | "accepted"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface Category {
  id: string;
  name_tr: string;
  name_en: string;
  sort_order: number;
  active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  price: number;
  image_url: string | null;
  includes_fries: boolean;
  active: boolean;
  sold_out: boolean;
  sort_order: number;
}

export interface LocationOption {
  id: string;
  code: string;
  name_tr: string;
  name_en: string;
  requires_number: boolean;
  sort_order: number;
  active: boolean;
}

export interface CartLine {
  product_id: string;
  name_tr: string;
  name_en: string;
  unit_price: number;
  quantity: number;
  line_note?: string;
}

export interface Settings {
  ordering_open: boolean;
  closed_message_tr: string;
  closed_message_en: string;
}

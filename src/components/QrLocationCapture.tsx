"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "saranda_qr_location_v1";

// QR codes at each zone link to e.g. /?location=beach or /?location=cardak
// This silently captures that into localStorage so checkout can prefill it,
// while the guest can still change it manually at checkout.
export default function QrLocationCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const location = searchParams.get("location");
    if (location) {
      try {
        localStorage.setItem(STORAGE_KEY, location);
      } catch {
        // non-fatal
      }
    }
  }, [searchParams]);

  return null;
}

export function getStoredQrLocation(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

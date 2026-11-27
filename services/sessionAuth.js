"use client";

import { useSyncExternalStore } from "react";

const subscribeSession = (callback) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("ulavan_session_updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("ulavan_session_updated", callback);
  };
};

export const defaultSessionUser = {
  name: "",
  username: "",
  email: "",
  mobile: "",
  role: "unassigned",
  activeRole: "unassigned",
  isPaid: false,
  onboarded: false,
  status: "active",
};

let cachedClientString = null;
let lastRawStorage = null;

function getClientSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify(defaultSessionUser);
  }

  try {
    // Strictly read authoritative backend user object from ulavan_user
    const raw = sessionStorage.getItem("ulavan_user") || "";

    if (raw === lastRawStorage && cachedClientString !== null) {
      return cachedClientString;
    }

    lastRawStorage = raw;

    if (raw) {
      const parsed = JSON.parse(raw);
      cachedClientString = JSON.stringify({
        id: parsed.id || parsed.userId || parsed._id || "",
        name: parsed.name || parsed.username || defaultSessionUser.name,
        username: parsed.username || defaultSessionUser.username,
        email: parsed.email || defaultSessionUser.email,
        mobile: parsed.mobile || defaultSessionUser.mobile,
        role: parsed.role || "unassigned",
        activeRole: parsed.activeRole || (parsed.role ? parsed.role.toLowerCase() : "unassigned"),
        isPaid: Boolean(parsed.isPaid || parsed.sellerPaid || parsed.buyerPaid),
        onboarded: Boolean(parsed.sellerOnboarded || parsed.buyerOnboarded || parsed.onboarded),
        buyerPaid: Boolean(parsed.buyerPaid),
        buyerOnboarded: Boolean(parsed.buyerOnboarded),
        sellerPaid: Boolean(parsed.sellerPaid),
        sellerOnboarded: Boolean(parsed.sellerOnboarded),
        status: parsed.status || "active",
        subType: parsed.subType || null,
        sellerData: parsed.sellerData || null,
        buyerData: parsed.buyerData || null,
        payment: parsed.payment || null,
        buyerPayment: parsed.buyerPayment || null,
        sellerPayment: parsed.sellerPayment || null,
      });
      return cachedClientString;
    }
  } catch {
    // ignore
  }

  cachedClientString = JSON.stringify(defaultSessionUser);
  return cachedClientString;
}

const serverSnapshotString = JSON.stringify(defaultSessionUser);

function getServerSnapshot() {
  return serverSnapshotString;
}

/**
 * useSessionUser hook
 * Provides hydration-safe access to logged-in user credentials from session / local storage.
 */
export function useSessionUser() {
  const authJson = useSyncExternalStore(
    subscribeSession,
    getClientSnapshot,
    getServerSnapshot
  );

  try {
    return JSON.parse(authJson);
  } catch {
    return defaultSessionUser;
  }
}


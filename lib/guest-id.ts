/**
 * Generates or retrieves a persistent anonymous guest identifier.
 * Stored in localStorage so it survives page refreshes but is
 * unique per browser/device.
 */

const STORAGE_KEY = "wedding_guest_id";

function generateId(): string {
  // Simple random hex string (32 chars)
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // Private browsing or storage disabled – generate ephemeral id
    return generateId();
  }
}

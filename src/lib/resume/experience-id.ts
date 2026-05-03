/** Stable id for experience job rows (list keys, drag-drop, localStorage). */
export function newExperienceJobClientKey(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

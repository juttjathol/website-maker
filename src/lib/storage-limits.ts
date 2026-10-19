/**
 * Client-side copy of the hard project-storage caps enforced again by Postgres.
 * These are guardrails for cloud saves; IndexedDB/local downloads remain available
 * when a cloud quota is reached.
 */
export const CLOUD_STORAGE_LIMITS = {
  projectBytes: 1_048_576,
  accountBytes: 5_242_880,
  accountProjects: 25,
  sharedBytes: 167_772_160,
  uploadInputBytes: 10 * 1024 * 1024,
  compressedImageBytes: 200 * 1024,
} as const;

export function serializedProjectBytes(project: unknown): number {
  return new TextEncoder().encode(JSON.stringify(project)).byteLength + 1024;
}

export function cloudQuotaMessage(error: unknown): string | null {
  const record = error && typeof error === "object" ? error as { message?: unknown; details?: unknown; hint?: unknown } : null;
  const message = error instanceof Error
    ? error.message
    : [record?.message, record?.details, record?.hint, error].filter(Boolean).map(String).join(" ");
  if (message.includes("WEBLOOM_PROJECT_TOO_LARGE")) {
    return "This website is larger than the 1 MiB cloud-save limit. It is still saved on this device; remove or compress images, or download a backup.";
  }
  if (message.includes("WEBLOOM_ACCOUNT_QUOTA_EXCEEDED")) {
    return "This account has reached its cloud-save allowance. Your website is still saved on this device; delete unused cloud websites or download a backup.";
  }
  if (message.includes("WEBLOOM_CLOUD_QUOTA_EXCEEDED")) {
    return "Webloom’s shared cloud-save pool is full. Your website is still saved on this device; download a backup or contact Webloom support.";
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${Math.ceil(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

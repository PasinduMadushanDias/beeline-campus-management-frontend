import { CAMPUS_CODE } from "../constants/campus";

/**
 * Parses a QR payload in the format: CAMPUS_CODE-branchId-studentIdNo
 * e.g. "BEELINE-1-A01"
 *
 * studentIdNo never contains a hyphen (letter + 2-digit format, e.g. "A01"),
 * so the payload always splits into exactly 3 hyphen-separated segments.
 *
 * If the campus code segment doesn't match this deployment's CAMPUS_CODE,
 * the QR is treated as belonging to a different campus/deployment instance
 * and is silently rejected (returns null) rather than throwing — consistent
 * with how invalid/malformed payloads were already handled before this change.
 */
export function parseQrPayload(text) {
  if (typeof text !== "string") return null;

  const trimmed = text.trim();
  const parts = trimmed.split("-");
  if (parts.length !== 3) return null;

  const [campusCode, branchIdPart, studentIdNo] = parts;

  if (campusCode !== CAMPUS_CODE) return null;
  if (!/^\d+$/.test(branchIdPart)) return null;
  if (!studentIdNo) return null;

  return { branchId: Number(branchIdPart), studentIdNo };
}

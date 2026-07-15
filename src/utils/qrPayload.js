export function parseQrPayload(text) {
  if (typeof text !== "string") return null;

  const trimmed = text.trim();
  const separatorIndex = trimmed.indexOf("-");
  if (separatorIndex <= 0 || separatorIndex === trimmed.length - 1) return null;

  const branchIdPart = trimmed.slice(0, separatorIndex);
  const studentIdNo = trimmed.slice(separatorIndex + 1);

  if (!/^\d+$/.test(branchIdPart)) return null;
  if (!studentIdNo) return null;

  return { branchId: Number(branchIdPart), studentIdNo };
}
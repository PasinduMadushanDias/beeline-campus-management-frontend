// The local scanner agent runs on the same front-desk PC as the browser — a tiny
// HTTP server wrapping the SecuGen SDK. Browsers exempt 127.0.0.1 from the
// HTTPS-page-calling-HTTP mixed-content block, so the Vercel-hosted frontend can
// fetch this directly. The agent must send Access-Control-Allow-Origin itself.
export const FINGERPRINT_AGENT_URL = "http://127.0.0.1:8765";

const SCAN_TIMEOUT_MS = 20000;

/** Pings the agent's /health endpoint. Resolves false (never throws) if unreachable. */
export async function checkAgentHealth() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${FINGERPRINT_AGENT_URL}/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Triggers a capture on the agent and returns { imageBase64, dpi }.
 * Throws a user-facing message on timeout, agent-not-running, or SDK-reported error.
 */
export async function scanFingerprint() {
  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);
    res = await fetch(`${FINGERPRINT_AGENT_URL}/scan`, { method: "POST", signal: controller.signal });
    clearTimeout(timer);
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Scan timed out. Please try again.");
    throw new Error("Could not reach the fingerprint scanner agent. Is it running on this PC?");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Scanner failed to capture a fingerprint.");
  }
  return res.json();
}

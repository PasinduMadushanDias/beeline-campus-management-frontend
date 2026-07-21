import { useEffect, useRef, useState } from "react";
import { Fingerprint, Loader2, WifiOff, Upload } from "lucide-react";
import { checkAgentHealth, scanFingerprint } from "../../config/fingerprintAgent";

const HEALTH_POLL_MS = 5000;

/**
 * Fingerprint capture UI. Mirrors QRAttendanceScanner's active/onScan contract,
 * but the agent is button-triggered rather than a continuous camera feed — a
 * scan blocks on the SDK waiting for a finger, so there's no live preview to render.
 *
 * onScan receives { imageBase64, dpi }.
 *
 * Includes a "test image" upload fallback so this page is buildable/testable before
 * the SecuGen agent exists — hidden behind a toggle so it never gets in the way of
 * the real flow once hardware is connected.
 */
export default function FingerprintScanner({ active, onScan, busy }) {
  const [agentOnline, setAgentOnline] = useState(null); // null = checking, true/false after first check
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showTestUpload, setShowTestUpload] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const poll = async () => {
      const online = await checkAgentHealth();
      if (!cancelled) setAgentOnline(online);
    };
    poll();
    const interval = setInterval(poll, HEALTH_POLL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [active]);

  if (!active) return null;

  const handleScan = async () => {
    setErrorMsg("");
    setScanning(true);
    try {
      const result = await scanFingerprint();
      onScan(result);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleTestFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1] || "";
      onScan({ imageBase64: base64, dpi: 500 });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const busyNow = scanning || busy;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
        {busyNow ? (
          <Loader2 size={32} className="text-indigo-500 animate-spin" />
        ) : (
          <Fingerprint size={36} className="text-indigo-500" />
        )}
      </div>

      {agentOnline === false && (
        <p className="text-xs text-amber-600 flex items-center gap-1.5 text-center max-w-xs">
          <WifiOff size={13} className="flex-shrink-0" /> Scanner agent not detected on this PC (127.0.0.1:8765). Make sure it's running.
        </p>
      )}

      <button
        type="button"
        onClick={handleScan}
        disabled={busyNow}
        className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
      >
        <Fingerprint size={15} /> {busyNow ? "Waiting for finger..." : "Scan Fingerprint"}
      </button>

      {errorMsg && <p className="text-xs text-red-600 text-center max-w-xs">{errorMsg}</p>}

      <button
        type="button"
        onClick={() => setShowTestUpload((v) => !v)}
        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer underline"
      >
        {showTestUpload ? "Hide test upload" : "No scanner yet? Upload a test image"}
      </button>

      {showTestUpload && (
        <label className="flex items-center gap-1.5 text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-300">
          <Upload size={13} /> Choose image file
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleTestFile} className="hidden" />
        </label>
      )}
    </div>
  );
}

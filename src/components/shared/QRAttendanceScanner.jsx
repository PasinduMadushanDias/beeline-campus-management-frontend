import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, Loader2 } from "lucide-react";

const SCAN_COOLDOWN_MS = 3000; // ignore re-scans of the same sticker while it's still in frame
const READER_ELEMENT_ID = "qr-attendance-reader";

/**
 * Camera-based QR scanner for the Staff Attendance page.
 * Renders nothing when `active` is false, and tears the camera stream down
 * completely on unmount / mode switch so it doesn't keep running in the background.
 */
export default function QRAttendanceScanner({ active, onScan }) {
  const scannerRef = useRef(null);
  const lastScanRef = useRef({ text: "", time: 0 });
  const [status, setStatus] = useState("idle"); // idle | starting | scanning | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!active) {
      stopScanner();
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("starting");
    setErrorMsg("");

    const scanner = new Html5Qrcode(READER_ELEMENT_ID, { verbose: false });
    scannerRef.current = scanner;

    // Track the start() promise so cleanup can wait for it — calling stop() while
    // start() is still in flight (e.g. React StrictMode's mount→cleanup→mount dance
    // in dev) leaves the camera held ("Using now") but with no video ever attached,
    // which is exactly the blank-camera symptom this used to cause.
    const startPromise = scanner
      .start(
        { facingMode: "environment" }, // prefer rear camera on phones
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          const now = Date.now();
          if (decodedText === lastScanRef.current.text && now - lastScanRef.current.time < SCAN_COOLDOWN_MS) {
            return; // same sticker still in frame — ignore
          }
          lastScanRef.current = { text: decodedText, time: now };
          onScan(decodedText);
        },
        () => {} // fires continuously while no QR is in frame — expected, not an error
      )
      .then(() => {
        if (!cancelled) setStatus("scanning");
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(
            err?.name === "NotAllowedError"
              ? "Camera permission denied. Please allow camera access and try again."
              : err?.message || "Could not access camera."
          );
        }
        throw err;
      });

    return () => {
      cancelled = true;
      stopScanner(startPromise);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function stopScanner(pendingStart) {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;

    const doStop = () =>
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          // scanner may already be stopped/not-running — safe to ignore
        });

    // Wait out any in-flight start() first so we never stop mid-initialization.
    if (pendingStart) {
      pendingStart.then(doStop, doStop);
    } else {
      doStop();
    }
  }

  if (!active) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div id={READER_ELEMENT_ID} className="w-full max-w-xs rounded-lg overflow-hidden border-2 border-slate-800" />

      {status === "starting" && (
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Loader2 size={13} className="animate-spin" /> Starting camera...
        </p>
      )}
      {status === "scanning" && (
        <p className="text-xs text-emerald-600 flex items-center gap-1.5">
          <Camera size={13} /> Point the camera at the student's QR sticker
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-600 flex items-center gap-1.5 text-center max-w-xs">
          <CameraOff size={13} className="flex-shrink-0" /> {errorMsg}
        </p>
      )}
    </div>
  );
}
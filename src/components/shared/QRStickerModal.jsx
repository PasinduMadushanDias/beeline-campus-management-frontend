import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Printer, Download } from "lucide-react";
import { CAMPUS_CODE } from "../../constants/campus";

export default function QRStickerModal({ student, onClose }) {
  const canvasWrapRef = useRef(null);

  if (!student) return null;

  // studentIdNo is only unique *within a branch* now (e.g. Galle's A01 and
  // Matara's A01 can coexist), so the QR payload must include branchId to
  // stay globally unique and unambiguous when scanned. branchId is used
  // instead of branchName since branch names could be renamed later.
  // CAMPUS_CODE is prepended to prevent collisions if this codebase is ever
  // deployed as separate, independent campus instances (different DBs) —
  // without it, two deployments could generate identical payloads.
  const qrValue = `${CAMPUS_CODE}-${student.branchId}-${student.studentIdNo}`;

  const handleDownload = () => {
    const qrCanvas = canvasWrapRef.current?.querySelector("canvas");
    if (!qrCanvas) return;

    const width = 320;
    const qrBoxSize = 220;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 32;
    const textStartY = qrBoxY + qrBoxSize + 40;
    const height = textStartY + 60;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    const qrPadding = 20;
    ctx.drawImage(
      qrCanvas,
      qrBoxX + qrPadding,
      qrBoxY + qrPadding,
      qrBoxSize - qrPadding * 2,
      qrBoxSize - qrPadding * 2
    );

    ctx.textAlign = "center";
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText(student.fullName, width / 2, textStartY);

    ctx.fillStyle = "#4f46e5";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText(student.studentIdNo, width / 2, textStartY + 24);

    ctx.fillStyle = "#64748b";
    ctx.font = "13px Arial, sans-serif";
    ctx.fillText(`${student.branchName} Branch`, width / 2, textStartY + 46);

    const link = document.createElement("a");
    link.download = `${student.studentIdNo}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Student QR Sticker</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div id="qr-sticker-printable" className="p-6 flex flex-col items-center text-center gap-3">
          <div ref={canvasWrapRef} className="p-3 bg-white border-2 border-slate-800 rounded-lg">
            <QRCodeCanvas value={qrValue} size={180} level="M" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">{student.fullName}</p>
            <p className="text-sm font-mono text-indigo-600 font-semibold">{student.studentIdNo}</p>
            <p className="text-xs text-slate-500 mt-1">{student.branchName} Branch</p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={15} /> Download QR
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer size={15} /> Print Sticker
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-sticker-printable, #qr-sticker-printable * { visibility: visible; }
          #qr-sticker-printable { position: fixed; top: 0; left: 0; width: 100%; padding-top: 40px; }
        }
      `}</style>
    </div>
  );
}
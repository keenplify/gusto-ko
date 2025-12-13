"use client";

import { Download, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { toast } from "sonner";

interface GCashQRModalProps {
  gcashQRUrl: string;
  wishlistName?: string;
}

export default function GCashQRModal({
  gcashQRUrl,
  wishlistName,
}: GCashQRModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleDownload = async () => {
    try {
      const response = await fetch(gcashQRUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${wishlistName || "wishlist"}-gcash-qr.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("QR code downloaded!");
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download QR code");
    }
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            dialogRef.current?.close();
          }
        }}
      >
        <div className="modal-box flex flex-col gap-4 max-w-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">
              Send via GCash {wishlistName ? `for ${wishlistName}` : ""}
            </h3>
            <button
              onClick={() => dialogRef.current?.close()}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-base-200 rounded-lg p-4 flex justify-center">
            <Image
              src={gcashQRUrl}
              alt="GCash QR Code"
              width={300}
              height={300}
              className="rounded"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-base-content/70">
              Scan this QR code with your GCash app to send money instantly.
            </p>
            <button
              onClick={handleDownload}
              className="btn btn-primary w-full gap-2"
            >
              <Download size={18} /> Download QR Code
            </button>
          </div>

          <form method="dialog">
            <button className="btn btn-ghost w-full">Close</button>
          </form>
        </div>
      </dialog>

      {/* Expose the dialog ref via a function */}
      {Object.assign(
        {},
        {
          showModal: () => dialogRef.current?.showModal(),
        }
      )}
    </>
  );
}

export const useGCashQRModal = () => {
  const dialogRef = useRef<{
    showModal: () => void;
  }>(null);

  return dialogRef;
};

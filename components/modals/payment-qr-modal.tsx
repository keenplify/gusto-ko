"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import { X, QrCode, Gift } from "lucide-react";
import { forwardRef } from "react";

interface PaymentQRModalProps {
  /**
   * The user object containing the gcashQRUrl
   */
  user: Partial<User>;
  /**
   * The formatted amount string (e.g. "P 500.00")
   */
  amount: string;
}

export const PaymentQRModal = forwardRef<
  HTMLDialogElement,
  PaymentQRModalProps
>(({ user, amount }, ref) => {
  const hasQR = !!user.gcashQRUrl;
  const userName = user.name || "the user";

  return (
    <dialog
      ref={ref}
      id="payment_qr_modal"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box p-0 overflow-hidden relative bg-base-100">
        {/* Close Button (X) */}
        <form method="dialog" className="z-10 absolute right-2 top-2">
          <button className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </form>

        {/* Header / Amount Banner */}
        <div className="bg-primary/5 p-6 pb-2 text-center flex flex-col items-center">
          <span className="text-base-content/60 text-xs font-bold uppercase tracking-widest mb-1">
            Gift Value
          </span>
          <span className="text-3xl font-extrabold text-primary">{amount}</span>
          <p className="text-sm mt-2 text-base-content/70">
            Choose how you want to fulfill this wish
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Option 1: GCash / Cash */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <QrCode size={18} />
              <span>Option 1: Send Cash</span>
            </div>

            <div className="w-48 aspect-square relative bg-white rounded-xl border-2 border-base-200 shadow-sm overflow-hidden flex justify-center items-center group">
              {hasQR ? (
                <>
                  <Image
                    src={user.gcashQRUrl!}
                    alt="Payment QR Code"
                    fill
                    className="object-contain p-2"
                    sizes="200px"
                  />
                  {/* Hover/Tap hint */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </>
              ) : (
                <div className="flex flex-col gap-2 items-center text-base-content/30 p-4 text-center">
                  <QrCode size={48} />
                  <span className="text-xs">
                    No QR Code available for {userName}
                  </span>
                </div>
              )}
            </div>

            {hasQR && (
              <p className="text-xs text-center text-base-content/60 max-w-[250px]">
                Scan with GCash to send money directly to{" "}
                <strong>{userName}</strong>.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="divider text-xs font-bold text-base-content/40 my-0">
            OR
          </div>

          {/* Option 2: Physical Gift */}
          <div className="bg-base-200/50 rounded-xl p-4 flex gap-4 items-center border border-base-200">
            <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Gift size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm">Buy & Give Personally</span>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Purchase the item yourself and surprise {userName} with a
                physical gift!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop click to close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
});

PaymentQRModal.displayName = "PaymentQRModal";

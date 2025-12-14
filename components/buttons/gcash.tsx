"use client";

import { QrCode } from "lucide-react";
import { useRef } from "react";
import { User } from "@prisma/client";
import { PaymentQRModal } from "@/components/modals/payment-qr-modal";

interface GCashButtonProps {
  user: Partial<User>;
  sessionUser?: User;
}

export default function GCashButton({ user, sessionUser }: GCashButtonProps) {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="btn btn-success btn-sm gap-2"
        onClick={() => modalRef.current?.showModal()}
      >
        <QrCode size={16} /> Give Cash via GCash QR
      </button>

      <PaymentQRModal ref={modalRef} user={user} sessionUser={sessionUser} />
    </>
  );
}

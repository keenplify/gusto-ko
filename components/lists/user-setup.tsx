"use client";

import { SetupGCashModal } from "@/components/modals/setup-gcash-modal";
import { User } from "@prisma/client";
import { ChevronRight, QrCode } from "lucide-react";
import { useRef, useState } from "react";

interface UserSetupProps {
  user: User;
}

export default function UserSetup({ user }: UserSetupProps) {
  const [openGCash, setOpenGCash] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleOpenModal = () => {
    setOpenGCash(true);
    // Ensure modal opens even if already true
    setTimeout(() => {
      modalRef.current?.showModal();
    }, 0);
  };
  return (
    <>
      <ul className="list bg-base-100 rounded-box shadow-md w-full">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
          Setup your Gustoko.ng
        </li>
        <li className="list-row flex items-center">
          <div>
            <QrCode />
          </div>
          <div className="grow">
            <p className="font-bold"> Setup GCash QR</p>
            <p>
              They can send the amount of GCash they want to send to you here
            </p>
          </div>
          <button
            className="btn btn-square btn-ghost"
            onClick={handleOpenModal}
          >
            <ChevronRight />
          </button>
        </li>
      </ul>
      <SetupGCashModal
        ref={modalRef}
        show={openGCash}
        user={user}
        onSuccess={() => setOpenGCash(false)}
      />
    </>
  );
}

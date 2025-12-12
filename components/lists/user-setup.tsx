"use client";

import { SetupGCashModal } from "@/components/modals/setup-gcash-modal";
import { User } from "@prisma/client";
import { ChevronRight, QrCode } from "lucide-react";
import { useState } from "react";

interface UserSetupProps {
  user: User;
}

export default function UserSetup({ user }: UserSetupProps) {
  const [openGCash, setOpenGCash] = useState(false);
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
            onClick={() => setOpenGCash(true)}
          >
            <ChevronRight />
          </button>
        </li>
      </ul>
      <SetupGCashModal show={openGCash} user={user} />
    </>
  );
}

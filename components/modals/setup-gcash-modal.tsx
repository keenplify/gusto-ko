"use client";

import { User } from "@prisma/client";
import { useEffect, useRef } from "react";

interface SetupGCashModalProps {
  show?: boolean;
  user: User;
}

export function SetupGCashModal({ show }: SetupGCashModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (show) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [show]);

  return (
    <dialog ref={dialogRef} id="add_item_modal" className="modal">
      <div className="modal-box flex flex-col gap-4">
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

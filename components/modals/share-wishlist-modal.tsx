"use client";

import { Share2, Copy, Check } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface ShareWishlistModalProps {
  shareId: string;
  wishlistName?: string;
}

export default function ShareWishlistModal({
  shareId,
  wishlistName,
}: ShareWishlistModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/wishlist/${shareId}`);
  }, [shareId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="btn btn-circle btn-sm btn-ghost"
        title="Share wishlist"
      >
        <Share2 size={18} />
      </button>

      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box flex flex-col gap-4">
          <h3 className="font-bold text-lg">
            Share {wishlistName ? `"${wishlistName}"` : "this wishlist"}
          </h3>

          <div className="space-y-2">
            <p className="text-sm text-base-content/70">
              Share this wishlist with friends and family
            </p>
            <div className="bg-base-200 rounded-lg p-3 break-all text-xs">
              {shareUrl}
            </div>
          </div>

          <button onClick={handleCopyLink} className="btn btn-primary gap-2">
            {copied ? (
              <>
                <Check size={18} /> Copied!
              </>
            ) : (
              <>
                <Copy size={18} /> Copy Link
              </>
            )}
          </button>

          <form method="dialog">
            <button className="btn btn-ghost w-full">Close</button>
          </form>
        </div>
      </dialog>
    </>
  );
}

"use client";

import { Eye, Gift, ImageIcon, PhilippinePeso, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCropImage } from "@/components/providers/CropImageProvider";
import { handleFileUploadAction } from "@/app/actions/upload-actions";
import { type User, type WishlistItem } from "@prisma/client"; // Added User type
import { MonetaryAmount, moneyInputProps } from "@/lib/money";
import { deleteWishlistItem } from "@/app/actions/wishlist-item";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { PaymentQRModal } from "@/components/modals/payment-qr-modal";

interface WishlistItemProps {
  edit?: boolean;
  isOwnWishlist?: boolean;
  item: Partial<WishlistItem>;
  wishlistOwner?: Partial<User>;
  onUpdateItem?: (item: Partial<WishlistItem>) => void;
  onDeleteItem?: () => void;
  path?: string;
  expanded?: boolean;
  disabled?: boolean;
}

export default function WishlistItemCard({
  item,
  onUpdateItem,
  edit,
  isOwnWishlist,
  onDeleteItem,
  path,
  expanded,
  disabled,
  wishlistOwner, // Destructure new prop
}: WishlistItemProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null); // Ref for the Gift Modal

  const cropImage = useCropImage();
  const [uploading, setUploading] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  useEffect(() => {
    setPriceInput(item.price != null ? (item.price / 100).toFixed(2) : "");
  }, [item.price]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    try {
      const croppedFile = await cropImage({
        file,
        props: { aspect: 1 },
        title: "Crop Product Image",
      });

      if (!(croppedFile instanceof File)) return;

      setUploading(true);

      const formData = new FormData();
      formData.append("croppedFile", croppedFile);

      const uploadResult = await handleFileUploadAction(formData);

      const newUrl =
        uploadResult?.url ||
        `${process.env.R2_PUBLIC_ENDPOINT}/${uploadResult.key}`;

      onUpdateItem?.({ ...item, image_url: newUrl });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!item.id) return;

    if (confirm("Are you sure to delete this item?")) {
      const res = await deleteWishlistItem(item.id, path);

      if (res.success) {
        toast.success("Item deleted successfully.");
        if (onDeleteItem) onDeleteItem();
      }
    }
  };

  const handleGiftClick = () => {
    if (!wishlistOwner?.gcashQRUrl) {
      toast.error("This user hasn't set up their GCash QR code yet.");
      return;
    }
    modalRef.current?.showModal();
  };

  // Format price for the modal
  const displayPrice = item.price
    ? MonetaryAmount.fromInteger(item.price).toString()
    : "Any Amount";

  return (
    <>
      <div
        className={twMerge(
          "card flex-row bg-base-300 shadow-sm border-2 border-solid border-primary/10 shrink-0 min-h-0 items-center",
          !expanded && "md:h-[140px]"
        )}
      >
        <figure
          className={twMerge(
            "relative aspect-square flex justify-center items-center bg-base-100 h-full",
            !expanded &&
              "w-[120px] md:w-[136px] md:h-[136px] min-w-[120px] md:min-w-[136px]",
            expanded &&
              "w-full h-auto md:w-[136px] md:h-[136px] md:min-w-[136px]"
          )}
        >
          {item.image_url ? (
            <Image
              src={item.image_url}
              height={136}
              width={136}
              alt="Item Preview"
              className="aspect-square object-contain w-[136px] h-[136px]"
            />
          ) : (
            <ImageIcon size={128} className="opacity-50" />
          )}
          {edit && (
            <div className="absolute inset-0 flex items-end justify-center p-2">
              <label
                className="btn btn-xs btn-primary/90"
                htmlFor={`file-input-${item?.id || "new"}`}
              >
                {uploading ? "Uploading..." : "Change"}
              </label>
              <input
                id={`file-input-${item?.id || "new"}`}
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled || uploading}
                onChange={handleFileChange}
              />
            </div>
          )}
        </figure>
        <div
          className={twMerge(
            "card-body flex flex-col justify-center gap-1 md:gap-2 py-2 px-2 md:py-2 md:px-3 shrink min-w-0",
            !expanded && "flex-1"
          )}
        >
          <h2 className="card-title text-sm md:text-base mt-2 w-full block">
            {edit ? (
              <input
                className="input input-sm text-xs md:text-sm w-full"
                disabled={disabled}
                value={item?.name || ""}
                onChange={(e) =>
                  onUpdateItem?.({ ...item, name: e.target.value })
                }
                placeholder="Item Name"
              />
            ) : (
              <span className="line-clamp-1 text-sm md:text-base wrap-break-word">
                {item.name}
              </span>
            )}
          </h2>
          {edit ? (
            <label className="input input-sm md:input-md">
              <PhilippinePeso size={16} />
              <input
                type="text"
                className="grow text-xs md:text-sm"
                disabled={disabled}
                placeholder="Price"
                {...moneyInputProps({
                  value: priceInput,
                  setValue: setPriceInput,
                  onBlur: () => {
                    onUpdateItem?.({
                      ...item,
                      price: new MonetaryAmount(priceInput).toInteger(),
                    });
                  },
                })}
              />
            </label>
          ) : (
            <span className="flex gap-2 font-bold text-lg md:text-2xl items-center">
              {item.price
                ? MonetaryAmount.fromInteger(item.price).toString()
                : "N/A"}
            </span>
          )}

          {expanded && (
            <div className="flex flex-col">
              {edit ? (
                <>
                  <label className="font-bold" htmlFor="new-notes">
                    Notes
                  </label>
                  <textarea
                    id="new-notes"
                    className="textarea"
                    disabled={disabled}
                    value={item.notes || ""}
                    onChange={(e) =>
                      onUpdateItem?.({
                        ...item,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Why do you want this item?"
                  />
                </>
              ) : (
                <p>{item.notes}</p>
              )}
            </div>
          )}

          {!edit && (
            <div className="card-actions justify-end mb-2">
              {item.original_link && (
                <a
                  href={item.original_link}
                  target="_blank"
                  className="btn btn-ghost btn-sm"
                >
                  <Eye /> <span className="hidden md:block">View</span>
                </a>
              )}
              {!isOwnWishlist ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleGiftClick} // Changed this to use our handler
                >
                  <Gift /> <span className="hidden md:block">Gift</span>
                </button>
              ) : (
                <button
                  className="btn btn-outline btn-error btn-sm"
                  onClick={handleDelete}
                >
                  <Trash /> <span className="hidden md:block">Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render the Modal, kept hidden until .showModal() is called */}
      {wishlistOwner && (
        <PaymentQRModal
          ref={modalRef}
          user={wishlistOwner}
          amount={displayPrice}
        />
      )}
    </>
  );
}

"use client";

import { Eye, Gift, ImageIcon, PhilippinePeso, Trash } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useCropImage } from "@/components/providers/CropImageProvider";
import { handleFileUploadAction } from "@/app/actions/upload-actions";
import { type WishlistItem } from "@prisma/client";
import { MonetaryAmount } from "@/lib/money";
import { deleteWishlistItem } from "@/app/actions/wishlist-item";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

interface WishlistItemProps {
  edit?: boolean;
  isOwnWishlist?: boolean;
  item: Partial<WishlistItem>;
  onUpdateItem?: (item: Partial<WishlistItem>) => void;
  onDeleteItem?: () => void;
  path?: string;
  /**
   * Will show the notes
   */
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
}: WishlistItemProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cropImage = useCropImage();
  const [uploading, setUploading] = useState(false);
  const price = useMemo(
    () => MonetaryAmount.fromInteger(item.price || 0),
    [item]
  );

  // const isShopee = item.original_link?.toLowerCase().includes("shopee");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    try {
      // Let the user crop the image first
      const croppedFile = await cropImage({
        file,
        props: { aspect: 1 },
        title: "Crop Product Image",
      });

      if (!(croppedFile instanceof File)) return;

      setUploading(true);

      const formData = new FormData();
      formData.append("croppedFile", croppedFile);

      // call server action to upload to R2
      const uploadResult = await handleFileUploadAction(formData);

      // Prefer returned url but fallback to constructed R2 url if needed
      const newUrl =
        uploadResult?.url ||
        `${process.env.R2_PUBLIC_ENDPOINT}/${uploadResult.key}`;

      onUpdateItem?.({ ...item, image_url: newUrl });
    } catch (err) {
      // ignore or surface error later
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      // clear file input so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!item.id) {
      return;
    }

    if (confirm("Are you sure to delete this item?")) {
      const res = await deleteWishlistItem(item.id, path);

      if (res.success) {
        toast.success("Item deleted successfully.");

        if (onDeleteItem) {
          onDeleteItem();
        }
      }
    }
  };

  return (
    <div
      className={twMerge(
        "card card-side bg-base-300 shadow-sm flex items-center border-2 border-solid border-primary/10 shrink-0 min-h-0",
        !expanded && "h-[140px]"
      )}
    >
      <figure className="relative w-[136px] h-[136px] min-w-[136px] aspect-square flex justify-center items-center bg-base-100">
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
      <div className="card-body flex flex-col justify-center">
        <h2 className="card-title">
          {edit ? (
            <input
              className="input"
              disabled={disabled}
              value={item?.name || ""}
              onChange={(e) =>
                onUpdateItem?.({ ...item, name: e.target.value })
              }
              placeholder="Item Name"
            />
          ) : (
            <span>{item.name}</span>
          )}
        </h2>
        {edit ? (
          <label className="input">
            <PhilippinePeso />
            <input
              type="text"
              className="grow"
              disabled={disabled}
              placeholder="Price"
              value={item.price || ""}
              onChange={(e) =>
                onUpdateItem?.({
                  ...item,
                  price: Number.parseInt(e.target.value) * 100,
                })
              }
            />
          </label>
        ) : (
          <span className="flex gap-2 font-bold text-2xl items-center">
            {item.price ? price.toString() : "N/A"}
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
          <div className="card-actions justify-end">
            {item.original_link && (
              <a
                href={item.original_link}
                target="_blank"
                className="btn btn-ghost"
              >
                <Eye /> View
              </a>
            )}
            {!isOwnWishlist ? (
              <button className="btn btn-primary">
                <Gift /> Gift
              </button>
            ) : (
              <button
                className="btn btn-outline btn-error"
                onClick={handleDelete}
              >
                <Trash /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

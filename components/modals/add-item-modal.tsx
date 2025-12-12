"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Link } from "lucide-react";
import { type WishlistItem } from "@prisma/client";
import WishlistItemCard from "@/components/cards/wishlist-item";
import { extractMetadataFromUrl } from "@/lib/url";
import { upsertWishlistItemByShareId } from "@/app/actions/wishlist-item";
import { toast } from "sonner";

export default function AddItemModal({
  shareId,
  handleSuccess,
}: {
  shareId: string;
  handleSuccess: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isShopee, setIsShopee] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {} as Partial<WishlistItem>,
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const res = await upsertWishlistItemByShareId(shareId, {
          ...value,
          price: value.price ? value.price * 100 : 0,
        });

        if (!res.success) {
          toast.error(res.reason);
          return;
        }

        toast.success("Wishlist item added successfully");
        handleSuccess();
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const propagateFromUrl = useCallback(
    async (url: string) => {
      if (isShopee) {
        const path = new URL(url).pathname.split("/")[1];
        const trimmed = path.replace(/-i\.\d+.*/, "");
        form.setFieldValue("name", trimmed.replace(/-/g, " "));

        return;
      }

      if (!url) {
        return;
      }

      const res = await extractMetadataFromUrl(url);

      const price = res.priceNumber;
      if (price) {
        form.setFieldValue("price", price);
      }

      const itemName = res.og?.ogTitle;
      if (itemName) {
        form.setFieldValue("name", itemName);
      }

      const image = res.og?.ogImage;

      if (typeof image === "string") {
        form.setFieldValue("image_url", image);
      } else if (typeof image === "object" && !Array.isArray(image)) {
        form.setFieldValue("image_url", image.url);
      } else if (
        Array.isArray(image) &&
        image[0] &&
        typeof image[0] === "string"
      ) {
        form.setFieldValue("image_url", image[0]);
      } else if (
        Array.isArray(image) &&
        image[0] &&
        typeof image[0] === "object"
      ) {
        form.setFieldValue("image_url", image[0].url);
      }
    },
    [form, isShopee]
  );

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = () => {
    router.back();
  };

  return (
    <dialog ref={dialogRef} id="add_item_modal" className="modal">
      <div className="modal-box flex flex-col gap-4">
        <h3 className="font-bold text-lg">Add Item to Wishlist</h3>
        <h4 className="font-bold text-md">Product Link</h4>
        <form.Field
          name="original_link"
          listeners={{
            onChangeDebounceMs: 500,
            onChange: ({ value }) => {
              setIsShopee(!!(value && value.includes("shopee.ph")));
            },
          }}
        >
          {(field) => (
            <label className="input w-full">
              <Link className="h-[1em] opacity-50" />
              <input
                type="url"
                className="grow"
                disabled={isSubmitting}
                onChange={(e) => field.handleChange(e.target.value)}
                value={field.state.value || ""}
                onBlur={(e) => {
                  field.handleBlur();
                  propagateFromUrl(e.currentTarget.value);
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    propagateFromUrl(e.currentTarget.value);
                  }
                }}
                onPaste={(e) => {
                  propagateFromUrl(e.clipboardData.getData("text/plain"));
                }}
              />
            </label>
          )}
        </form.Field>
        {isShopee && (
          <div role="alert" className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Shopee links does not let us grab the product&apos;s price and
              image. You can either input a screenshot of the product below or
              add the price and image manually.
            </span>
          </div>
        )}

        <form.Subscribe>
          {({ values }) => (
            <>
              {values.original_link && !isShopee && (
                <div role="alert" className="alert alert-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>
                    The price filled below might differ from the price at the
                    platform. Please check the current price at the platform and
                    adjust accordingly.
                  </span>
                </div>
              )}
              <WishlistItemCard
                edit={true}
                item={values}
                onUpdateItem={(item) => form.reset(item)}
                expanded
                disabled={isSubmitting}
              />
            </>
          )}
        </form.Subscribe>
        <div className="modal-action">
          <button
            className="btn btn-success"
            onClick={form.handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>

          <form method="dialog">
            <button
              className="btn"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

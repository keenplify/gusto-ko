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

  const form = useForm({
    defaultValues: {
      original_link: "",
    } as Partial<WishlistItem>,
    onSubmit: async ({ value }) => {
      const res = await upsertWishlistItemByShareId(shareId, value);

      if (!res.success) {
        toast.error(res.reason);
        return;
      }

      toast.success("Wishlist item added successfully");
      handleSuccess();
    },
  });

  const propagateFromUrl = useCallback(
    async (url: string) => {
      if (!url) return;
      const _isShopee = url.includes("shopee.ph");

      if (_isShopee) {
        const path = new URL(url).pathname.split("/")[1];
        const trimmed = path.replace(/-i\.\d+.*/, "");
        const current = form.state.values;
        form.reset({ ...current, name: trimmed.replace(/-/g, " ") });
        return;
      }

      const res = await extractMetadataFromUrl(url);

      const price = res.priceNumber;
      const itemName = res.og?.ogTitle;
      const image = res.og?.ogImage;

      const current = form.state.values;
      const updated: Record<string, unknown> = { ...current };

      if (price) updated.price = price;
      if (itemName) updated.name = itemName;

      if (typeof image === "string") {
        updated.image_url = image;
      } else if (typeof image === "object" && !Array.isArray(image)) {
        updated.image_url = image.url;
      } else if (
        Array.isArray(image) &&
        image[0] &&
        typeof image[0] === "string"
      ) {
        updated.image_url = image[0];
      } else if (
        Array.isArray(image) &&
        image[0] &&
        typeof image[0] === "object"
      ) {
        updated.image_url = image[0].url;
      }

      form.reset(updated);
    },
    [form],
  );

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = () => {
    router.back();
  };

  return (
    <dialog
      ref={dialogRef}
      id="add_item_modal"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box flex flex-col gap-4">
        <h3 className="font-bold text-lg">Add Item to Wishlist</h3>

        <div className="bg-base-200 rounded-lg p-3 text-sm space-y-2">
          <p className="font-semibold text-base-content">
            Supported Platforms:
          </p>
          <ul className="space-y-1.5 text-base-content/80">
            <li className="flex gap-2">
              <span className="text-success font-bold">✓</span>
              <span>
                <strong>Lazada</strong> - Price & image will be auto-filled
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-success font-bold">✓</span>
              <span>
                <strong>TikTok Shop</strong> - Price & image will be auto-filled
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-warning font-bold">⚠</span>
              <span>
                <strong>Shopee</strong> - You&apos;ll need to manually add the
                price and image
              </span>
            </li>
          </ul>
        </div>

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
            <label className="input w-full min-h-8">
              <Link className="h-[1em] opacity-50" />
              <input
                type="url"
                className="grow"
                disabled={form.state.isSubmitting}
                onChange={(e) => field.handleChange(e.target.value)}
                value={field.state.value!}
                placeholder="URL"
                onBlur={(e) => {
                  field.handleBlur();
                  propagateFromUrl(e.currentTarget.value);
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text/plain");
                  // update the field value immediately so subscribers and the UI reflect the pasted link
                  propagateFromUrl(pasted);
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
                disabled={form.state.isSubmitting}
              />
            </>
          )}
        </form.Subscribe>
        <div className="modal-action">
          <form.Subscribe>
            {({ isSubmitting }) => (
              <>
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
                    disabled={form.state.isSubmitting}
                  >
                    Close
                  </button>
                </form>
              </>
            )}
          </form.Subscribe>
        </div>
      </div>
    </dialog>
  );
}

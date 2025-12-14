"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import { X, QrCode, Gift, CheckCircle2, ArrowLeft } from "lucide-react";
import { forwardRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner"; // Assuming you use sonner like in your example
import { reserveItem } from "@/app/actions/reservation";
import { MonetaryAmount } from "@/lib/money";

interface PaymentQRModalProps {
  user: Partial<User>;
  amount?: string;
  itemId?: string;
  sessionUser?: User;
}

export const PaymentQRModal = forwardRef<
  HTMLDialogElement,
  PaymentQRModalProps
>(({ user, amount, itemId, sessionUser }, ref) => {
  const hasQR = !!user.gcashQRUrl;
  const userName = user.name || "the user";

  // UI State for toggling views
  const [view, setView] = useState<"options" | "reserve">("options");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize TanStack Form
  const form = useForm({
    defaultValues: {
      nickname: sessionUser?.name || "",
      message: "",
      email: sessionUser?.email || "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("nickname", value.nickname);
        formData.append("message", value.message);
        formData.append("email", value.email);
        if (amount) {
          formData.append(
            "amount",
            new MonetaryAmount(amount!).toInteger().toString()
          );
        }

        if (itemId) {
          formData.append("itemId", itemId);
        }

        if (sessionUser?.id) {
          formData.append("userId", sessionUser.id);
        }

        // Pass null as prevState since we are calling it directly
        const res = await reserveItem(formData);

        if (!res.success) {
          toast.error(res.error || "Failed to reserve item");
          return;
        }

        toast.success("Item marked as fulfilled!");

        handleClose();
        form.reset();
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    console.log("closing", ref);
    // @ts-expect-error - Close method exists on dialog ref
    ref?.current?.close();
    setView("options");
  };

  return (
    <dialog
      ref={ref}
      id="payment_qr_modal"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box p-0 overflow-hidden relative bg-base-100 transition-all">
        <form method="dialog" className="z-10 absolute right-2 top-2">
          <button
            className="btn btn-sm btn-circle btn-ghost"
            type="button"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </form>

        <div className="bg-primary/5 p-6 pb-2 text-center flex flex-col items-center">
          <span className="text-base-content/60 text-xs font-bold uppercase tracking-widest mb-1">
            Gift Value
          </span>
          <span className="text-3xl font-extrabold text-primary">
            {amount || "Any Amount"}
          </span>
          <p className="text-sm mt-2 text-base-content/70">
            {view === "options"
              ? "Choose how you want to fulfill this wish"
              : amount
              ? "Confirm your reservation"
              : "Confirm your GCash Gift"}
          </p>
        </div>

        <div className="p-6">
          {view === "options" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <QrCode size={18} />
                  <span>Send Cash via GCash</span>
                </div>

                <div className="w-48 aspect-square relative bg-white rounded-xl border-2 border-base-200 shadow-sm overflow-hidden flex justify-center items-center group">
                  {hasQR ? (
                    <Image
                      src={user.gcashQRUrl!}
                      alt="Payment QR Code"
                      fill
                      className="object-contain p-2"
                      sizes="200px"
                    />
                  ) : (
                    <div className="flex flex-col gap-2 items-center text-base-content/30 p-4 text-center">
                      <QrCode size={48} />
                      <span className="text-xs">No QR Code available</span>
                    </div>
                  )}
                </div>

                {hasQR && (
                  <p className="text-xs text-center text-base-content/60 max-w-[250px]">
                    {amount ? (
                      <>
                        Scan to send money. Don&apos;t forget to reserve the
                        item below so others know!
                      </>
                    ) : (
                      <>
                        Scan to send money. Don&apos;t forget to click the
                        button to let {user.name} know!
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="divider text-xs font-bold text-base-content/40 my-0">
                THEN
              </div>

              <div className="bg-base-200/50 rounded-xl p-4 flex flex-col gap-3 border border-base-200">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <Gift size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-sm">
                      {amount ? "Mark as Fulfilled" : "Mark as Sent"}
                    </span>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                      Sent cash or bought the gift personally? Let {userName}{" "}
                      know!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setView("reserve")}
                  className="btn btn-secondary btn-sm w-full"
                >
                  {amount ? "Reserve / I Bought This" : "GCash Already Sent!"}
                </button>
              </div>
            </div>
          )}

          {view === "reserve" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => setView("options")}
                className="flex items-center gap-1 text-xs hover:underline text-base-content/50 w-fit"
              >
                <ArrowLeft size={14} /> Back to options
              </button>

              <form.Field name="nickname">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Your Name (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Ninong John"
                      className="input input-bordered w-full"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="message">
                {(field) => (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Message (Optional)
                      </span>
                    </label>
                    <textarea
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enjoy your gift! Sent via GCash."
                      className="textarea textarea-bordered h-24 w-full"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </form.Field>

              <button
                type="button"
                onClick={form.handleSubmit}
                className="btn btn-primary w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirm & Notify {userName}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={handleClose}>
          close
        </button>
      </form>
    </dialog>
  );
});

PaymentQRModal.displayName = "PaymentQRModal";

"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import { X } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useCropImage } from "@/components/providers/CropImageProvider";
import { handleFileUploadAction } from "@/app/actions/upload-actions";
import { toast } from "sonner";
import { updateUserGCashQRUrl, removeUserGCashQRUrl } from "@/app/actions/user";

interface SetupGCashModalProps {
  show?: boolean;
  user: User;
  onSuccess?: () => void;
}

const STEPS = [
  {
    image: "/gcash-instructions/1.png",
    text: "Open the GCash app and tap the QR icon at the bottom center of the screen.",
  },
  {
    image: "/gcash-instructions/2.png",
    text: "Tap on 'Generate QR' located at the bottom left corner.",
  },
  {
    image: "/gcash-instructions/3.png",
    text: "Select 'Receive money via QR Code' from the menu options.",
  },
  {
    image: "/gcash-instructions/4.png",
    text: "Save the generated QR code to your gallery. Then, upload that image using the button below.",
  },
];

export const SetupGCashModal = forwardRef<
  HTMLDialogElement,
  SetupGCashModalProps
>(({ show, user, onSuccess }, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImage = useCropImage();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const dialog =
      ref && "current" in ref
        ? ref.current
        : (ref as unknown as HTMLDialogElement);
    if (!dialog) return;

    if (show) {
      try {
        dialog.showModal();
        setStep(1);
      } catch (err) {
        console.error("Error opening modal:", err);
      }
    } else {
      try {
        dialog.close();
      } catch (err) {
        console.error("Error closing modal:", err);
      }
    }
  }, [show, ref]);

  const handleNext = () => {
    setStep((prev) => (prev < STEPS.length ? prev + 1 : prev));
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    try {
      // Let the user crop the image first
      const croppedFile = await cropImage({
        file,
        props: { aspect: 1 },
        title: "Crop GCash QR Code",
      });

      if (!(croppedFile instanceof File)) return;

      setUploading(true);

      const formData = new FormData();
      formData.append("croppedFile", croppedFile);

      // call server action to upload to R2
      const uploadResult = await handleFileUploadAction(formData);
      const newUrl =
        uploadResult?.url ||
        `${process.env.R2_PUBLIC_ENDPOINT}/${uploadResult.key}`;

      // Update user's gcashQRUrl
      const res = await updateUserGCashQRUrl(newUrl);

      if (res.success) {
        toast.success("GCash QR uploaded successfully!");
        onSuccess?.();
      } else {
        toast.error(res.reason || "Failed to save GCash QR URL");
      }
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Failed to upload GCash QR image");
    } finally {
      setUploading(false);
      // clear file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentStepData = STEPS[step - 1];
  const hasGCashQR = !!user.gcashQRUrl;

  const handleRemoveQR = async () => {
    if (confirm("Are you sure you want to remove your GCash QR code?")) {
      setUploading(true);
      try {
        const res = await removeUserGCashQRUrl();

        if (res.success) {
          toast.success("GCash QR removed successfully!");
          onSuccess?.();
        } else {
          toast.error(res.reason || "Failed to remove GCash QR");
        }
      } catch (err) {
        console.error("Remove failed", err);
        toast.error("Failed to remove GCash QR");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <dialog
      ref={ref}
      id="setup_gcash_modal"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box flex flex-col gap-4">
        {hasGCashQR ? (
          <>
            <h3 className="font-bold text-lg">Your GCash QR Code</h3>

            <div className="flex flex-col gap-4 items-center">
              {/* Show uploaded GCash QR */}
              <div className="relative w-full max-w-sm aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                <Image
                  src={user.gcashQRUrl!}
                  alt="Your GCash QR Code"
                  fill
                  className="object-contain"
                />
                {/* Remove button - X icon at top right */}
                <button
                  onClick={handleRemoveQR}
                  disabled={uploading}
                  className="absolute top-2 right-2 btn btn-circle btn-sm btn-error text-white hover:btn-error/80"
                  title="Remove GCash QR"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-center text-base-content/70">
                Your GCash QR code is set up. You can change it anytime by
                uploading a new image below.
              </p>

              {/* Upload new QR option */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Change QR Code</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileChange}
                />
              </div>

              {uploading && (
                <p className="text-sm font-medium text-primary">Uploading...</p>
              )}
            </div>

            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg">
              Setup GCash QR (Step {step} of {STEPS.length})
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                <Image
                  src={currentStepData.image}
                  alt={`Instruction step ${step}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Instruction Section */}
              <div className="flex flex-col gap-4">
                <p className="text-base font-medium">{currentStepData.text}</p>

                {/* Show Upload Button only on Step 4 */}
                {step === 4 && (
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Upload QR Screenshot</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      className="file-input file-input-bordered w-full"
                      onChange={handleFileChange}
                    />
                    {uploading && (
                      <p className="text-sm font-medium text-primary mt-2">
                        Uploading...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-action justify-between">
              {/* Back / Close Logic */}
              {step > 1 ? (
                <button
                  className="btn btn-neutral"
                  onClick={handleBack}
                  disabled={uploading}
                >
                  Back
                </button>
              ) : (
                <form method="dialog">
                  <button className="btn" disabled={uploading}>
                    Close
                  </button>
                </form>
              )}

              {/* Next Button Logic - Hidden on last step */}
              {step < STEPS.length && (
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={uploading}
                >
                  Next
                </button>
              )}

              {/* Optional: 'Finish' or Save button on Step 4 */}
              {step === STEPS.length && (
                <form method="dialog">
                  <button className="btn btn-primary" disabled={uploading}>
                    Done
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </dialog>
  );
});

SetupGCashModal.displayName = "SetupGCashModal";

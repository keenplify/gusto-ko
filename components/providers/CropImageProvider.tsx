/* eslint-disable @next/next/no-img-element */
"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import Cropper from "react-easy-crop";

type CropRequest = {
  file: File;
  title?: ReactNode;
  props: {
    aspect?: number;
  };
  resolve: (result: File) => void; // Resolve to a File
  reject: (reason?: string) => void;
};

type CropImageProps = Omit<CropRequest, "resolve" | "reject">;

type CropImageContextValue = {
  cropImage: (props: CropImageProps) => Promise<File>;
};

const CropImageContext = createContext<CropImageContextValue | undefined>(
  undefined
);

// --- Helper Functions for Cropping using pixel coordinates ---

async function getCroppedImageFileFromPixels(
  image: HTMLImageElement,
  pixelCrop: { x: number; y: number; width: number; height: number },
  fileName: string,
  fileType: string
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  // pixelCrop is already in natural image pixels (react-easy-crop provides this)
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Canvas to Blob failed"));
      const croppedFile = new File([blob], fileName, { type: fileType });
      resolve(croppedFile);
    }, fileType);
  });
}

// --- Custom Hooks ---

export function useCropImage() {
  const ctx = useContext(CropImageContext);
  if (!ctx)
    throw new Error("useCropImage must be used inside <CropImageProvider>");
  return ctx.cropImage;
}

// --- Provider Component ---

export function CropImageProvider({ children }: { children: ReactNode }) {
  const [currentRequest, setCurrentRequest] = useState<CropRequest | null>(
    null
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [src, setSrc] = useState<string>(""); // State for Base64 image URL

  // react-easy-crop state
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const croppedAreaPixelsRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // 1. Initiate Crop Request
  const cropImage = useCallback(({ file, props, title }: CropImageProps) => {
    return new Promise<File>((resolve, reject) => {
      setCurrentRequest({ file, props, title, resolve, reject });
    });
  }, []);

  // 2. Handle Image Loading and Modal Visibility
  useEffect(() => {
    if (currentRequest) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSrc(reader.result as string);
        // reset state
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        croppedAreaPixelsRef.current = null;
        dialogRef.current?.showModal();
      };
      reader.onerror = () => {
        currentRequest.reject("Failed to read image file.");
        setCurrentRequest(null);
      };
      reader.readAsDataURL(currentRequest.file);
    } else {
      dialogRef.current?.close();
      setSrc("");
    }
  }, [currentRequest]);

  const onCropComplete = useCallback(
    (
      _: unknown,
      croppedAreaPixels: { x: number; y: number; width: number; height: number }
    ) => {
      croppedAreaPixelsRef.current = croppedAreaPixels;
    },
    []
  );

  const finishCrop = async () => {
    if (!currentRequest || !imageRef.current || !croppedAreaPixelsRef.current)
      return;

    try {
      const resultFile = await getCroppedImageFileFromPixels(
        imageRef.current,
        croppedAreaPixelsRef.current,
        currentRequest.file.name,
        currentRequest.file.type
      );

      currentRequest.resolve(resultFile);
      setCurrentRequest(null);
      croppedAreaPixelsRef.current = null;
    } catch (error) {
      console.error(error);
      currentRequest.reject("Error generating cropped image.");
      setCurrentRequest(null);
    }
  };

  const cancelCrop = () => {
    if (currentRequest) {
      currentRequest.reject("User canceled cropping");
      setCurrentRequest(null);
      croppedAreaPixelsRef.current = null;
    }
  };

  return (
    <CropImageContext.Provider value={{ cropImage }}>
      {children}
      <dialog
        ref={dialogRef}
        id="crop_image_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        {currentRequest && src && (
          <div className="modal-box flex flex-col gap-4 max-w-2xl w-full">
            <h3 className="font-bold text-lg">
              {currentRequest.title || "Crop Image"}
            </h3>

            <div className="relative w-full h-[420px] bg-gray-100 rounded overflow-hidden">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={currentRequest.props.aspect || 1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              {/* hidden image element used to obtain natural image element for canvas cropping */}
              <img
                ref={(el) => {
                  imageRef.current = el;
                }}
                src={src}
                alt=""
                onLoad={(e) => {
                  imageRef.current = e.currentTarget as HTMLImageElement;
                }}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-3 justify-center">
              <label className="label">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="range range-sm"
              />
            </div>

            <div className="modal-action mt-0 pt-0">
              <button
                className="btn btn-primary"
                onClick={finishCrop}
                disabled={!croppedAreaPixelsRef.current}
              >
                Crop and Save
              </button>
              <form method="dialog">
                <button className="btn" onClick={cancelCrop}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </dialog>
    </CropImageContext.Provider>
  );
}
